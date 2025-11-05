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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl animate-fadeIn">
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10">
                  <Wand2 className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">Step 3</h2>
                  <p className="text-xl text-gray-300 mt-1">Create Scene</p>
                  <p className="text-sm text-gray-500 mt-1">Define your action and generate 9 cinematic shots</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="action-prompt" className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-blue-400" />
                    Subject(s) Action Prompt
                  </div>
                </label>
                <textarea
                  id="action-prompt"
                  rows="3"
                  value={actionPrompt}
                  onChange={(e) => setActionPrompt(e.target.value)}
                  placeholder="e.g., Drake singing, Bully and Guru Gomke fighting..."
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all resize-none"
                  ref={inputRef}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="background-prompt" className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    Scene Setting / Background (Optional)
                  </div>
                </label>
                <textarea
                  id="background-prompt"
                  rows="3"
                  value={backgroundPrompt}
                  onChange={(e) => setBackgroundPrompt(e.target.value)}
                  placeholder="e.g., A bustling city street at night, rainy forest..."
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all resize-none"
                />
              </div>

              <div className={`relative ${isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <ImageDropzone
                  title={isAutoSelectedAddl ? `Additional Characters (Auto: ${allAdditionalCharacters.length})` : "Additional Characters (Optional)"}
                  onFileChange={handleAdditionalCharacterChange}
                  icon={<Users className="w-6 h-6" />}
                  aspectClass="aspect-[4/1]"
                  multiple={true}
                  disabled={isComponentModeDisabled}
                />
                {allAdditionalCharacters.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAdditionalCharacters}
                    className="absolute top-12 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                    aria-label="Clear all characters"
                    disabled={isComponentModeDisabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {allAdditionalCharacters.length > 0 && !isComponentModeDisabled && (
                <div className="flex gap-2 overflow-x-auto p-3 bg-white/5 border border-white/10 rounded-xl">
                  {allAdditionalCharacters.map((item) => (
                    <img key={item.id} src={item.preview} alt={item.name || 'Character'} title={item.name || 'Character'} className="w-20 h-20 object-cover border-2 border-white/20 rounded-lg flex-shrink-0" />
                  ))}
                </div>
              )}

              <div className={`relative ${isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <ImageDropzone
                  title="Additional Reference Elements (Optional)"
                  onFileChange={handleElementChange}
                  icon={<ImageIcon className="w-6 h-6" />}
                  aspectClass="aspect-[4/1]"
                  multiple={true}
                  disabled={isComponentModeDisabled}
                />
                {elements.length > 0 && (
                  <button
                    type="button"
                    onClick={clearElements}
                    className="absolute top-12 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                    aria-label="Clear all elements"
                    disabled={isComponentModeDisabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {elements.length > 0 && !isComponentModeDisabled && (
                <div className="flex gap-2 overflow-x-auto p-3 bg-white/5 border border-white/10 rounded-xl">
                  {elements.map((item) => (
                    <img key={item.id} src={item.preview} alt="Element" className="w-20 h-20 object-cover border-2 border-white/20 rounded-lg flex-shrink-0" />
                  ))}
                </div>
              )}

              <div className="space-y-5 p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Advanced Options</h3>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    Aspect Ratio
                  </label>
                  <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9 landscape")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${aspectRatio.includes("landscape") ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16 portrait")}
                      className={`px-4 py-2 text-sm font-medium border-l border-white/10 transition-colors ${aspectRatio.includes("portrait") ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      9:16
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Remove Main Subject
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSubjectRemoved(!isSubjectRemoved)}
                    disabled={!characterPreview && !overrideFile}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSubjectRemoved ? 'bg-red-500' : 'bg-gray-600'} ${!characterPreview && !overrideFile ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSubjectRemoved ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    Enforce Scene Consistency
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSceneLocked(!isSceneLocked)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSceneLocked ? 'bg-green-500' : 'bg-gray-600'} cursor-pointer`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSceneLocked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400 font-medium"><span className="font-bold">Error:</span> {error}</p>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-30"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!actionPrompt || isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">{currentGeneratingText}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Scene
                    </>
                  )}
                </button>
              </div>

              {!actionPrompt && !isLoading && (
                <p className="text-sm text-center text-gray-500">
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
