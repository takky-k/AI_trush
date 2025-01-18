interface ResultDisplayProps {
  result: string
  onClose: () => void
}

export default function ResultDisplay({ result, onClose }: ResultDisplayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Waste Classification Result</h2>
        <p className="mb-6 text-gray-700">{result}</p>
        <button
          onClick={onClose}
          className="w-full bg-green-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}

