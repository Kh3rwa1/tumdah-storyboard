import { Palette, ArrowRight, ArrowLeft, ImageUp } from 'lucide-react';
import ImageDropzone from './ImageDropzone';

export default function Step2Style({
  stylePreview,
  onStyleUpload,
  overridePreview,
  onOverrideChange,
  onClearOverride,
  onNext,
  onBack
}) {
  const canProceed = stylePreview || overridePreview;
  const isComponentModeDisabled = !!overridePreview;
  const isOverrideModeDisabled = !!stylePreview;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0e6f6] via-[#e8f4f8] to-[#ffe8f0]">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-[#ffd4e8] to-[#ffe8f0] rounded-full blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#b8d9e8] to-[#d4e8f0] rounded-full blur-3xl opacity-30" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          <div className="clay-card bg-gradient-to-br from-[#f8f4fc] to-[#f0e8f8] p-8 lg:p-12 animate-fadeIn">
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 clay-element bg-gradient-to-br from-[#ffd4e8] to-[#ffe8f0] rounded-3xl">
                  <Palette className="w-8 h-8 text-[#d896b5]" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#5a4a6a] mb-1" style={{fontFamily: 'Fredoka'}}>Step 2</h2>
                  <p className="text-xl text-[#7a6a8a] font-medium">Style & Vibe</p>
                  <p className="text-sm text-[#9a8aaa] mt-1">Choose your aesthetic reference</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <fieldset className={`space-y-5 transition-opacity ${isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <legend className="text-xs font-bold text-[#a78bca] uppercase tracking-wider mb-4 px-4 py-2 clay-element bg-gradient-to-r from-[#d4c5e8] to-[#e8d4f0] rounded-full inline-block">Component Mode</legend>
                <ImageDropzone
                  title="Aesthetic / Vibe Reference"
                  preview={stylePreview}
                  onFileChange={onStyleUpload}
                  icon={<Palette className="w-10 h-10" />}
                  aspectClass="aspect-video"
                  disabled={isComponentModeDisabled}
                />
                <p className="text-sm text-[#8a7a9a] leading-relaxed p-4 clay-element bg-white/30 rounded-2xl">
                  Upload a reference image for lighting, color grade, and overall aesthetic. The AI will extract the visual style while ignoring the content.
                </p>
              </fieldset>

              <div className="relative flex items-center">
                <div className="flex-1 h-1 clay-element-pressed bg-gradient-to-r from-[#d4c5e8] to-[#b8d9e8] rounded-full"></div>
                <span className="px-5 py-2 mx-4 clay-element bg-gradient-to-r from-[#fff4d4] to-[#ffd4c8] text-sm font-bold text-[#8a7a5a] rounded-full">OR</span>
                <div className="flex-1 h-1 clay-element-pressed bg-gradient-to-r from-[#b8d9e8] to-[#c8e6d0] rounded-full"></div>
              </div>

              <fieldset className={`space-y-5 transition-opacity ${!isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <legend className="text-xs font-bold text-[#7ec8e3] uppercase tracking-wider mb-4 px-4 py-2 clay-element bg-gradient-to-r from-[#b8d9e8] to-[#d4e8f0] rounded-full inline-block">Override Mode</legend>
                <ImageDropzone
                  title="Override Scene with Single Image"
                  preview={overridePreview}
                  onFileChange={onOverrideChange}
                  icon={<ImageUp className="w-10 h-10" />}
                  aspectClass="aspect-video"
                  disabled={isOverrideModeDisabled}
                />
                <p className="text-sm text-[#8a7a9a] leading-relaxed p-4 clay-element bg-white/30 rounded-2xl">
                  Use a single source image for both subject identity and environment. Perfect for recreating specific scenes.
                </p>
              </fieldset>
            </div>

            {!canProceed && (
              <div className="mt-6 p-5 clay-element bg-gradient-to-r from-[#ffd4c8] to-[#ffe8d4] rounded-2xl">
                <p className="text-sm text-[#8a5a4a] text-center font-bold">
                  Please upload either a style reference or override image to continue
                </p>
              </div>
            )}

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
                Next: Create Scene
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
