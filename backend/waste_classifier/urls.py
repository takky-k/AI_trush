from django.urls import path
from .views import ClassifyWaste, ClassifyByOpenAI

urlpatterns = [
    path('classify/', ClassifyWaste.as_view(), name='classify_waste'),
    path('classify_opeai/', ClassifyByOpenAI.as_view(), name='classify_waste_opeai'),
]

