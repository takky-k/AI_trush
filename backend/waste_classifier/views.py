from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WasteItem
from .serializers import WasteItemSerializer

class ClassifyWaste(APIView):
    def post(self, request):
        item_name = request.data.get('item')
        try:
            waste_item = WasteItem.objects.get(name__iexact=item_name)
            serializer = WasteItemSerializer(waste_item)
            return Response(serializer.data)
        except WasteItem.DoesNotExist:
            # In a real-world scenario, you would call the ChatGPT API here
            # For now, we'll return a mock response
            mock_data = {
                'name': item_name,
                'category': 'Recyclable',
                'collection_day': 'Wednesday'
            }
            return Response(mock_data)

