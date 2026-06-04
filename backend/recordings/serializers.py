from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Province, ReadingText, Recording, RecordingReview

User = get_user_model()


class ProvinceSerializer(serializers.ModelSerializer):
    approved_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Province
        fields = ['id', 'name', 'code', 'target_count', 'approved_count', 'progress_percentage']


class ReadingTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingText
        fields = ['id', 'title', 'content', 'difficulty', 'is_active', 'created_at']


class RecordingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    text_title = serializers.CharField(source='text.title', read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True)
    province_code = serializers.CharField(source='province.code', read_only=True)

    class Meta:
        model = Recording
        fields = [
            'id', 'user', 'username', 'text', 'text_title',
            'province', 'province_name', 'province_code', 'audio_file',
            'duration', 'volume_db', 'volume_valid', 'status',
            'reject_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'duration', 'volume_db',
            'volume_valid', 'status', 'reject_reason',
            'created_at', 'updated_at',
        ]


class RecordingReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = RecordingReview
        fields = ['id', 'recording', 'reviewer', 'reviewer_name', 'is_valid', 'comment', 'reviewed_at']
        read_only_fields = ['id', 'reviewer', 'reviewed_at']


class ReviewActionSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    comment = serializers.CharField(required=False, default='')


class LeaderboardSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    valid_count = serializers.IntegerField()
    province_name = serializers.CharField(allow_null=True)
