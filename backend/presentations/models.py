from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PresentationTemplate(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название шаблона")
    prompt = models.TextField(verbose_name="Базовый промт", blank=True)
    slides_count = models.PositiveIntegerField(default=0, verbose_name="Количество слайдов")
    images_count = models.PositiveIntegerField(default=0, verbose_name="Количество изображений")
    description = models.TextField(verbose_name="Описание шаблона", blank=True)
    pptx_file = models.FileField(upload_to="template_pptx/", verbose_name="PPTX шаблон", blank=True, null=True)

    class Meta:
        verbose_name = "Шаблон презентации"
        verbose_name_plural = "Шаблоны презентаций"

    def __str__(self):
        return self.title


class UserPresentation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_presentations")
    template = models.ForeignKey(PresentationTemplate, on_delete=models.CASCADE, related_name="user_presentations")
    title = models.CharField(max_length=255)
    user_prompt = models.TextField(blank=True)
    full_prompt = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    pptx_file = models.FileField(upload_to="user_presentations/", verbose_name="PPTX презентация", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image_prompt = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"



class TemplateImage(models.Model):
    """Изображения, относящиеся к шаблону презентации."""
    template = models.ForeignKey(
        PresentationTemplate,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="template_images/", verbose_name="Изображение")

    def __str__(self):
        return f"Image for {self.template.title}"


