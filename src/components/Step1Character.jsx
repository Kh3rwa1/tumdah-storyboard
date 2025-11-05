import { User, Library, Save, ChevronsUpDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import ImageDropzone from './ImageDropzone';

export default function Step1Character({
  characterPreview,
  onCharacterUpload,
  savedCharacters,
  onSaveCharacter,
  onSelectCharacter,
  selectedActorId,
  onNext,
  onBack
}) {
  const [characterNameInput, setCharacterNameInput] = useState("");

  const handleSaveClick = () => {
    if (characterNameInput && characterPreview) {
      onSaveCharacter(characterNameInput);
      setCharacterNameInput("");
    }
  };

  const handleSelectActor = (e) => {
    const actorId = e.target.value;
    onSelectCharacter(actorId);
  };

  const canProceed = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl animate-fadeIn">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-white/10">
                <User className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">Step 1</h2>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">Optional</span>
                </div>
                <p className="text-xl text-gray-300 mt-1">Main Character</p>
                <p className="text-sm text-gray-500 mt-1">Upload a reference image for your subject</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="actor-library" className="block text-sm font-medium text-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Library className="w-4 h-4 text-purple-400" />
                  Actor Library
                </div>
              </label>
              <div className="relative">
                <select
                  id="actor-library"
                  value={selectedActorId}
                  onChange={handleSelectActor}
                  className="w-full p-4 pl-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 appearance-none transition-all"
                >
                  <option value="" className="bg-gray-800">Select a saved actor...</option>
                  {savedCharacters.map(actor => (
                    <option key={actor.id} value={actor.id} className="bg-gray-800">
                      {actor.name}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <ImageDropzone
              title="Upload New Character"
              preview={characterPreview}
              onFileChange={onCharacterUpload}
              icon={<User className="w-10 h-10" />}
              aspectClass="aspect-square"
            />

            {characterPreview && (
              <div className="space-y-3 p-6 bg-white/5 border border-white/10 rounded-xl">
                <label htmlFor="actor-name" className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Save className="w-4 h-4 text-purple-400" />
                    Save to Library
                  </div>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="actor-name"
                    placeholder="Enter actor's name..."
                    value={characterNameInput}
                    onChange={(e) => setCharacterNameInput(e.target.value)}
                    className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={!characterNameInput}
                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={onNext}
              disabled={!canProceed}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
            >
              Next: Style & Vibe
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
