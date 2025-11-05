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
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0e6f6] via-[#e8f4f8] to-[#ffe8f0]">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-[#d4c5e8] to-[#b8d9e8] rounded-full blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-[#c8e6d0] to-[#ffd4e8] rounded-full blur-3xl opacity-30" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl w-full">
          <div className="clay-card bg-gradient-to-br from-[#f8f4fc] to-[#f0e8f8] p-8 lg:p-12 animate-fadeIn">
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 clay-element bg-gradient-to-br from-[#d4c5e8] to-[#e8d4f0] rounded-3xl">
                  <User className="w-8 h-8 text-[#6b5b7b]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#5a4a6a]" style={{fontFamily: 'Fredoka'}}>Step 1</h2>
                    <span className="px-4 py-1 clay-element bg-gradient-to-r from-[#fff4d4] to-[#ffd4c8] text-xs font-bold text-[#8a7a5a] rounded-full">Optional</span>
                  </div>
                  <p className="text-xl text-[#7a6a8a] font-medium">Main Character</p>
                  <p className="text-sm text-[#9a8aaa] mt-1">Upload a reference for your subject</p>
                </div>
              </div>
            </div>

            <div className="space-y-7">
              <div className="space-y-3">
                <label htmlFor="actor-library" className="block text-sm font-semibold text-[#6b5b7b]">
                  <div className="flex items-center gap-2 mb-2">
                    <Library className="w-4 h-4 text-[#a78bca]" />
                    Actor Library
                  </div>
                </label>
                <div className="relative">
                  <select
                    id="actor-library"
                    value={selectedActorId}
                    onChange={handleSelectActor}
                    className="w-full p-4 clay-input bg-gradient-to-br from-[#ffffff] to-[#f8f4fc] text-[#5a4a6a] font-medium appearance-none pr-12"
                  >
                    <option value="">Select a saved actor...</option>
                    {savedCharacters.map(actor => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="w-5 h-5 text-[#9a8aaa] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <div className="p-6 clay-element bg-gradient-to-br from-[#ffd4e8] to-[#ffe8f0] rounded-3xl space-y-4">
                  <label htmlFor="actor-name" className="block text-sm font-semibold text-[#6b5b7b]">
                    <div className="flex items-center gap-2 mb-3">
                      <Save className="w-4 h-4 text-[#d896b5]" />
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
                      className="flex-1 p-4 clay-input bg-white/50 text-[#5a4a6a] placeholder-[#9a8aaa] font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      disabled={!characterNameInput}
                      className="px-7 py-4 clay-button bg-gradient-to-r from-[#d4c5e8] to-[#b8d9e8] text-[#5a4a6a] font-bold disabled:opacity-40 flex-shrink-0"
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
                className="px-7 py-4 clay-button bg-gradient-to-r from-[#e8d8f0] to-[#f0e0f8] text-[#7a6a8a] font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={onNext}
                disabled={!canProceed}
                className="px-7 py-4 clay-button bg-gradient-to-r from-[#d4c5e8] to-[#b8d9e8] text-[#5a4a6a] font-bold disabled:opacity-40 flex items-center gap-2"
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
