import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Ranked Log</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/log"
            className="bg-blue-600 hover:bg-blue-700 p-8 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Log a Game</h2>
            <p className="text-gray-300">Record your performance</p>
          </Link>

          <Link
            href="/stats"
            className="bg-purple-600 hover:bg-purple-700 p-8 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">View Stats</h2>
            <p className="text-gray-300">Analyze your performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
