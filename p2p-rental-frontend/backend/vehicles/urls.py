from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.VehicleListView.as_view(), name='vehicle-list'),
    path('<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),

    # Owner
    path('mine/', views.OwnerVehicleListCreateView.as_view(), name='owner-vehicle-list-create'),
    path('<int:pk>/edit/', views.OwnerVehicleDetailView.as_view(), name='owner-vehicle-detail'),
    path('<int:pk>/submit/', views.VehicleSubmitView.as_view(), name='vehicle-submit'),
]
