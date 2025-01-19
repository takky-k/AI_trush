'use client'
import React, { useRef, useState } from 'react'
import { Camera, Search } from 'lucide-react'

interface CameraCaptureProps {
  onResult: (result: string, image: string) => void
  onCancel: () => void
  onManualSearch: () => void
}

export default function CameraCapture({ onResult, onCancel, onManualSearch }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [classificationResult, setClassificationResult] = useState<string | null>(null)

  const startCapture = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCapturing(true)
          console.log("Camera started successfully.")
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        alert('Unable to access the camera. Please check permissions.')
      }
    } else {
      alert("Camera is not supported on this device.")
    }
  }

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData()
            formData.append('image', blob, 'captured_image.jpg')

            try {
              const response = await fetch('http://localhost:8000/api/classify/tensorf/', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
                },
                body: formData,
              });
              const data = await response.json();
              if (data.content === undefined) {
                setClassificationResult(`Unable to classify waste. Please try again.`);
              } else {
                setClassificationResult(data.content);
                onResult(data.content, URL.createObjectURL(blob));
              }
            } catch (error) {
              console.error('Error classifying waste:', error);
              setClassificationResult('Unable to classify waste. Please try again.');
            }
          }
        }, 'image/jpeg');
      }
    }
  }

  return (
    <div>
      <div className="flex justify-center">
        <video ref={videoRef} width="640" height="480" autoPlay className="border" />
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={startCapture} className="bg-blue-500 text-white py-2 px-4 rounded mr-2">
          Start Capture
        </button>
        <button onClick={captureImage} className="bg-green-500 text-white py-2 px-4 rounded mr-2">
          Capture Image
        </button>
        <button onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
          Cancel
        </button>
        <button onClick={onManualSearch} className="bg-purple-500 text-white py-2 px-4 rounded">
          Manual Search
        </button>
      </div>
      {classificationResult && (
        <div className="mt-4 text-center">
          <p>Classification Result: {classificationResult}</p>
        </div>
      )}
    </div>
  )
}