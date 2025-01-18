from rest_framework import serializers
from .models import WasteItem

class WasteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteItem
        fields = ['name', 'category', 'collection_day']

