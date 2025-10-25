import React from 'react';
import type { Server } from '../types';

interface WelcomeScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channelId: string) => void;
  server: Server;
}

const WelcomeScreenModal: React.FC<WelcomeScreenModalProps> = ({ isOpen, onClose, onSelectChannel, server }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { welcomeScreen } = server;

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !welcomeScreen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-700 rounded-lg shadow-xl w-full max-w-lg p-8 text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex flex-col items-center mb-6">
          <img src={server.imageUrl} alt={server.name} className="w-24 h-24 rounded-full mb-4 object-cover" />
          <h2 className="text-3xl font-extrabold text-white">{welcomeScreen.title}</h2>
          <p className="text-gray-300 mt-2">{welcomeScreen.description}</p>
        </div>

        <div className="space-y-3 mb-8">
          {welcomeScreen.callToActionChannels.map(({ channelId, label }) => (
            <button
              key={channelId}
              onClick={() => onSelectChannel(channelId)}
              className="w-full flex items-center text-left p-4 bg-gray-800 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="text-2xl mr-4">{label.split(' ')[0]}</span>
              <span className="font-semibold text-white">{label.substring(label.indexOf(' ') + 1)}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
        >
          Take me to the server!
        </button>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s forwards ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreenModal;