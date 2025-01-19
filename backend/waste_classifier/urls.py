from django.urls import path
from .views import ClassifyWaste, ClassifyByOpenAI

urlpatterns = [
    path('classify/waste/', ClassifyWaste.as_view(), name='classify_waste'),
    path('classify/openai/', ClassifyByOpenAI.as_view(), name='classify_openai'),
]

