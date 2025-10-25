import React from 'react';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddServer: (name: string, template: 'private' | 'community', imageUrl?: string) => void;
}

const TemplateButton: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600 hover:border-white transition-colors">
        <div className="text-left">
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
    </button>
);

const AddServerModal: React.FC<AddServerModalProps> = ({ isOpen, onClose, onAddServer }) => {
  const [step, setStep] = React.useState(1);
  const [template, setTemplate] = React.useState<'private' | 'community'>('private');
  const [serverName, setServerName] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
        // Reset state when modal opens
        setStep(1);
        setServerName('');
        setImagePreview(null);
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverName.trim()) {
      onAddServer(serverName.trim(), template, imagePreview || undefined);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) onClose();
  }

  const handleImageUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const handleTemplateSelect = (selectedTemplate: 'private' | 'community') => {
      setTemplate(selectedTemplate);
      setStep(2);
  };

  if (!isOpen) return null;

  const renderStepOne = () => (
    <>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Create a server</h2>
        <p className="text-gray-400 text-center mb-6">Your server is where you and your friends hang out. Make yours and start talking.</p>
        <div className="space-y-4">
            <TemplateButton 
                title="For a club or community"
                description="Create a server for a larger group."
                onClick={() => handleTemplateSelect('community')}
            />
            <TemplateButton 
                title="For me and my friends"
                description="Create a private server for your friends."
                onClick={() => handleTemplateSelect('private')}
            />
        </div>
        <div className="text-center mt-6">
            <button onClick={onClose} className="text-sm text-gray-400 hover:underline">Cancel</button>
        </div>
    </>
  );

  const renderStepTwo = () => (
    <>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Customize your server</h2>
        <p className="text-gray-400 text-center mb-6">Give your new server a personality with a name and an icon. You can always change it later.</p>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageUploadClick}
              className="relative w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-500 hover:border-green-500 hover:text-white transition-colors group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Server icon preview" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                  <span className="text-xs font-bold uppercase mt-1">Upload</span>
                </div>
              )}
               <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white text-xs font-bold">CHANGE ICON</span>
               </div>
            </button>
          </div>

          <label htmlFor="server-name" className="text-xs font-bold uppercase text-gray-400 mb-2 block">Server Name</label>
          <input
            id="server-name"
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-900 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter a server name"
            required
            autoFocus
          />
          <div className="flex justify-between items-center mt-6 bg-gray-800 p-4 -m-6 rounded-b-lg">
            <button type="button" onClick={() => setStep(1)} className="text-white hover:underline">
              Back
            </button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200 disabled:bg-gray-500" disabled={!serverName.trim()}>
              Create
            </button>
          </div>
        </form>
    </>
  );

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-700 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        {step === 1 ? renderStepOne() : renderStepTwo()}
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

export default AddServerModal;