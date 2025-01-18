from django.urls import path
from .views import ClassifyWaste

urlpatterns = [
    path('classify/', ClassifyWaste.as_view(), name='classify_waste'),
]

