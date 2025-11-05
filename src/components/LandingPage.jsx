import { Film, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white border-4 border-black neo-shadow p-8 md:p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-yellow-400 border-4 border-black p-4 neo-shadow inline-block">
              <Film className="w-16 h-16 text-black" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            Music Video Shot Generator
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Create professional 9-shot storyboards for your music videos with AI
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
            <div className="bg-blue-100 border-4 border-black p-6 neo-shadow">
              <Sparkles className="w-10 h-10 text-black mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Upload Character</h3>
              <p className="text-sm text-gray-700">Define your main subject or style reference</p>
            </div>

            <div className="bg-yellow-100 border-4 border-black p-6 neo-shadow">
              <Zap className="w-10 h-10 text-black mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Set the Vibe</h3>
              <p className="text-sm text-gray-700">Choose aesthetic and lighting style</p>
            </div>

            <div className="bg-green-100 border-4 border-black p-6 neo-shadow">
              <Film className="w-10 h-10 text-black mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Generate Scenes</h3>
              <p className="text-sm text-gray-700">Create 9 cinematic shots instantly</p>
            </div>
          </div>

          <button
            onClick={onStart}
            className="neo-button bg-yellow-400 text-xl flex items-center gap-3 mx-auto group"
          >
            Start Creating
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
