import { Wand2, Users, ImageIcon as ImageIconLucide, User, ToggleLeft, ToggleRight, Lock, ArrowLeft, Film, Loader2, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white border-4 border-black neo-shadow p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-400 border-4 border-black p-3 neo-shadow">
                <Wand2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black">Step 3: Create Scene</h2>
                <p className="text-gray-600 text-sm">Define your action and generate shots</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="action-prompt" className="block text-sm font-bold text-black">
                Subject(s) Action Prompt
              </label>
              <textarea
                id="action-prompt"
                rows="3"
                value={actionPrompt}
                onChange={(e) => setActionPrompt(e.target.value)}
                placeholder="e.g., Drake singing, Bully and Guru Gomke fighting..."
                className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
                ref={inputRef}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="background-prompt" className="block text-sm font-bold text-black">
                Scene Setting / Background Prompt (Optional)
              </label>
              <textarea
                id="background-prompt"
                rows="3"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="e.g., A bustling city street at night, rainy forest..."
                className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
              />
            </div>

            <div className={`relative ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
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
                  className="absolute top-9 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-black"
                  aria-label="Clear all characters"
                  disabled={isComponentModeDisabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {allAdditionalCharacters.length > 0 && !isComponentModeDisabled && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 border-2 border-black">
                {allAdditionalCharacters.map((item) => (
                  <img key={item.id} src={item.preview} alt={item.name || 'Char'} title={item.name || 'Char'} className="w-16 h-16 object-cover border-2 border-black flex-shrink-0" />
                ))}
              </div>
            )}

            <div className={`relative ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
              <ImageDropzone
                title="Additional Reference Elements (Optional)"
                onFileChange={handleElementChange}
                icon={<ImageIconLucide className="w-6 h-6" />}
                aspectClass="aspect-[4/1]"
                multiple={true}
                disabled={isComponentModeDisabled}
              />
              {elements.length > 0 && (
                <button
                  type="button"
                  onClick={clearElements}
                  className="absolute top-9 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-black"
                  aria-label="Clear all elements"
                  disabled={isComponentModeDisabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {elements.length > 0 && !isComponentModeDisabled && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 border-2 border-black">
                {elements.map((item) => (
                  <img key={item.id} src={item.preview} alt="Element" className="w-16 h-16 object-cover border-2 border-black flex-shrink-0" />
                ))}
              </div>
            )}

            <div className="space-y-4 pt-4 border-t-4 border-black">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black flex items-center gap-2">
                  <Film className="w-4 h-4" /> Aspect Ratio
                </label>
                <div className="flex border-4 border-black neo-shadow overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9 landscape")}
                    className={`p-2 px-4 font-bold ${aspectRatio.includes("landscape") ? 'bg-yellow-400' : 'bg-white'} hover:bg-yellow-200`}
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16 portrait")}
                    className={`p-2 px-4 font-bold border-l-4 border-black ${aspectRatio.includes("portrait") ? 'bg-yellow-400' : 'bg-white'} hover:bg-yellow-200`}
                  >
                    9:16
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remove-subject" className="text-sm font-bold text-black flex items-center gap-2">
                  <User className="w-4 h-4" /> Remove Main Subject
                </label>
                <button
                  type="button"
                  id="remove-subject"
                  role="switch"
                  aria-checked={isSubjectRemoved}
                  onClick={() => setIsSubjectRemoved(!isSubjectRemoved)}
                  className="flex-shrink-0"
                  disabled={!characterPreview && !overrideFile}
                >
                  {isSubjectRemoved ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-500" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="lock-scene" className="text-sm font-bold text-black flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Enforce Scene Consistency
                </label>
                <button
                  type="button"
                  id="lock-scene"
                  role="switch"
                  aria-checked={isSceneLocked}
                  onClick={() => setIsSceneLocked(!isSceneLocked)}
                  className="flex-shrink-0"
                >
                  {isSceneLocked ? (
                    <ToggleRight className="w-10 h-10 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-400 border-4 border-black text-black neo-shadow">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="neo-button bg-gray-300 flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <button
                type="submit"
                disabled={!actionPrompt || isLoading}
                className="neo-button bg-yellow-400 flex items-center gap-2 disabled:bg-gray-400 disabled:neo-shadow-disabled"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {currentGeneratingText}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Scene
                  </>
                )}
              </button>
            </div>

            {!actionPrompt && (
              <p className="text-sm text-center font-bold text-red-600">
                Action Prompt is required.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
