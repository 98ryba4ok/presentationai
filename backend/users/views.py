from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from django.core.mail import send_mail # type: ignore
from .utils_email import render_verification_email_html
from django.contrib.auth import authenticate, get_user_model # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
import time, random 
from .models import VerificationCode
from .serializers import UserSerializer
from .utils import verification_codes, validate_registration_data
from django.utils import timezone
from datetime import timedelta
CODE_RESEND_DELAY = 30  # секунд

User = get_user_model()

class ChangePasswordView(APIView):
    """Изменение пароля (только новый, требует авторизацию)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_password = request.data.get("new_password")

        if not new_password:
            return Response({"error": "Поле 'new_password' обязательно"}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({"error": "Пароль должен быть не менее 6 символов"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Пароль успешно изменён"}, status=status.HTTP_200_OK)
    
class UserRootView(APIView):
    """Главная страница API для /api/users/"""
    def get(self, request):
        return Response({
            "endpoints": {
                "register_send_code": "/api/users/register/send-code/",
                "register_verify_code": "/api/users/register/verify-code/",
                "login_send_code": "/api/users/login/send-code/",
                "login_verify_code": "/api/users/login/verify-code/",
            }
        })

# ---------- РЕГИСТРАЦИЯ ----------
class LogoutView(APIView):
    """Выход: черный список refresh-токена"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh-токен обязателен"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()  # заносим токен в черный список

            return Response({"message": "Вы успешно вышли"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Ошибка при выходе: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        

class RegisterSendCodeView(APIView):
    """Регистрация: отправка кода пользователю"""
    def post(self, request):
        email = request.data.get("email")
        name = request.data.get("name")
        password = request.data.get("password")

        if not email or not name or not password:
            return Response({"error": "Имя, email и пароль обязательны"}, status=400)

        # Проверка на частую отправку
        last_code = VerificationCode.objects.filter(email=email).order_by("-created_at").first()
        if last_code and (timezone.now() - last_code.created_at).total_seconds() < CODE_RESEND_DELAY:
            remaining = CODE_RESEND_DELAY - int((timezone.now() - last_code.created_at).total_seconds())
            return Response({"error": f"Подождите {remaining} сек перед повторной отправкой"}, status=429)

        code = str(random.randint(10000, 99999))
        VerificationCode.objects.create(
            email=email, code=code, name=name, password=password
        )

        # Отправка письма
        html_message = render_verification_email_html(code)
        send_mail(
            subject="Код для регистрации",
            message=f"Ваш код: {code}",
            from_email="presentationaipro@gmail.com",
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )

        return Response({"message": "Код отправлен на email"}, status=200)


class LoginSendCodeView(APIView):
    """Вход: отправка кода пользователю"""
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(email=email, password=password)
        if not user:
            return Response({"error": "Неверный email или пароль"}, status=400)

        last_code = VerificationCode.objects.filter(email=email).order_by("-created_at").first()
        if last_code and (timezone.now() - last_code.created_at).total_seconds() < CODE_RESEND_DELAY:
            remaining = CODE_RESEND_DELAY - int((timezone.now() - last_code.created_at).total_seconds())
            return Response({"error": f"Подождите {remaining} сек перед повторной отправкой"}, status=429)

        code = str(random.randint(10000, 99999))
        VerificationCode.objects.create(email=email, code=code)

        html_message = render_verification_email_html(code)
        send_mail(
            subject="Код для входа",
            message=f"Ваш код: {code}",
            from_email="presentationaipro@gmail.com",
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )

        return Response({"message": "Код отправлен на email"}, status=200)

class RegisterVerifyCodeView(APIView):
    """Проверка кода регистрации и создание пользователя"""
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        try:
            code_obj = VerificationCode.objects.get(email=email, code=code)
        except VerificationCode.DoesNotExist:
            return Response({"error": "Неверный код"}, status=400)

        # Создание пользователя
        user = User.objects.create_user(
            email=email, name=code_obj.name, password=code_obj.password
        )
        code_obj.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Регистрация успешна",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "trial_generations": user.trial_generations
            },
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)}
        }, status=200)


class LoginVerifyCodeView(APIView):
    """Проверка кода для входа и выдача токенов"""
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        try:
            code_obj = VerificationCode.objects.get(email=email, code=code)
        except VerificationCode.DoesNotExist:
            return Response({"error": "Неверный код"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)

        code_obj.delete()
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Успешный вход",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "trial_generations": user.trial_generations
            },
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)}
        }, status=200)



# ---------- ВХОД ----------



class MeView(APIView):
    """Возвращает профиль текущего пользователя"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=200)