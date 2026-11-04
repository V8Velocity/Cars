from django.urls import path
from . import views

urlpatterns = [
    path('', views.PaymentCreateView.as_view(), name='payment-create'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('<int:pk>/process/', views.PaymentProcessView.as_view(), name='payment-process'),
    path('<int:pk>/refund/', views.RefundCreateView.as_view(), name='payment-refund'),
    path('webhook/', views.WebhookView.as_view(), name='payment-webhook'),
]
