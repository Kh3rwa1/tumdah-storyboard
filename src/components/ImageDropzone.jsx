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
      <label className="block text-sm font-semibold text-[#6b5b7b] mb-3">{title}</label>
      <label
        htmlFor={disabled ? undefined : id}
        className={`relative flex flex-col items-center justify-center w-full ${aspectClass} rounded-3xl transition-all ${
          disabled
            ? 'opacity-40 cursor-not-allowed clay-element-pressed bg-gradient-to-br from-[#e8d8f0] to-[#f0e0f8]'
            : 'cursor-pointer group clay-element bg-gradient-to-br from-[#f8f4fc] to-[#f0e8f8] hover:shadow-lg'
        }`}
      >
        {preview && !multiple ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
            {!disabled && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4c5e8]/90 to-[#b8d9e8]/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-3xl">
                <div className="text-center clay-element bg-white/50 p-6 rounded-2xl">
                  <Upload className="w-10 h-10 text-[#6b5b7b] mx-auto mb-2" />
                  <p className="text-[#5a4a6a] text-sm font-bold">Change Image</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#7a6a8a] p-8">
            <div className="p-5 clay-element bg-gradient-to-br from-[#d4c5e8] to-[#b8d9e8] rounded-3xl mb-4 group-hover:scale-105 transition-transform">
              {icon}
            </div>
            <p className="text-sm font-bold text-center text-[#5a4a6a] mb-1">
              {multiple ? "Click or drag files here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-center text-[#8a7a9a]">PNG, JPG, or WEBP</p>
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
