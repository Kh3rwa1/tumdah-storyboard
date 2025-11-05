import { X } from 'lucide-react';

export default function Modal({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn bg-black/70 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[95vh] glass-card-strong overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="Enlarged shot" className="block w-full h-auto object-contain max-h-[90vh] rounded-3xl" />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-4 glass-button transition-all hover:scale-110"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
