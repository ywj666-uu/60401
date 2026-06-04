from django.contrib import admin
from .models import Province, ReadingText, Recording, RecordingReview


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'target_count', 'approved_count', 'progress_percentage']
    search_fields = ['name', 'code']


@admin.register(ReadingText)
class ReadingTextAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'is_active', 'created_at']
    list_filter = ['difficulty', 'is_active']
    search_fields = ['title', 'content']


@admin.action(description='批准选中的录音')
def approve_recordings(modeladmin, request, queryset):
    queryset.update(status='approved')


@admin.action(description='拒绝选中的录音')
def reject_recordings(modeladmin, request, queryset):
    queryset.update(status='rejected')


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ['user', 'text', 'province', 'status', 'volume_db', 'volume_valid', 'duration', 'created_at']
    list_filter = ['status', 'volume_valid', 'province']
    search_fields = ['user__username', 'text__title']
    readonly_fields = ['volume_db', 'volume_valid', 'duration', 'created_at', 'updated_at']
    actions = [approve_recordings, reject_recordings]


@admin.register(RecordingReview)
class RecordingReviewAdmin(admin.ModelAdmin):
    list_display = ['recording', 'reviewer', 'is_valid', 'reviewed_at']
    list_filter = ['is_valid']
    readonly_fields = ['reviewed_at']
