import { User, Palette, Library, Save, ChevronsUpDown, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import ImageDropzone from './ImageDropzone';

export default function SetupPage({
  characterPreview,
  onCharacterUpload,
  savedCharacters,
  onSaveCharacter,
  onSelectCharacter,
  selectedActorId,
  stylePreview,
  onStyleUpload,
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

  const canProceed = stylePreview;

  return (
    <div className="min-h-screen relative">
      {/* Premium Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#10B981]/20 via-[#34D399]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-[#34D399]/15 via-[#10B981]/10 to-transparent rounded-full blur-3xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-full blur-3xl" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Premium Navbar */}
      <nav className="relative z-10 px-6 py-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-2xl blur-lg opacity-50"></div>
                <img src="/images (1).png" alt="Tumdah Logo" className="relative w-12 h-12 rounded-2xl" />
              </div>
              <div>
                <span className="text-2xl font-black text-contrast tracking-tight" style={{fontFamily: 'Poppins'}}>
                  Tumdah AI Studio
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                  <span className="text-xs font-semibold text-contrast/60 uppercase tracking-wider">Setup</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center text-white font-bold text-sm">1</div>
                <span className="text-sm font-semibold text-contrast">Character</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"></div>
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center text-white font-bold text-sm">2</div>
                <span className="text-sm font-semibold text-contrast">Style</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-bold text-contrast uppercase tracking-wider">Quick Setup</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-contrast mb-6 leading-tight" style={{fontFamily: 'Poppins'}}>
              Set Up Your
              <br />
              <span className="gradient-text">Creative Vision</span>
            </h1>
            <p className="text-xl text-contrast/70 max-w-2xl mx-auto leading-relaxed">
              Define your character and visual style in seconds. Our AI will handle the rest.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

            {/* LEFT: Character Setup */}
            <div className="glass-card-strong p-8 lg:p-10 space-y-8 animate-fadeIn hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 glass-button rounded-2xl">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-contrast" style={{fontFamily: 'Poppins'}}>
                        Character
                      </h2>
                      <p className="text-sm text-contrast/60 font-semibold">Optional</p>
                    </div>
                  </div>
                  <p className="text-contrast/70 mb-6">
                    Upload your main subject or select from your library
                  </p>
                </div>
                <div className="px-3 py-1 glass-card rounded-full">
                  <span className="text-xs font-bold text-[#10B981]">01</span>
                </div>
              </div>

              {/* Actor Library */}
              <div className="space-y-3">
                <label htmlFor="actor-library" className="block text-sm font-bold text-contrast uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Library className="w-4 h-4 text-[#10B981]" />
                    Saved Library
                  </div>
                </label>
                <div className="relative group">
                  <select
                    id="actor-library"
                    value={selectedActorId}
                    onChange={handleSelectActor}
                    className="w-full glass-input p-4 text-contrast font-semibold appearance-none pr-12 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <option value="">Choose from library...</option>
                    {savedCharacters.map(actor => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="w-5 h-5 text-contrast/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#10B981] transition-colors" />
                </div>
              </div>

              {/* Upload Character */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-contrast uppercase tracking-wider">
                    Upload New
                  </label>
                  {characterPreview && (
                    <div className="flex items-center gap-2 px-3 py-1 glass-card rounded-full">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                      <span className="text-xs font-bold text-[#10B981]">Ready</span>
                    </div>
                  )}
                </div>
                <ImageDropzone
                  title=""
                  preview={characterPreview}
                  onFileChange={onCharacterUpload}
                  icon={<User className="w-10 h-10 text-white" />}
                  aspectClass="aspect-square"
                />
              </div>

              {/* Save to Library */}
              {characterPreview && (
                <div className="glass-card p-6 space-y-4 animate-slideUp border-2 border-[#10B981]/20">
                  <label className="block text-sm font-bold text-contrast uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4 text-[#10B981]" />
                      Save for Later
                    </div>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter name..."
                      value={characterNameInput}
                      onChange={(e) => setCharacterNameInput(e.target.value)}
                      className="flex-1 glass-input p-4 placeholder-contrast/40 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      disabled={!characterNameInput}
                      className="px-8 py-4 glass-button font-bold disabled:opacity-40 flex-shrink-0 transition-all hover:scale-105"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Style Setup */}
            <div className="glass-card-strong p-8 lg:p-10 space-y-8 animate-fadeIn hover-lift" style={{animationDelay: '0.1s'}}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 glass-button rounded-2xl">
                      <Palette className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-contrast" style={{fontFamily: 'Poppins'}}>
                        Visual Style
                      </h2>
                      <p className="text-sm text-contrast/60 font-semibold">Required</p>
                    </div>
                  </div>
                  <p className="text-contrast/70 mb-6">
                    Choose your aesthetic direction
                  </p>
                </div>
                <div className="px-3 py-1 glass-card rounded-full">
                  <span className="text-xs font-bold text-[#10B981]">02</span>
                </div>
              </div>

              {/* Style Reference */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-contrast uppercase tracking-wider">
                    Style Reference
                  </label>
                  {stylePreview && (
                    <div className="flex items-center gap-2 px-3 py-1 glass-card rounded-full">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                      <span className="text-xs font-bold text-[#10B981]">Ready</span>
                    </div>
                  )}
                </div>
                <ImageDropzone
                  title=""
                  preview={stylePreview}
                  onFileChange={onStyleUpload}
                  icon={<Palette className="w-10 h-10 text-white" />}
                  aspectClass="aspect-video"
                />
                <div className="glass-card p-4">
                  <p className="text-sm text-contrast/70 leading-relaxed">
                    AI extracts lighting, color grade, and mood while preserving your character
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="max-w-7xl mx-auto mt-12 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="glass-card-strong p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {canProceed ? (
                    <>
                      <div className="p-3 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-2xl">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-contrast">Ready to Create</h3>
                        <p className="text-sm text-contrast/60">Your setup is complete</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 glass-card rounded-2xl">
                        <Palette className="w-6 h-6 text-contrast/50" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-contrast">Almost There</h3>
                        <p className="text-sm text-contrast/60">Add a style reference to continue</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    onClick={onBack}
                    className="flex-1 sm:flex-none px-8 py-4 glass-card text-contrast font-bold hover:glass-button transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="flex-1 sm:flex-none px-10 py-4 glass-button font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-105 disabled:hover:scale-100 group"
                  >
                    <span>Continue to Scene</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
