from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WasteItem
from .serializers import WasteItemSerializer
import os
from dotenv import load_dotenv
import requests
from rest_framework.exceptions import APIException
import openai
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from django.core.files.uploadedfile import UploadedFile
from rest_framework.parsers import MultiPartParser
import tensorflow as tf
import urllib.parse

# load model when app opens
MODEL_PATH = os.path.join("models", "waste_classifier_model.h5")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print("Error loading model:", str(e))
    model = None

# mapping of classes to waste types for tensorflow model
CLASS_MAPPING = {0: "glass", 1: "paper", 2: "cardboard", 3: "plastic", 4: "metal", 5: "trash"} 


load_dotenv()
def call_openai(prompt):
    gpt_key = os.getenv('OPENAI_API')
    if not gpt_key:
        raise ValueError("OpenAI API key is missing. Please set it as 'OPENAI_API' in your environment variables.")
    openai.api_key = gpt_key
    response = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    return response['choices'][0]['message']['content']

class ClassifyByOpenAI(APIView):
    def post(self, request):
        item = request.data.get('item')
        if not item:
            return Response({'error': 'Item is required.'}, status=400)
        print(f"Item: {item}")
        prompt = f"""
Based on the following product information, determine the type of garbage it belongs to using these specific rules:

1. If the product is related to mixed containers, paper, packaging, cardboard, glass bottles, or jars, classify it as: **Recycling**.
2. If the product is related to food scraps, classify it as: **Organics**.
3. If the product is related to yard trimmings or anything not covered by the above categories, classify it as: **Garbage**.

Follow these rules strictly and do not invent new categories.

Product Name: {item}

Answer in the following sentence format:
"<Product Name> belongs to <garbage type>"
"""

        print(prompt)
        text = call_openai(prompt)
        print(text)
        return Response({"content": text})
    
class ClassifyByTensorF(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        if request.path.endswith('/favicon.ico'):
            return Response({'message': 'Ignored favicon request'}, status=204)
        file: UploadedFile = request.FILES.get("image")
        if not file:
            return Response({'error': 'No image file provided.'}, status=400)
        print("File uploaded:", file.name)
        
        try:
            # 画像をテンソル形式に変換
            temp_path = f"/tmp/{file.name}"
            with open(temp_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)
            img = load_img(temp_path, target_size=(150, 150))  # モデルに合わせたサイズ
            img_array = img_to_array(img) / 255.0  # 正規化
            img_array = np.expand_dims(img_array, axis=0)  # バッチ次元を追加

            # モデルで推論を実行
            predictions = model.predict(img_array)
            print("Prediction:", predictions)
            predicted_class = np.argmax(predictions)
            result = CLASS_MAPPING[predicted_class]
            print("Predicted class:", result)

            # 結果をレスポンスとして返す
            return Response({"content": result})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ClassifyWaste(APIView):
    def post(self, request):
        item_code = request.data.get('item')
        print(item_code)
        if not item_code:
            return Response({'error': 'Item code is required.'}, status=400)
        api_key = os.getenv('BARCODE_API')
        print(f"api_key: {api_key}")
        #api_url = f"https://go-upc.com/api/v1/code/{item_code}"
        encoded_barcode = urllib.parse.quote(item_code, encoding="utf-8")
        api_url = f"https://api.jancodelookup.com/?appId={api_key}&query={encoded_barcode}&hits=1&page=1&type=code"
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
            prompt = f"""
            Based on the following product information, determine the type of garbage it belongs to using these specific rules:

1. If the product is related to mixed containers, paper, packaging, cardboard, glass bottles, or jars, classify it as: **Recycling**.
2. If the product is related to food scraps, classify it as: **Organics**.
3. If the product is related to yard trimmings or anything not covered by the above categories, classify it as: **Garbage**.

Follow these rules strictly and do not invent new categories.
           Product Name: {data['product'][0]['itemName']}
            itemImageUrl: {data['product'][0]['itemImageUrl']}
            itemModel: {data['product'][0]['itemModel']}
            makerName: {data['product'][0]['makerName']}

            Answer in the following sentence format:
            "<Product Name> belongs to <garbage type>"
            """
            text = call_openai(prompt)
            return Response({"content": text})
        except requests.exceptions.HTTPError as http_err:
            # Handle HTTP errors
            return Response({'error': f'HTTP error occurred: {http_err}'}, status=response.status_code)
        except requests.exceptions.RequestException as req_err:
            # Handle other request exceptions
            raise APIException(f'API request failed: {req_err}')
        
        """ 
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

