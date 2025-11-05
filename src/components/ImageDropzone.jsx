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
      <label className="block text-sm font-medium text-gray-300 mb-3">{title}</label>
      <label
        htmlFor={disabled ? undefined : id}
        className={`relative flex flex-col items-center justify-center w-full ${aspectClass} border-2 border-dashed rounded-2xl transition-all ${
          disabled
            ? 'opacity-30 cursor-not-allowed border-white/10 bg-white/5'
            : 'cursor-pointer group border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
        }`}
      >
        {preview && !multiple ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl backdrop-blur-sm">
                <div className="text-center">
                  <Upload className="w-10 h-10 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Change Image</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="p-4 bg-white/5 rounded-xl mb-4 group-hover:bg-white/10 transition-colors">
              {icon}
            </div>
            <p className="text-sm font-medium text-center text-white mb-1">
              {multiple ? "Click or drag files to upload" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-center text-gray-500">PNG, JPG, or WEBP</p>
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
