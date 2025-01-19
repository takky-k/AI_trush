from django.urls import path
from .views import ClassifyWaste, ClassifyByOpenAI, ClassifyByTensorF

urlpatterns = [
    path('classify/waste/', ClassifyWaste.as_view(), name='classify_waste'),
    path('classify/openai/', ClassifyByOpenAI.as_view(), name='classify_openai'),
    path('classify/tensorf/', ClassifyByTensorF.as_view(), name='classify_tensorf'),
]

