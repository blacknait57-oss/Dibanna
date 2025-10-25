import React from 'react';
import type { User, UserSettings, Friend } from '../types';
import { THEME_BACKGROUNDS } from '../data';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  userSettings: UserSettings;
  onUpdateUserSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateCurrentUser: (updatedData: Partial<User>) => void;
}

const ACCENT_COLORS = [
  '#5865F2', '#3498DB', '#1ABC9C', '#2ECC71', '#F1C40F', 
  '#E67E22', '#E74C3C', '#E91E63', '#9B59B6', '#FFFFFF'
];

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    return (
        <button 
            onClick={() => !disabled && onChange(!checked)} 
            className={`relative inline-flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
        >
            <span className={`absolute left-1 transition-transform duration-200 ease-in-out transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full shadow ${checked ? 'bg-white' : 'bg-gray-300'}`}>
                    {checked 
                        ? <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        : <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    }
                </span>
            </span>
        </button>
    );
}

// --- Sub-Views for Settings ---

const MyAccountView: React.FC<{
  user: User;
  onUpdate: (updatedData: Partial<User>) => void;
}> = ({ user, onUpdate }) => {
  const [editedUser, setEditedUser] = React.useState(user);
  const [showSaveBar, setShowSaveBar] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditedUser(user);
  }, [user]);

  React.useEffect(() => {
    const hasChanges = editedUser.name !== user.name || editedUser.bio !== user.bio || editedUser.avatarUrl !== user.avatarUrl || editedUser.bannerUrl !== user.bannerUrl;
    setShowSaveBar(hasChanges);
  }, [editedUser, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: keyof User, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveChanges = () => {
    onUpdate(editedUser);
    setShowSaveBar(false);
  };
  
  const handleReset = () => {
    setEditedUser(user);
  };

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Account</h2>
        <div className="bg-gray-900 rounded-lg shadow-lg relative mb-6">
            <div 
                className="h-24 bg-cover bg-center rounded-t-lg relative group"
                style={{ backgroundColor: '#5865F2', backgroundImage: `url(${editedUser.bannerUrl})` }}
            >
                <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} className="hidden" accept="image/*" />
                <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">
                    Change Banner
                </button>
            </div>
            <div className="absolute top-16 left-4 flex items-end">
                <div className="relative group">
                    <img src={editedUser.avatarUrl} alt={editedUser.name} className="w-24 h-24 rounded-full border-8 border-gray-900 object-cover" />
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatarUrl')} className="hidden" accept="image/*" />
                     <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                        CHANGE
                        AVATAR
                    </button>
                </div>
            </div>
            <div className="pt-16 p-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="mb-4">
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Username</label>
                        <input
                            type="text"
                            value={editedUser.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-gray-900/50 rounded p-2 text-white"
                        />
                    </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">About Me</label>
                        <textarea
                            value={editedUser.bio || ''}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className="w-full bg-gray-900/50 rounded p-2 text-white h-24 resize-none"
                            maxLength={190}
                        />
                         <p className="text-right text-xs text-gray-400">{(editedUser.bio || '').length}/190</p>
                    </div>
                </div>
            </div>
        </div>
        {showSaveBar && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-max bg-gray-900 p-3 rounded-lg shadow-2xl flex items-center space-x-4 animate-slide-up">
                <p className="text-sm text-gray-300">Careful — you have unsaved changes!</p>
                <button onClick={handleReset} className="text-white hover:underline text-sm font-medium">Reset</button>
                <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200">
                    Save Changes
                </button>
            </div>
        )}
        <style>{`
            @keyframes slide-up {
                from { transform: translate(-50%, 20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            .animate-slide-up { animation: slide-up 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

const AppearanceSettings: React.FC<{
  settings: UserSettings;
  onUpdate: (newSettings: Partial<UserSettings>) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
      
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Theme</h3>
        <div className="flex space-x-4">
            <ThemePreview title="Dark" theme="dark" isActive={settings.theme === 'dark'} onClick={() => onUpdate({ theme: 'dark' })} />
            <ThemePreview title="Light" theme="light" isActive={settings.theme === 'light'} onClick={() => onUpdate({ theme: 'light' })} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Accent Color</h3>
        <p className="text-sm text-gray-400 mb-4">Choose a color to customize the look of buttons, links, and selected items.</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(color => (
            <button
              key={color}
              onClick={() => onUpdate({ accentColor: color })}
              className={`w-12 h-12 rounded-full transition-all transform hover:scale-110 focus:outline-none ring-offset-2 ring-offset-gray-700 ${settings.accentColor === color ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Chat Background</h3>
        <p className="text-sm text-gray-400 mb-4">Select a background for your chat area.</p>
        <div className="grid grid-cols-2 gap-4">
          {THEME_BACKGROUNDS.map(bg => (
            <div key={bg.id} onClick={() => onUpdate({ chatBackground: bg.id })} className="cursor-pointer group">
              <div 
                className={`w-full h-24 rounded-lg bg-cover bg-center transition-all ring-offset-2 ring-offset-gray-700 ${settings.chatBackground === bg.id ? 'ring-2 ring-white' : 'ring-1 ring-transparent group-hover:ring-white'}`}
                style={{
                  backgroundColor: bg.color || '#33363c',
                  backgroundImage: bg.url ? `url(${bg.url})` : 'none'
                }}
              />
              <p className="text-center text-sm text-gray-300 mt-2">{bg.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrivacySafetyView: React.FC<{
  user: User;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateUser: (updatedData: Partial<User>) => void;
}> = ({ user, settings, onUpdateSettings, onUpdateUser }) => {

    const blockedUsers = (user.friends || []).filter(f => f.status === 'blocked');

    const handleUnblock = (userId: string) => {
        const updatedFriends = (user.friends || []).filter(f => f.user.id !== userId);
        onUpdateUser({ ...user, friends: updatedFriends });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Privacy & Safety</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Direct Message Filters</h3>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-white">Explicit Media Filter</h4>
                                <p className="text-sm text-gray-400 mt-1">Automatically scan and blur media that may contain explicit content in DMs.</p>
                            </div>
                            <ToggleSwitch
                                checked={settings.explicitMediaFilter}
                                onChange={c => onUpdateSettings({ explicitMediaFilter: c })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Server Privacy Defaults</h3>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-white">Allow DMs From Server Members</h4>
                                <p className="text-sm text-gray-400 mt-1">Allows members of servers you're in to send you DMs.</p>
                            </div>
                            <ToggleSwitch
                                checked={settings.allowDmsFromServers}
                                onChange={c => onUpdateSettings({ allowDmsFromServers: c })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Friend Request Permissions</h3>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                        {['everyone', 'mutual_friends', 'server_members'].map(perm => (
                            <div key={perm} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`fr-${perm}`}
                                    name="friendRequestPermissions"
                                    value={perm}
                                    checked={settings.friendRequestPermissions === perm}
                                    onChange={() => onUpdateSettings({ friendRequestPermissions: perm as any })}
                                    className="hidden"
                                />
                                <label htmlFor={`fr-${perm}`} className="flex items-center cursor-pointer">
                                    <span className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${settings.friendRequestPermissions === perm ? 'border-green-500' : 'border-gray-500'}`}>
                                        {settings.friendRequestPermissions === perm && <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>}
                                    </span>
                                    <span className="capitalize text-white">{perm.replace('_', ' ')}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Blocked Users</h3>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        {blockedUsers.length > 0 ? (
                            <ul className="space-y-2">
                                {blockedUsers.map(f => (
                                    <li key={f.user.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700/50">
                                        <div className="flex items-center">
                                            <img src={f.user.avatarUrl} alt={f.user.name} className="w-8 h-8 rounded-full mr-3" />
                                            <span className="font-semibold text-white">{f.user.name}</span>
                                        </div>
                                        <button onClick={() => handleUnblock(f.user.id)} className="text-red-500 hover:underline text-sm">Unblock</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm">You haven't blocked anyone. Hooray for friendship!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdvancedSettingsView: React.FC<{
  settings: UserSettings;
  onUpdate: (newSettings: Partial<UserSettings>) => void;
}> = ({ settings, onUpdate }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Advanced</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-white">Developer Mode</h3>
                        <p className="text-sm text-gray-400 mt-1">Exposes context menu items for copying IDs of users, servers, channels, and messages.</p>
                    </div>
                    <ToggleSwitch 
                        checked={!!settings.developerMode}
                        onChange={(checked) => onUpdate({ developerMode: checked })}
                    />
                </div>
            </div>
        </div>
    );
};

const ThemePreview: React.FC<{ title: string, theme: 'dark' | 'light', isActive: boolean, onClick: () => void }> = ({ title, theme, isActive, onClick }) => {
    const isDark = theme === 'dark';
    return (
        <div onClick={onClick} className="cursor-pointer">
            <div className={`w-40 h-24 rounded-lg p-2 flex space-x-1.5 transition-all ${isActive ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-600'}`} style={{ backgroundColor: isDark ? '#36393f' : '#f2f3f5' }}>
                <div className="w-5 h-full rounded-full" style={{backgroundColor: isDark ? '#202225' : '#e3e5e8'}}></div>
                <div className="flex-1 flex flex-col space-y-1.5">
                    <div className="h-4 w-1/3 rounded-full" style={{backgroundColor: isDark ? '#2f3136' : '#ebedef'}}></div>
                    <div className="flex-1 p-1 rounded-sm" style={{backgroundColor: isDark ? '#2f3136' : '#ebedef'}}>
                         <div className="w-full h-2 rounded-full" style={{backgroundColor: isDark ? '#40444b' : '#dde0e3'}}></div>
                         <div className="w-2/3 h-2 rounded-full mt-1" style={{backgroundColor: isDark ? '#40444b' : '#dde0e3'}}></div>
                    </div>
                </div>
            </div>
            <p className={`text-center mt-2 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{title}</p>
        </div>
    );
};

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user, userSettings, onUpdateUserSettings, onUpdateCurrentUser }) => {
    const [activeSection, setActiveSection] = React.useState('My Account');
    const modalRef = React.useRef<HTMLDivElement>(null);
    const modalContentRef = React.useRef<HTMLDivElement>(null);
    const [sidebarWidth, setSidebarWidth] = React.useState(240);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const mouseMoveHandler = (moveEvent: MouseEvent) => {
            if (modalContentRef.current) {
                const modalLeft = modalContentRef.current.getBoundingClientRect().left;
                const newWidth = moveEvent.clientX - modalLeft;
                if (newWidth >= 180 && newWidth <= 400) {
                    setSidebarWidth(newWidth);
                }
            }
        };
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && e.target === modalRef.current) onClose();
    }

    if (!isOpen || !user) return null;

    const menuItems = ['My Account', 'Profiles', 'Privacy & Safety', 'Appearance', 'Advanced', 'Authorized Apps', 'Connections'];

  return (
    <div 
        ref={modalRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div 
        ref={modalContentRef}
        className="bg-gray-800 w-full max-w-4xl h-[600px] rounded-lg shadow-xl flex transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
      >
        <div 
            className="bg-gray-800 p-4 pt-14 flex-shrink-0 flex flex-col"
            style={{ width: `${sidebarWidth}px`}}
        >
            <h3 className="text-xs font-bold uppercase text-gray-400 px-2 mb-2">User Settings</h3>
            {menuItems.map(item => (
                <button
                    key={item}
                    onClick={() => setActiveSection(item)}
                    className={`w-full text-left text-sm font-medium py-1.5 px-2 rounded mb-1 truncate ${activeSection === item ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                >
                    {item}
                </button>
            ))}
            <div className="h-px bg-gray-700 my-2"></div>
             <button
                className={`w-full text-left text-sm font-medium py-1.5 px-2 rounded mb-1 text-gray-400 hover:bg-gray-700/50 hover:text-white`}
            >
                Log Out
            </button>
        </div>
        
        <div 
            className="w-1.5 cursor-col-resize bg-gray-900/50 hover:bg-green-500 transition-colors duration-200"
            onMouseDown={handleMouseDown}
        ></div>

        <div className="flex-1 flex flex-col bg-gray-700 relative rounded-r-lg">
             <div className="flex-1 p-8 overflow-y-auto">
                {activeSection === 'My Account' && (
                  <MyAccountView user={user} onUpdate={onUpdateCurrentUser} />
                )}
                {activeSection === 'Appearance' && (
                  <AppearanceSettings settings={userSettings} onUpdate={onUpdateUserSettings} />
                )}
                {activeSection === 'Privacy & Safety' && (
                    <PrivacySafetyView 
                        user={user} 
                        settings={userSettings}
                        onUpdateSettings={onUpdateUserSettings}
                        onUpdateUser={onUpdateCurrentUser}
                    />
                )}
                 {activeSection === 'Advanced' && (
                    <AdvancedSettingsView settings={userSettings} onUpdate={onUpdateUserSettings} />
                )}
                {(activeSection !== 'My Account' && activeSection !== 'Appearance' && activeSection !== 'Advanced' && activeSection !== 'Privacy & Safety') && (
                     <div className="text-center text-gray-400 pt-10">
                        <h2 className="text-2xl font-bold text-white mb-6">{activeSection}</h2>
                        <p>This section is under construction.</p>
                    </div>
                 )}
             </div>
             <div className="absolute top-6 right-6">
                <button 
                    onClick={onClose} 
                    className="flex flex-col items-center justify-center w-12 h-12 border-2 border-gray-500 rounded-full text-gray-400 hover:text-white hover:border-white transition-colors"
                    aria-label="Close settings"
                >
                    <span className="text-2xl leading-none">&times;</span>
                    <span className="text-[10px] uppercase font-bold">ESC</span>
                </button>
             </div>
        </div>
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

export default UserSettingsModal;
