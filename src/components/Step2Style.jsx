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
                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-white/10">
                  <Palette className="w-7 h-7 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">Step 2</h2>
                  <p className="text-xl text-gray-300 mt-1">Style & Vibe</p>
                  <p className="text-sm text-gray-500 mt-1">Choose your aesthetic reference</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <fieldset className={`space-y-5 ${isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <legend className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">Component Mode</legend>
                <ImageDropzone
                  title="Aesthetic / Vibe Reference"
                  preview={stylePreview}
                  onFileChange={onStyleUpload}
                  icon={<Palette className="w-10 h-10" />}
                  aspectClass="aspect-video"
                  disabled={isComponentModeDisabled}
                />
                <p className="text-sm text-gray-400 leading-relaxed">
                  Upload a reference image for lighting, color grade, and overall aesthetic. The AI will extract the visual style while ignoring the content.
                </p>
              </fieldset>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-sm font-semibold text-gray-400">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <fieldset className={`space-y-5 ${!isComponentModeDisabled ? 'opacity-30' : ''}`}>
                <legend className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4">Override Mode</legend>
                <ImageDropzone
                  title="Override Scene with Single Image"
                  preview={overridePreview}
                  onFileChange={onOverrideChange}
                  icon={<ImageUp className="w-10 h-10" />}
                  aspectClass="aspect-video"
                  disabled={isOverrideModeDisabled}
                />
                <p className="text-sm text-gray-400 leading-relaxed">
                  Use a single source image for both subject identity and environment. Perfect for recreating specific scenes.
                </p>
              </fieldset>
            </div>

            {!canProceed && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 text-center font-medium">
                  Please upload either a style reference or override image to continue
                </p>
              </div>
            )}

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
