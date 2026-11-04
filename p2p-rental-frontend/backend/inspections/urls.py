from django.urls import path
from . import views

urlpatterns = [
    path('', views.InspectionCreateView.as_view(), name='inspection-create'),
    path('<int:pk>/', views.InspectionDetailView.as_view(), name='inspection-detail'),
    path('booking/<int:booking_id>/summary/', views.BookingInspectionSummaryView.as_view(), name='inspection-summary'),
]
