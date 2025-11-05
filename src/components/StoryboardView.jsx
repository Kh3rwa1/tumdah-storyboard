import { Film, Download, Expand, LayoutGrid, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';

function ShotCardSkeleton({ ratioClass = "aspect-video" }) {
  return (
    <div className={`${ratioClass} glass-card animate-pulse`}></div>
  );
}

function ShotCard({ src, sceneNumber, shotNumber, onImageClick, ratioClass = "aspect-video" }) {
  if (!src) {
    return <ShotCardSkeleton ratioClass={ratioClass} />;
  }

  return (
    <div className={`relative group ${ratioClass} glass-card overflow-hidden hover-lift`}>
      <img
        src={src}
        alt={`Scene ${sceneNumber} Shot ${shotNumber}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#10B981]/90 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm flex items-center justify-center gap-3">
        <button
          onClick={() => onImageClick(src)}
          className="p-3 glass-button rounded-xl text-white transition-all hover:scale-110"
          aria-label="View shot"
        >
          <Expand className="w-5 h-5" />
        </button>
        <a
          href={src}
          download={`scene-${sceneNumber}-shot-${shotNumber}.png`}
          onClick={(e) => e.stopPropagation()}
          className="p-3 glass-button rounded-xl text-white transition-all hover:scale-110"
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
    <section ref={sceneRef} className="glass-card-strong p-6 lg:p-8 animate-fadeIn hover-lift">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 pb-6 border-b border-white/20">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-4 py-2 glass-button rounded-lg">
              <h3 className="text-lg font-bold text-white">Scene {sceneNumber}</h3>
            </div>
          </div>
          <p className="text-contrast mb-2">
            <span className="text-contrast opacity-70 text-sm font-semibold">Action:</span> {scene.actionPrompt}
          </p>
          {scene.backgroundPrompt && (
            <p className="text-contrast text-sm">
              <span className="text-contrast opacity-70 text-sm font-semibold">Setting:</span> {scene.backgroundPrompt}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {scene.isSubjectRemoved && (
              <span className="inline-flex items-center px-3 py-1 glass-card text-xs font-semibold text-red-500">
                Subject Removed
              </span>
            )}
            {scene.isOverrideMode && (
              <span className="inline-flex items-center px-3 py-1 glass-card text-xs font-semibold text-[#10B981]">
                Override Mode
              </span>
            )}
            {scene.isSceneLocked && (
              <span className="inline-flex items-center px-3 py-1 glass-card text-xs font-semibold text-[#10B981]">
                Scene Locked
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {scene.baseRefPreview && !scene.baseRefPreview.includes("STYLE-ONLY") && (
            <div className="text-center">
              <span className="block text-xs font-semibold text-contrast opacity-70 mb-2">
                {scene.isOverrideMode ? "Source" : "Character"}
              </span>
              <img src={scene.baseRefPreview} alt="Character" className="w-16 h-16 object-cover border-2 border-[#10B981] rounded-lg" />
            </div>
          )}
          {scene.styleRefPreview && !scene.styleRefPreview.includes("NO-STYLE") && (
            <div className="text-center">
              <span className="block text-xs font-semibold text-contrast opacity-70 mb-2">Style</span>
              <img src={scene.styleRefPreview} alt="Style" className="w-16 h-16 object-cover border-2 border-[#10B981] rounded-lg" />
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
          className="px-6 py-3 glass-button font-semibold transition-all hover:scale-105 flex items-center gap-2"
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
    <div className="min-h-screen relative">
      {/* Floating Bubbles */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images (1).png" alt="Tumdah Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-contrast" style={{fontFamily: 'Poppins'}}>Tumdah AI Studio</span>
            </div>
            <button
              onClick={onBackToStart}
              className="glass-button px-6 py-3 font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Start Over
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-[calc(100vh-120px)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center p-4 glass-button rounded-3xl mb-6">
              <Film className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-contrast mb-3" style={{fontFamily: 'Poppins'}}>
              Your Storyboard
            </h1>
            <p className="text-xl text-contrast opacity-80">Professional 9-shot scenes for your project</p>
          </div>

          {scenes.length === 0 ? (
            <div className="glass-card-strong p-12 lg:p-20 text-center animate-fadeIn">
              <LayoutGrid className="w-24 h-24 mb-6 mx-auto text-contrast opacity-50" />
              <h3 className="text-3xl font-bold text-contrast mb-3">Your Storyboard is Empty</h3>
              <p className="text-contrast opacity-70 max-w-md mx-auto">
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
