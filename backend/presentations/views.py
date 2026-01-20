from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.core.files.base import ContentFile
from django.conf import settings
from django.db import transaction
import json, re, logging
from django.http import FileResponse, Http404

logger = logging.getLogger(__name__)

from .models import PresentationTemplate, UserPresentation
from .serializers import (
    PresentationTemplateSerializer,
    UserPresentationSerializer,
    UserPresentationCreateSerializer
)
from gigachat import GigaChat
from .utils.pptx_utils import fill_pptx_template
from .utils.image_search import search_image_urls


class PresentationTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PresentationTemplate.objects.all()
    serializer_class = PresentationTemplateSerializer
    def get_serializer(self, *args, **kwargs):
        # Добавляем request в context
        kwargs.setdefault('context', {}).update({'request': self.request})
        return super().get_serializer(*args, **kwargs)


class UserPresentationViewSet(viewsets.ModelViewSet):
    serializer_class = UserPresentationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPresentation.objects.filter(user=self.request.user)
    
  
    def perform_create(self, serializer):
        user = self.request.user

        if user.trial_generations <= 0:
            raise PermissionDenied("Закончились пробные генерации")

        serializer.save(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return UserPresentationCreateSerializer
        return UserPresentationSerializer

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        """Генерация JSON-структуры презентации без уменьшения trial_generations"""
        presentation = self.get_object()
        user_prompt = request.data.get("user_prompt", "").strip()
        image_prompt = request.data.get("image_prompt", "").strip()

        # сохраняем только здесь
        presentation.user_prompt = user_prompt
        presentation.image_prompt = image_prompt

        template_prompt = presentation.template.prompt.strip()
        full_prompt = (
            f"{template_prompt}\n\n"
            f"Дополнение от пользователя:\n{user_prompt}\n\n"
            "Сгенерируй презентацию в JSON формате: "
            "каждый слайд содержит номер, заголовок и описание. Ответ строго JSON."
        )
        presentation.full_prompt = full_prompt

        try:
            giga = GigaChat(
                credentials=settings.GIGACHAT_CREDENTIALS,
                scope="GIGACHAT_API_PERS",
                model="GigaChat-2",
                verify_ssl_certs=False
            )
            response = giga.chat(f"Ты создаёшь JSON-структуру презентации.\n{full_prompt}")
            raw = response.choices[0].message.content

            # Улучшенная очистка JSON из ответа GigaChat
            cleaned = raw.strip()

            # Убираем markdown code blocks (```json ... ``` или ``` ... ```)
            code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', cleaned)
            if code_block_match:
                cleaned = code_block_match.group(1).strip()

            # Если не нашли code block, пробуем найти JSON напрямую
            if not code_block_match:
                # Ищем первую { или [ и последнюю } или ]
                json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', cleaned)
                if json_match:
                    cleaned = json_match.group(1)

            try:
                parsed = json.loads(cleaned)
            except json.JSONDecodeError:
                parsed = {"error": "GigaChat вернул невалидный JSON", "raw": raw}

            # Если GigaChat вернул ошибку (невалидный JSON или явную ошибку),
            # удаляем созданный UserPresentation чтобы не оставлять пустые сущности.
            if isinstance(parsed, dict) and parsed.get("error"):
                try:
                    pres_id = presentation.id
                    presentation.delete()
                    logger.warning("Deleted presentation %s due to invalid GigaChat response", pres_id)
                except Exception as del_err:
                    logger.error("Failed to delete presentation %s: %s", presentation.id, del_err)

                return Response({"error": "GigaChat вернул невалидный JSON", "raw": raw}, status=400)

            presentation.data = parsed
            presentation.save()

            return Response({"id": presentation.id, "data": presentation.data})

        except Exception as e:
            logger.exception("Error generating presentation %s", presentation.id)
            # При любой ошибке во время генерации — удаляем объект презентации,
            # чтобы не оставлять пустые/некорректные записи.
            try:
                pres_id = presentation.id
                presentation.delete()
                logger.warning("Deleted presentation %s due to exception", pres_id)
            except Exception as del_err:
                logger.error("Failed to delete presentation %s: %s", presentation.id, del_err)

            return Response({"error": "Не удалось сгенерировать презентацию", "details": str(e)}, status=400)

    @action(detail=True, methods=["post"])
    def save_data(self, request, pk=None):
        """
        Сохраняет data и генерирует PPTX.
        Уменьшает trial_generations только при успешной генерации.
        Операции обёрнуты в транзакцию для консистентности данных.
        """
        presentation = self.get_object()
        user = request.user
        data = request.data.get("data")

        if not data:
            return Response({"error": "Нет data"}, status=400)

        # Проверяем trial_generations до начала операций
        if user.trial_generations <= 0:
            return Response({"error": "Закончились пробные генерации"}, status=403)

        image_prompt = presentation.image_prompt

        # подбираем картинки (до двух) - вне транзакции, т.к. это внешний API
        image_urls = []
        if image_prompt:
            image_urls = search_image_urls(image_prompt, count=2)

        try:
            # Оборачиваем все операции с БД в транзакцию
            with transaction.atomic():
                # сохраняем структуру слайдов
                presentation.data = data

                # генерируем pptx, если есть шаблон
                if presentation.template.pptx_file:
                    pptx_io = fill_pptx_template(
                        presentation.template.pptx_file.path,
                        data,
                        image_urls=image_urls
                    )
                    presentation.pptx_file.save(
                        f"{presentation.title}.pptx",
                        ContentFile(pptx_io.read()),
                        save=False
                    )

                presentation.save()

                # уменьшаем trial_generations в той же транзакции
                user.trial_generations -= 1
                user.save()

            logger.info("Successfully saved presentation %s for user %s", presentation.id, user.id)

            return Response({
                "id": presentation.id,
                "pptx_file": presentation.pptx_file.url if presentation.pptx_file else None
            })

        except Exception as e:
            logger.exception("Error saving presentation %s", presentation.id)
            return Response(
                {"error": "Ошибка при генерации PPTX", "details": str(e)},
                status=500
            )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        pres = self.get_object()
        if not pres.pptx_file:
            raise Http404("Файл ещё не создан")
        return FileResponse(
            pres.pptx_file.open(),
            as_attachment=True,
            filename=f"{pres.title}.pptx"
        )
