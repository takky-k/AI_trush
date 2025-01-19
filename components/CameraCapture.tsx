import React from 'react';
import Quagga from 'quagga'; // Ensure Quagga is installed and imported

interface CameraCaptureProps {
  onResult: (itemCode: string) => void;
  onCancel: () => void;
  onManualSearch: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onResult, onCancel, onManualSearch }) => {
  const capture = async () => {
    const imageData = 'data:image/png;base64,...'; // Replace with actual capture logic
    // Simulate extracting item code from image
    console.log("HELOOOOO");
    const itemCode = await extractItemCodeFromImage(imageData);
    console.log("WORRRRDDDDD")
    onResult(itemCode);
  };

  const extractItemCodeFromImage = async (imageData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      Quagga.decodeSingle(
        {
          src: imageData, // Base64-encoded image or URL
          numOfWorkers: 0, // 0 means it will use the main thread
          decoder: {
            readers: ['ean_reader'], // Specify the barcode format (e.g., EAN-13)
          },
          locate: true, // Locate the barcode in the image
        },
        (result: Quagga.DecodeSingleResult) => {
          if (result && result.codeResult) {
            resolve(result.codeResult.code);
          } else {
            reject('Barcode not found');
          }
        }
      );
    });
  };

  return (
    <div>
      <button onClick={capture}>Capture</button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onManualSearch}>Manual Search</button>
    </div>
  );
};

export default CameraCapture;
