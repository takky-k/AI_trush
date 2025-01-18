'use client'

import { useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { Camera, Search } from 'lucide-react'

interface CameraCaptureProps {
  onResult: (result: string) => void
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
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }
  }

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        
        // Load MobileNet model
        const model = await mobilenet.load()
        
        // Create an HTMLImageElement from the canvas data
        const img = new Image()
        img.src = imageData
        await new Promise((resolve) => { img.onload = resolve })
        
        // Classify the image
        const predictions = await model.classify(img)
        
        if (predictions && predictions.length > 0) {
          const result = `${predictions[0].className} should go in the recyclable bin.`
          setClassificationResult(result)
          onResult(result)
        } else {
          setClassificationResult('Unable to identify object')
        }
      }
    }
  }

  return (
    <div className="relative">
      {!capturedImage ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-64 bg-gray-200 rounded-lg overflow-hidden ${isCapturing ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" width="640" height="480" />
          {!isCapturing ? (
            <button
              onClick={startCapture}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              <Camera className="inline-block mr-2" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={captureImage}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Camera className="inline-block mr-2" />
              Capture Image
            </button>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full rounded-lg" />
          {classificationResult && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
              {classificationResult}
            </div>
          )}
          {classificationResult === 'Unable to identify object' && (
            <button
              onClick={onManualSearch}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <Search className="inline-block mr-2" />
              Search Manually
            </button>
          )}
        </div>
      )}
      <button
        onClick={onCancel}
        className="mt-2 w-full bg-red-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Cancel
      </button>
    </div>
  )
}

