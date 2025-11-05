import { Wand2, Users, Image as ImageIcon, User, Film, Loader2, X, ArrowLeft, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ImageDropzone from './ImageDropzone';

export default function Step3CreateScene({
  onSubmit,
  isLoading,
  currentGeneratingText,
  error,
  characterPreview,
  stylePreview,
  overrideFile,
  savedCharacters,
  onBack
}) {
  const [actionPrompt, setActionPrompt] = useState("");
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [additionalCharacters, setAdditionalCharacters] = useState([]);
  const [elements, setElements] = useState([]);
  const [isSubjectRemoved, setIsSubjectRemoved] = useState(false);
  const [isSceneLocked, setIsSceneLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16:9 landscape");
  const [autoSelectedAddlChars, setAutoSelectedAddlChars] = useState([]);
  const [isAutoSelectedAddl, setIsAutoSelectedAddl] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (overrideFile || additionalCharacters.length > 0) {
      return;
    }

    if (!actionPrompt) {
      if (isAutoSelectedAddl) {
        setAutoSelectedAddlChars([]);
        setIsAutoSelectedAddl(false);
      }
      return;
    }

    const sortedCharacters = [...savedCharacters].sort((a, b) => b.name.length - a.name.length);
    const foundActors = [];
    let tempPrompt = actionPrompt.toLowerCase();

    for (const actor of sortedCharacters) {
      if (tempPrompt.includes(actor.name.toLowerCase())) {
        foundActors.push(actor);
        tempPrompt = tempPrompt.replace(actor.name.toLowerCase(), "");
      }
    }

    const addlActors = foundActors.slice(1);
    const newAddlActorIds = addlActors.map(a => a.id).sort().join(',');
    const currentAddlActorIds = autoSelectedAddlChars.map(a => a.id).sort().join(',');

    if (newAddlActorIds !== currentAddlActorIds) {
      setAutoSelectedAddlChars(addlActors);
      setIsAutoSelectedAddl(true);
    }

    if (foundActors.length === 0 && isAutoSelectedAddl) {
      setAutoSelectedAddlChars([]);
      setIsAutoSelectedAddl(false);
    }
  }, [actionPrompt, savedCharacters, overrideFile, additionalCharacters.length, autoSelectedAddlChars, isAutoSelectedAddl]);

  const handleAdditionalCharacterChange = async (files) => {
    setIsAutoSelectedAddl(false);
    setAutoSelectedAddlChars([]);

    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const newChars = await Promise.all(files.map(async (file) => {
      const preview = await fileToBase64(file);
      return { id: crypto.randomUUID(), file, preview };
    }));
    setAdditionalCharacters(newChars);
  };

  const clearAdditionalCharacters = () => {
    setAdditionalCharacters([]);
    setAutoSelectedAddlChars([]);
    setIsAutoSelectedAddl(false);
  };

  const handleElementChange = async (files) => {
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const newElements = await Promise.all(files.map(async (file) => {
      const preview = await fileToBase64(file);
      return { id: crypto.randomUUID(), file, preview };
    }));
    setElements(newElements);
  };

  const clearElements = () => {
    setElements([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actionPrompt || isLoading) return;

    const allAdditionalCharFiles = (isAutoSelectedAddl ? autoSelectedAddlChars : additionalCharacters).map(c => c.file);

    onSubmit(
      actionPrompt,
      backgroundPrompt,
      allAdditionalCharFiles,
      elements.map(e => e.file),
      isSubjectRemoved,
      isSceneLocked,
      aspectRatio
    );

    setActionPrompt("");
    setBackgroundPrompt("");
    clearAdditionalCharacters();
    clearElements();
  };

  const isComponentModeDisabled = !!overrideFile;
  const allAdditionalCharacters = isAutoSelectedAddl ? autoSelectedAddlChars : additionalCharacters;

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
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 glass-card rounded-full">
                <span className="text-sm font-semibold text-contrast">Step 3 of 3</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full">
          <div className="glass-card-strong p-8 lg:p-12 animate-fadeIn">
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center p-4 glass-button rounded-3xl mb-6">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-contrast mb-3" style={{fontFamily: 'Poppins'}}>
                Create Scene
              </h2>
              <p className="text-xl text-contrast opacity-80">Describe your scene and generate storyboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Action Prompt */}
              <div className="space-y-3">
                <label htmlFor="action-prompt" className="block text-sm font-bold text-contrast">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-[#10B981]" />
                    Action Prompt (Required)
                  </div>
                </label>
                <textarea
                  ref={inputRef}
                  id="action-prompt"
                  value={actionPrompt}
                  onChange={(e) => setActionPrompt(e.target.value)}
                  placeholder="Describe the action and scene... (e.g., 'walking through a neon-lit city street at night')"
                  className="w-full glass-input p-4 min-h-[120px] placeholder-[#1a1a2e]/50 resize-none font-medium"
                  disabled={isLoading}
                />
              </div>

              {/* Background Prompt */}
              <div className="space-y-3">
                <label htmlFor="background-prompt" className="block text-sm font-bold text-contrast">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#10B981]" />
                    Background Prompt (Optional)
                  </div>
                </label>
                <textarea
                  id="background-prompt"
                  value={backgroundPrompt}
                  onChange={(e) => setBackgroundPrompt(e.target.value)}
                  placeholder="Describe the background environment... (e.g., 'cyberpunk cityscape with rain')"
                  className="w-full glass-input p-4 min-h-[100px] placeholder-[#1a1a2e]/50 resize-none font-medium"
                  disabled={isLoading}
                />
              </div>

              {/* Additional Characters */}
              <div className={`space-y-3 transition-all ${isComponentModeDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="relative">
                  <ImageDropzone
                    title={isAutoSelectedAddl ? `Additional Characters (Auto: ${allAdditionalCharacters.length})` : "Additional Characters (Optional)"}
                    onFileChange={handleAdditionalCharacterChange}
                    icon={<Users className="w-10 h-10 text-white" />}
                    aspectClass="aspect-[4/1]"
                    multiple={true}
                    disabled={isComponentModeDisabled}
                  />
                  {allAdditionalCharacters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAdditionalCharacters}
                      className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors z-10"
                      aria-label="Clear all characters"
                      disabled={isComponentModeDisabled}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {allAdditionalCharacters.length > 0 && !isComponentModeDisabled && (
                  <div className="flex gap-2 overflow-x-auto p-3 glass-card rounded-xl">
                    {allAdditionalCharacters.map((item) => (
                      <img
                        key={item.id}
                        src={item.preview}
                        alt={item.name || 'Character'}
                        title={item.name || 'Character'}
                        className="w-20 h-20 object-cover border-2 border-[#10B981] rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Elements */}
              <div className={`space-y-3 transition-all ${isComponentModeDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="relative">
                  <ImageDropzone
                    title="Additional Reference Elements (Optional)"
                    onFileChange={handleElementChange}
                    icon={<ImageIcon className="w-10 h-10 text-white" />}
                    aspectClass="aspect-[4/1]"
                    multiple={true}
                    disabled={isComponentModeDisabled}
                  />
                  {elements.length > 0 && (
                    <button
                      type="button"
                      onClick={clearElements}
                      className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors z-10"
                      aria-label="Clear all elements"
                      disabled={isComponentModeDisabled}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {elements.length > 0 && !isComponentModeDisabled && (
                  <div className="flex gap-2 overflow-x-auto p-3 glass-card rounded-xl">
                    {elements.map((item) => (
                      <img
                        key={item.id}
                        src={item.preview}
                        alt="Element"
                        className="w-20 h-20 object-cover border-2 border-[#10B981] rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-sm font-bold text-contrast uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#10B981]" />
                  Advanced Options
                </h3>

                {/* Aspect Ratio */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-contrast flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#10B981]" />
                    Aspect Ratio
                  </label>
                  <div className="flex glass-card p-1 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9 landscape")}
                      className={`px-4 py-2 text-sm font-semibold transition-all rounded ${
                        aspectRatio.includes("landscape")
                          ? 'glass-button text-white'
                          : 'text-contrast opacity-70 hover:opacity-100'
                      }`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16 portrait")}
                      className={`px-4 py-2 text-sm font-semibold transition-all rounded ${
                        aspectRatio.includes("portrait")
                          ? 'glass-button text-white'
                          : 'text-contrast opacity-70 hover:opacity-100'
                      }`}
                    >
                      9:16
                    </button>
                  </div>
                </div>

                {/* Remove Main Subject */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-contrast flex items-center gap-2">
                    <User className="w-4 h-4 text-[#10B981]" />
                    Remove Main Subject
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSubjectRemoved(!isSubjectRemoved)}
                    disabled={!characterPreview && !overrideFile}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isSubjectRemoved ? 'bg-red-500' : 'bg-gray-400'
                    } ${!characterPreview && !overrideFile ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isSubjectRemoved ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Scene Consistency */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-contrast flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    Enforce Scene Consistency
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSceneLocked(!isSceneLocked)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isSceneLocked ? 'bg-[#10B981]' : 'bg-gray-400'
                    } cursor-pointer`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isSceneLocked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="glass-card p-5 border-2 border-red-500/50 animate-slideUp">
                  <p className="text-sm text-red-500 font-semibold">
                    <span className="font-bold">Error:</span> {error}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading}
                  className="px-8 py-4 glass-card text-contrast font-bold flex items-center justify-center gap-2 hover:glass-button transition-all disabled:opacity-40"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!actionPrompt || isLoading}
                  className="px-8 py-4 glass-button font-bold disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{currentGeneratingText}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Scene
                    </>
                  )}
                </button>
              </div>

              {/* Helper Text */}
              {!actionPrompt && !isLoading && (
                <p className="text-sm text-center text-contrast opacity-60">
                  Action prompt is required to generate scenes
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
