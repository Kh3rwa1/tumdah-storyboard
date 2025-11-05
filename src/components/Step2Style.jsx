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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white border-4 border-black neo-shadow p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-400 border-4 border-black p-3 neo-shadow">
                <Palette className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black">Step 2: Style & Vibe</h2>
                <p className="text-gray-600 text-sm">Choose your aesthetic reference</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <fieldset className={`space-y-4 ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
              <legend className="text-xs font-bold text-gray-700 uppercase mb-3">Component Mode</legend>
              <ImageDropzone
                title="Aesthetic / Vibe Reference"
                preview={stylePreview}
                onFileChange={onStyleUpload}
                icon={<Palette className="w-10 h-10" />}
                aspectClass="aspect-video"
                disabled={isComponentModeDisabled}
              />
              <p className="text-sm text-gray-600">
                Upload a reference image for lighting, color grade, and overall aesthetic
              </p>
            </fieldset>

            <div className="relative flex items-center">
              <hr className="border-t-4 border-black w-full" />
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-2 font-bold text-gray-700">OR</span>
            </div>

            <fieldset className={`space-y-4 ${!isComponentModeDisabled ? 'opacity-50' : ''}`}>
              <legend className="text-xs font-bold text-gray-700 uppercase mb-3">Override Mode</legend>
              <ImageDropzone
                title="Override Scene with Single Image"
                preview={overridePreview}
                onFileChange={onOverrideChange}
                icon={<ImageUp className="w-10 h-10" />}
                aspectClass="aspect-video"
                disabled={isOverrideModeDisabled}
              />
              <p className="text-sm text-gray-600">
                Use a single source image for both subject and environment
              </p>
            </fieldset>
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
              Next: Create Scene
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {!canProceed && (
            <p className="text-sm text-center font-bold text-red-600 mt-4">
              Please upload either a style reference or override image to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
