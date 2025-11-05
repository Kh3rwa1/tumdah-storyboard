import { X } from 'lucide-react';

export default function Modal({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] bg-white border-4 border-black neo-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="Enlarged shot" className="block w-full h-auto object-contain max-h-[90vh]" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
