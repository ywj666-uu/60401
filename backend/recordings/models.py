from django.db import models
from django.conf import settings


class Province(models.Model):
    name = models.CharField('省份名称', max_length=50, unique=True)
    code = models.CharField('省份代码', max_length=10, unique=True)
    target_count = models.IntegerField('目标录音数', default=100)

    class Meta:
        verbose_name = '省份'
        verbose_name_plural = '省份'
        ordering = ['pk']

    def __str__(self):
        return self.name

    @property
    def approved_count(self):
        return self.recordings.filter(status='approved').count()

    @property
    def progress_percentage(self):
        if self.target_count == 0:
            return 0
        return min(100, int(self.approved_count / self.target_count * 100))


class ReadingText(models.Model):
    DIFFICULTY_CHOICES = [
        (1, '简单'),
        (2, '中等'),
        (3, '困难'),
    ]

    title = models.CharField('标题', max_length=200)
    content = models.TextField('朗读内容')
    difficulty = models.IntegerField('难度', choices=DIFFICULTY_CHOICES, default=1)
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '朗读文本'
        verbose_name_plural = '朗读文本'
        ordering = ['difficulty', 'pk']

    def __str__(self):
        return self.title


class Recording(models.Model):
    STATUS_CHOICES = [
        ('pending', '待审核'),
        ('approved', '已通过'),
        ('rejected', '已拒绝'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recordings',
        verbose_name='录音者',
    )
    text = models.ForeignKey(
        ReadingText,
        on_delete=models.CASCADE,
        related_name='recordings',
        verbose_name='朗读文本',
    )
    province = models.ForeignKey(
        Province,
        on_delete=models.CASCADE,
        related_name='recordings',
        verbose_name='方言省份',
    )
    audio_file = models.FileField('音频文件', upload_to='recordings/%Y/%m/%d/')
    duration = models.FloatField('时长(秒)', null=True, blank=True)
    volume_db = models.FloatField('平均音量(dBFS)', null=True, blank=True)
    volume_valid = models.BooleanField('音量合格', default=False)
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES, default='pending')
    reject_reason = models.CharField('拒绝原因', max_length=200, blank=True)
    created_at = models.DateTimeField('上传时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '录音'
        verbose_name_plural = '录音'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['province', 'status']),
        ]

    def __str__(self):
        return f'{self.user.username} - {self.text.title} ({self.get_status_display()})'


class RecordingReview(models.Model):
    recording = models.OneToOneField(
        Recording,
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='录音',
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviews',
        verbose_name='审核人',
    )
    is_valid = models.BooleanField('是否有效')
    comment = models.TextField('审核意见', blank=True)
    reviewed_at = models.DateTimeField('审核时间', auto_now_add=True)

    class Meta:
        verbose_name = '审核记录'
        verbose_name_plural = '审核记录'

    def __str__(self):
        status = '通过' if self.is_valid else '拒绝'
        return f'{self.recording} - {status}'
