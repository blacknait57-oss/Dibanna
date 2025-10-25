import React from 'react';
import ReactDOM from 'react-dom';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, items, onClose }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on another right-click anywhere
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        onClose();
      }, { once: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style: React.CSSProperties = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    position: 'fixed',
    zIndex: 1000,
  };

  return ReactDOM.createPortal(
    <div ref={menuRef} style={style} className="bg-gray-900 rounded-md shadow-lg p-1.5 min-w-[180px] animate-fade-in-fast">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-green-600 hover:text-white rounded"
        >
          {item.label}
        </button>
      ))}
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.1s forwards ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ContextMenu;
