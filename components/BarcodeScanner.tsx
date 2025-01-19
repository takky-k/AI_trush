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
            target: scannerRef.current, // Use the ref to attach the video stream
          },
          decoder: {
            readers: ['ean_reader', 'upc_reader'], // Specify the barcode format (e.g., EAN-13)
          },
          locate: true, // Locate the barcode in the image
        },
        (err) => {
          if (err) {
            console.error(err)
            setScanFailed(true)
            return
          }
          Quagga.start()
        }
      )

      Quagga.onDetected((data) => {
        if (data && data.codeResult && data.codeResult.code) {
          console.log('スキャン:', data);
          Quagga.stop()
          onResult(data.codeResult.code)
        }
      })

      return () => {
        Quagga.stop()
      }
    }
  }, [onResult])

  return (
    <div>
      <div ref={scannerRef} style={{ width: '100%', height: '100%' }} />
      {scanFailed && <p>Failed to initialize barcode scanner. Please try again.</p>}
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onManualSearch}>Manual Search</button>
    </div>
  )
}

