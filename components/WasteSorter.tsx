'use client'

import React, { useState } from 'react';
import { QrCode, Camera, Search } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import CameraCapture from './CameraCapture';
import ManualInput from './ManualInput';
import ResultDisplay from './ResultDisplay';

export default function WasteSorter() {
  const [mode, setMode] = useState<'idle' | 'barcode' | 'camera' | 'manual'>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleResult = async (input: string) => {
    try {
      console.log("Input:", input);
      const response = await fetch('http://localhost:8000/api/classify/waste/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: JSON.stringify({ item: input }),
      });
      const data = await response.json();
      if (data.content === undefined) {
        setResult(`Unable to classify waste. Please try again.`);
      } else {
        setResult(data.content);
      }
    } catch (error) {
      console.error('Error classifying waste:', error);
      setResult('Unable to classify waste. Please try again.');
    }
    setMode('idle');
  };

  const handleCamera = async (result: string, image: string) => {
    console.log("Classification Result:", result);
    console.log("Captured Image Data URL:", image);

    // 必要に応じて状態に保存
    setClassificationResult(result);
    setCapturedImage(image);

    try {
      const blob = await (await fetch(image)).blob();
    const formData = new FormData();
    formData.append("image", blob, "captured_image.jpg"); // ファイル名を指定

    const response = await fetch("http://localhost:8000/api/classify/tensorf/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      },
      body: formData,
    });
      const data = await response.json();
      if (data.content === undefined) {
        setResult(`Unable to classify waste. Please try again.`);
      } else {
        setResult(data.content);
      }
    } catch (error) {
      console.error('Error classifying waste:', error);
      setResult('Unable to classify waste. Please try again.');
    }
    setMode('idle');
  };

  const handleManualSearch = async (input: string) => {
    try {
      console.log("Manual Input:", input);
      const response = await fetch('http://localhost:8000/api/classify/openai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: JSON.stringify({ item: input }),
      });
      const data = await response.json();
      if (data.content === undefined) {
        setResult(`Unable to classify waste. Please try again.`);
      } else {
        setResult(data.content);
      }
    } catch (error) {
      console.error('Error classifying waste:', error);
      setResult('Unable to classify waste. Please try again.');
    }
    setMode('idle');
  };

  return (
    <div className="w-full max-w-md">
      {mode === 'idle' && (
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Scan Barcode</p>
            <button
              onClick={() => setMode('barcode')}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              <QrCode size={24} className="mx-auto" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Identify via Camera</p>
            <button
              onClick={() => setMode('camera')}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Camera size={24} className="mx-auto" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Manual Search</p>
            <button
              onClick={() => setMode('manual')}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <Search size={24} className="mx-auto" />
            </button>
          </div>
        </div>
      )}
      {mode === 'barcode' && (
        <BarcodeScanner
          onResult={handleResult}
          onCancel={() => setMode('idle')}
          onManualSearch={() => setMode('manual')}
        />
      )}
      {mode === 'camera' && (
        <CameraCapture
          onResult={handleCamera}
          onCancel={() => setMode('idle')}
          onManualSearch={() => setMode('manual')}
        />
      )}
      {mode === 'manual' && (
        <ManualInput
          onSubmit={handleManualSearch}
          onCancel={() => setMode('idle')}
        />
      )}
      {result && <ResultDisplay result={result} onClose={() => setResult(null)} />}
    </div>
  );
}

