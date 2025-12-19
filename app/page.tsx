export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="gradient-text">NicheHunter</span>
          <span className="text-white"> AI</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400">
          Reverse-Engineer Any Niche. Predict What Wins. Build With Precision.
        </p>

        <div className="pt-8">
          <p className="text-cyan-500 font-mono text-sm">
            [ SYSTEM INITIALIZING... ]
          </p>
        </div>
      </div>
    </div>
  );
}
