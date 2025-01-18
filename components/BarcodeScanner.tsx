'use client'

import { useEffect, useRef, useState } from 'react'
import Quagga from 'quagga'
import { Search } from 'lucide-react'

interface BarcodeScannerProps {
  onResult: (result: string) => void
  onCancel: () => void
  onManualSearch: () => void
}

export default function BarcodeScanner({ onResult, onCancel, onManualSearch }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [scanFailed, setScanFailed] = useState(false)

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment',
            },
            target: scannerRef.current,
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: 2,
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error('Error initializing Quagga:', err)
            return
          }
          Quagga.start()
        }
      )

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          onResult(result.codeResult.code)
          Quagga.stop()
        }
      })

      // Set a timeout to show the manual search button if scanning fails
      const timeout = setTimeout(() => {
        setScanFailed(true)
      }, 10000) // 10 seconds timeout

      return () => {
        Quagga.stop()
        clearTimeout(timeout)
      }
    }
  }, [onResult])

  return (
    <div className="relative">
      <div ref={scannerRef} className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden" />
      {scanFailed && (
        <button
          onClick={onManualSearch}
          className="mt-4 w-full bg-purple-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <Search className="inline-block mr-2" />
          Search Manually
        </button>
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

