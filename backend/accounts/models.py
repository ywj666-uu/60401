from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    province = models.ForeignKey(
        'recordings.Province',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name='所属省份',
    )
    phone = models.CharField('手机号', max_length=20, blank=True)

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'

    @property
    def valid_recording_count(self):
        return self.recordings.filter(status='approved').count()
