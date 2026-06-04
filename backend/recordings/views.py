from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, F
from django.conf import settings

from .models import Province, ReadingText, Recording, RecordingReview
from .serializers import (
    ProvinceSerializer, ReadingTextSerializer, RecordingSerializer,
    RecordingReviewSerializer, ReviewActionSerializer, LeaderboardSerializer,
)
from .utils import analyze_audio_volume

User = get_user_model()


class ProvinceListView(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ReadingTextListView(generics.ListAPIView):
    queryset = ReadingText.objects.filter(is_active=True)
    serializer_class = ReadingTextSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None


class RecordingViewSet(viewsets.ModelViewSet):
    serializer_class = RecordingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head']

    def get_queryset(self):
        return Recording.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        audio_file = request.FILES.get('audio_file')
        if not audio_file:
            return Response(
                {'detail': '请上传音频文件', 'volume_valid': False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = analyze_audio_volume(audio_file)
        except Exception:
            return Response(
                {
                    'detail': '音频文件解析失败，请检查文件格式是否正确（支持 m4a/wav/mp3）',
                    'volume_valid': False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        threshold = getattr(settings, 'VOLUME_THRESHOLD_DB', -40.0)
        if not result['is_valid']:
            return Response(
                {
                    'detail': f'音量不达标（当前 {result["volume_db"]} dBFS，要求 ≥ {threshold} dBFS），录音未入库，请在安静环境中保持正常音量重新录制',
                    'volume_valid': False,
                    'volume_db': result['volume_db'],
                    'duration': result['duration'],
                    'threshold': threshold,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        audio_file.seek(0)
        recording = serializer.save(
            user=request.user,
            volume_db=result['volume_db'],
            duration=result['duration'],
            volume_valid=True,
        )

        return Response(
            {
                **RecordingSerializer(recording).data,
                'detail': '录音上传成功，等待审核',
                'volume_valid': True,
                'volume_db': result['volume_db'],
                'duration': result['duration'],
            },
            status=status.HTTP_201_CREATED,
        )


class AdminPendingRecordingsView(generics.ListAPIView):
    serializer_class = RecordingSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = Recording.objects.filter(volume_valid=True)
        status_filter = self.request.query_params.get('status', 'pending')
        if status_filter in ('pending', 'approved', 'rejected'):
            qs = qs.filter(status=status_filter)
        province_id = self.request.query_params.get('province')
        if province_id:
            qs = qs.filter(province_id=province_id)
        return qs.select_related('user', 'text', 'province').order_by('-created_at')


class AdminReviewView(generics.GenericAPIView):
    serializer_class = ReviewActionSerializer
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            recording = Recording.objects.get(pk=pk)
        except Recording.DoesNotExist:
            return Response({'detail': '录音不存在'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_valid = serializer.validated_data['is_valid']
        comment = serializer.validated_data.get('comment', '')

        recording.status = 'approved' if is_valid else 'rejected'
        if not is_valid and comment:
            recording.reject_reason = comment
        recording.save()

        RecordingReview.objects.update_or_create(
            recording=recording,
            defaults={
                'reviewer': request.user,
                'is_valid': is_valid,
                'comment': comment,
            }
        )

        return Response({
            'detail': '审核完成',
            'status': recording.status,
            'province': recording.province.name,
            'province_id': recording.province_id,
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def province_progress_view(request):
    provinces = (
        Province.objects
        .annotate(
            approved_count_agg=Count(
                'recordings',
                filter=Q(recordings__status='approved')
            )
        )
        .all()
    )
    data = []
    for province in provinces:
        approved = province.approved_count_agg
        target = province.target_count
        percentage = min(100, int(approved / target * 100)) if target > 0 else 0
        data.append({
            'id': province.id,
            'name': province.name,
            'code': province.code,
            'target_count': target,
            'approved_count': approved,
            'progress_percentage': percentage,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def leaderboard_view(request):
    users = (
        User.objects
        .select_related('province')
        .annotate(valid_count=Count('recordings', filter=Q(recordings__status='approved')))
        .filter(valid_count__gt=0)
        .order_by('-valid_count')[:50]
    )
    data = [
        {
            'user_id': user.id,
            'username': user.username,
            'valid_count': user.valid_count,
            'province_name': user.province.name if user.province else None,
        }
        for user in users
    ]
    return Response(data)
