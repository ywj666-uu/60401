from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'phone', 'province']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            phone=validated_data.get('phone', ''),
            province=validated_data.get('province'),
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    valid_recording_count = serializers.IntegerField(read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone',
            'province', 'province_name', 'valid_recording_count',
            'date_joined',
        ]
        read_only_fields = ['id', 'username', 'date_joined']
