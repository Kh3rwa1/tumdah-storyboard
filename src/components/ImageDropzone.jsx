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
      <label className="block text-sm font-bold text-black mb-2">{title}</label>
      <label
        htmlFor={disabled ? undefined : id}
        className={`relative flex flex-col items-center justify-center w-full ${aspectClass} border-4 border-black border-dashed bg-white neo-shadow ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
      >
        {preview && !multiple ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-8 h-8 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-black">
            {icon}
            <p className="mt-2 text-sm font-bold text-center">
              {multiple ? "Click or drag to upload" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-center">PNG, JPG, or WEBP</p>
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
