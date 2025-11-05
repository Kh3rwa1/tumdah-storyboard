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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white border-4 border-black neo-shadow p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-400 border-4 border-black p-3 neo-shadow">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black">Step 1: Main Character</h2>
                <p className="text-gray-600 text-sm">Optional - Define your subject</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="actor-library" className="block text-sm font-bold text-black">
                Actor Library
              </label>
              <div className="relative">
                <Library className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="actor-library"
                  value={selectedActorId}
                  onChange={handleSelectActor}
                  className="w-full p-3 pl-10 bg-white border-4 border-black neo-shadow focus:outline-none focus:bg-yellow-100 appearance-none"
                >
                  <option value="">Select a saved actor...</option>
                  {savedCharacters.map(actor => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              <div className="space-y-2">
                <label htmlFor="actor-name" className="block text-sm font-bold text-black">
                  Save Current Actor
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="actor-name"
                    placeholder="Enter actor's name..."
                    value={characterNameInput}
                    onChange={(e) => setCharacterNameInput(e.target.value)}
                    className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
                  />
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={!characterNameInput}
                    className="neo-button bg-blue-400 p-3 flex-shrink-0 disabled:bg-gray-400 disabled:neo-shadow-disabled"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <button
              onClick={onBack}
              className="neo-button bg-gray-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={onNext}
              disabled={!canProceed}
              className="neo-button bg-yellow-400 flex items-center gap-2 disabled:bg-gray-400 disabled:neo-shadow-disabled"
            >
              Next: Style & Vibe
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
