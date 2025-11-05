import { Film, Download, Expand, LayoutGrid, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';

function ShotCardSkeleton({ ratioClass = "aspect-video" }) {
  return (
    <div className={`${ratioClass} bg-gray-300 animate-pulse border-4 border-black`}></div>
  );
}

function ShotCard({ src, sceneNumber, shotNumber, onImageClick, ratioClass = "aspect-video" }) {
  if (!src) {
    return <ShotCardSkeleton ratioClass={ratioClass} />;
  }

  return (
    <div className={`relative group ${ratioClass} bg-black border-4 border-black overflow-hidden shadow-lg`}>
      <img
        src={src}
        alt={`Scene ${sceneNumber} Shot ${shotNumber}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <button
          onClick={() => onImageClick(src)}
          className="p-2 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
          aria-label="View shot"
        >
          <Expand className="w-5 h-5" />
        </button>
        <a
          href={src}
          download={`scene-${sceneNumber}-shot-${shotNumber}.png`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
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
    <section ref={sceneRef} className="bg-white border-4 border-black p-4 sm:p-6 neo-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 pb-5 border-b-4 border-black">
        <div>
          <h3 className="text-2xl font-bold text-black">Scene {sceneNumber}</h3>
          <p className="text-gray-700 italic mt-1">Action: "{scene.actionPrompt}"</p>
          {scene.backgroundPrompt && (
            <p className="text-gray-700 italic mt-1 text-sm">Setting: "{scene.backgroundPrompt}"</p>
          )}
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {scene.isSubjectRemoved && (
              <span className="inline-block bg-red-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                MAIN SUBJECT REMOVED
              </span>
            )}
            {scene.isOverrideMode && (
              <span className="inline-block bg-green-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                OVERRIDE MODE
              </span>
            )}
            {scene.isSceneLocked && (
              <span className="inline-block bg-blue-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                SCENE LOCKED
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {scene.baseRefPreview && !scene.baseRefPreview.includes("STYLE-ONLY") && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">
                {scene.isOverrideMode ? "Source" : "Character"}
              </span>
              <img src={scene.baseRefPreview} alt="Character" className="w-14 h-14 object-cover border-4 border-black" />
            </div>
          )}
          {scene.styleRefPreview && !scene.styleRefPreview.includes("NO-STYLE") && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">Style</span>
              <img src={scene.styleRefPreview} alt="Style" className="w-14 h-14 object-cover border-4 border-black" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

      <div className="mt-6 flex justify-center">
        <button
          onClick={onAddNewScene}
          className="neo-button bg-blue-400 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Another Scene
        </button>
      </div>
    </section>
  );
}

export default function StoryboardView({ scenes, onImageClick, onAddNewScene, onBackToStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 border-4 border-black p-3 neo-shadow">
              <Film className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-black">Your Storyboard</h1>
          </div>
          <button
            onClick={onBackToStart}
            className="neo-button bg-gray-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Start Over
          </button>
        </div>

        {scenes.length === 0 ? (
          <div className="bg-white border-4 border-black neo-shadow p-12 text-center">
            <LayoutGrid className="w-24 h-24 mb-6 mx-auto text-gray-400" />
            <h3 className="text-2xl font-bold">Your Storyboard is Empty</h3>
            <p className="mt-2 max-w-sm mx-auto text-gray-600">
              Complete the steps to generate your first scene.
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
  );
}
