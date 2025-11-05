import { Upload } from 'lucide-react';

export default function ImageDropzone({
  title,
  preview,
  onFileChange,
  icon,
  aspectClass = "aspect-video",
  multiple = false,
  disabled = false
}) {
  const handleFileChange = (e) => {
    if (multiple) {
      onFileChange(Array.from(e.target.files));
    } else {
      const file = e.target.files?.[0];
      if (file) {
        onFileChange(file);
      }
    }
  };

  const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-contrast mb-3">{title}</label>
      <label
        htmlFor={disabled ? undefined : id}
        className={`relative flex flex-col items-center justify-center w-full ${aspectClass} transition-all ${
          disabled
            ? 'opacity-40 cursor-not-allowed frosted-glass'
            : 'cursor-pointer group glass-card hover:scale-105'
        }`}
      >
        {preview && !multiple ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
            {!disabled && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-3xl bg-[#10B981]/90 backdrop-blur-sm">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-white mx-auto mb-3" />
                  <p className="text-white text-sm font-bold">Change Image</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-contrast p-8">
            <div className="p-6 glass-button mb-5 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <p className="text-sm font-bold text-center mb-2">
              {multiple ? "Click or drag files here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-center opacity-70">PNG, JPG, or WEBP</p>
          </div>
        )}
        {!disabled && (
          <input
            id={id}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            multiple={multiple}
          />
        )}
      </label>
    </div>
  );
}
