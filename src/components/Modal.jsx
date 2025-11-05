import { X } from 'lucide-react';

export default function Modal({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[95vh] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="Enlarged shot" className="block w-full h-auto object-contain max-h-[90vh]" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white border border-white/20 transition-all hover:scale-110"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
