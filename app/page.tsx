import WasteSorter from '../components/WasteSorter'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-cover bg-center" style={{backgroundImage: "url('/images/forest-background.jpg')"}}>
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Waste Sorter</h1>
        <WasteSorter />
      </div>
    </main>
  )
}

