import { Film, Download, Expand, LayoutGrid, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';

function ShotCardSkeleton({ ratioClass = "aspect-video" }) {
  return (
    <div className={`${ratioClass} bg-white/5 animate-pulse border border-white/10 rounded-xl`}></div>
  );
}

function ShotCard({ src, sceneNumber, shotNumber, onImageClick, ratioClass = "aspect-video" }) {
  if (!src) {
    return <ShotCardSkeleton ratioClass={ratioClass} />;
  }

  return (
    <div className={`relative group ${ratioClass} bg-black border border-white/20 overflow-hidden rounded-xl hover-lift`}>
      <img
        src={src}
        alt={`Scene ${sceneNumber} Shot ${shotNumber}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm flex items-center justify-center gap-3">
        <button
          onClick={() => onImageClick(src)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white border border-white/20 transition-all hover:scale-110"
          aria-label="View shot"
        >
          <Expand className="w-5 h-5" />
        </button>
        <a
          href={src}
          download={`scene-${sceneNumber}-shot-${shotNumber}.png`}
          onClick={(e) => e.stopPropagation()}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white border border-white/20 transition-all hover:scale-110"
          aria-label="Download shot"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

function SceneCard({ scene, sceneNumber, onImageClick, onAddNewScene }) {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (scene.isNew && sceneRef.current) {
      sceneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scene.isNew = false;
    }
  }, [scene.isNew]);

  const ratioClass = scene.aspectRatio === "9:16 portrait" ? "aspect-[9/16]" : "aspect-video";

  return (
    <section ref={sceneRef} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl animate-fadeIn hover-lift">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <h3 className="text-lg font-bold text-white">Scene {sceneNumber}</h3>
            </div>
          </div>
          <p className="text-gray-300 mb-2">
            <span className="text-gray-500 text-sm font-medium">Action:</span> {scene.actionPrompt}
          </p>
          {scene.backgroundPrompt && (
            <p className="text-gray-300 text-sm">
              <span className="text-gray-500 text-sm font-medium">Setting:</span> {scene.backgroundPrompt}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {scene.isSubjectRemoved && (
              <span className="inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-medium text-red-400">
                Subject Removed
              </span>
            )}
            {scene.isOverrideMode && (
              <span className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-medium text-green-400">
                Override Mode
              </span>
            )}
            {scene.isSceneLocked && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400">
                Scene Locked
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {scene.baseRefPreview && !scene.baseRefPreview.includes("STYLE-ONLY") && (
            <div className="text-center">
              <span className="block text-xs font-medium text-gray-400 mb-2">
                {scene.isOverrideMode ? "Source" : "Character"}
              </span>
              <img src={scene.baseRefPreview} alt="Character" className="w-16 h-16 object-cover border-2 border-white/20 rounded-lg" />
            </div>
          )}
          {scene.styleRefPreview && !scene.styleRefPreview.includes("NO-STYLE") && (
            <div className="text-center">
              <span className="block text-xs font-medium text-gray-400 mb-2">Style</span>
              <img src={scene.styleRefPreview} alt="Style" className="w-16 h-16 object-cover border-2 border-white/20 rounded-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {scene.generatedShots.map((src, index) => (
          <ShotCard
            key={index}
            src={src}
            sceneNumber={sceneNumber}
            shotNumber={index + 1}
            onImageClick={onImageClick}
            ratioClass={ratioClass}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onAddNewScene}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add Another Scene
        </button>
      </div>
    </section>
  );
}

export default function StoryboardView({ scenes, onImageClick, onAddNewScene, onBackToStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">Your Storyboard</h1>
                <p className="text-gray-400 mt-1">Professional 9-shot scenes for your project</p>
              </div>
            </div>
            <button
              onClick={onBackToStart}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Start Over
            </button>
          </div>

          {scenes.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 lg:p-20 text-center animate-fadeIn">
              <LayoutGrid className="w-24 h-24 mb-6 mx-auto text-gray-600" />
              <h3 className="text-2xl font-bold text-white mb-3">Your Storyboard is Empty</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Complete the steps to generate your first scene with 9 cinematic shots.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {scenes.map((scene, index) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  sceneNumber={index + 1}
                  onImageClick={onImageClick}
                  onAddNewScene={onAddNewScene}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
