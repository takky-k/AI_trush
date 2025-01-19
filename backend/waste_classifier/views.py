from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WasteItem
from .serializers import WasteItemSerializer
import os
from dotenv import load_dotenv
import requests
from rest_framework.exceptions import APIException
import openai

load_dotenv()
class ClassifyWaste(APIView):
    def post(self, request):
        item_code = request.data.get('item')
        print("あああああああああああああ")
        print(item_code)
        if not item_code:
            return Response({'error': 'Item code is required.'}, status=400)
        api_key = os.getenv('BARCODE_API')
        print(f"api_key: {api_key}")
        api_url = f"https://go-upc.com/api/v1/code/{item_code}"
        # Make the API request
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
            }
            response = requests.get(api_url, headers=headers)
            # Raise an exception for HTTP errors
            response.raise_for_status()
            # Parse the response JSON
            data = response.json()
            if data:
                print(data)
            
            # open ai
            load_dotenv()
            gpt_key = os.getenv('OPENAI_API')
            print(f"api_key: {gpt_key}")
            if not gpt_key:
                raise ValueError("OpenAI API key is missing. Please set it as 'OPENAI_API' in your environment variables.")
            openai.api_key = gpt_key
            prompt = f"""
            Based on the following product information, determine the type of garbage it would belong to (e.g., recyclable, organic, general waste, etc.):

            Product Name: {data['product']['name']}
            Description: {data['product']['description']}
            Category: {data['product']['category']}
            Ingredients: {data['product']['ingredients']['text']}

            Answer in the following sentence format:
            "<Product Name> belongs to <garbage type>"
            """
            response = openai.ChatCompletion.create(
                    model = "gpt-3.5-turbo",
                    messages = [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
            
            # Process and return the relevant data to the client
            text = response['choices'][0]['message']['content']
            print(text)
            return Response({"content": text})
        except requests.exceptions.HTTPError as http_err:
            # Handle HTTP errors
            return Response({'error': f'HTTP error occurred: {http_err}'}, status=response.status_code)
        except requests.exceptions.RequestException as req_err:
            # Handle other request exceptions
            raise APIException(f'API request failed: {req_err}')
        
        """ あとで使う
        try:
            waste_item = WasteItem.objects.get(name__iexact=item_code)
            serializer = WasteItemSerializer(waste_item)
            return Response(serializer.data)
        except WasteItem.DoesNotExist:
            # In a real-world scenario, you would call the ChatGPT API here
            # For now, we'll return a mock response
            mock_data = {
                'name': item_code,
                'category': 'Recyclable',
                'collection_day': 'Wednesday'
            }
            return Response(mock_data)
        """

