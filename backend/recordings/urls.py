from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProvinceListView,
    ReadingTextListView,
    RecordingViewSet,
    AdminPendingRecordingsView,
    AdminReviewView,
    province_progress_view,
    leaderboard_view,
)

router = DefaultRouter()
router.register(r'recordings', RecordingViewSet, basename='recording')

urlpatterns = [
    path('provinces/', ProvinceListView.as_view(), name='province-list'),
    path('texts/', ReadingTextListView.as_view(), name='text-list'),
    path('', include(router.urls)),
    path('admin/recordings/', AdminPendingRecordingsView.as_view(), name='admin-recordings'),
    path('admin/recordings/pending/', AdminPendingRecordingsView.as_view(), name='admin-pending'),
    path('admin/recordings/<int:pk>/review/', AdminReviewView.as_view(), name='admin-review'),
    path('stats/province-progress/', province_progress_view, name='province-progress'),
    path('stats/leaderboard/', leaderboard_view, name='leaderboard'),
]
