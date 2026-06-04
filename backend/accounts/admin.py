from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'province', 'phone', 'valid_recording_count', 'is_staff']
    list_filter = ['is_staff', 'is_active', 'province']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('额外信息', {'fields': ('province', 'phone')}),
    )
