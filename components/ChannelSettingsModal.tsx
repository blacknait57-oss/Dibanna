import React from 'react';
import type { Channel, Server, Role, PermissionOverwrite } from '../types';
import { serverPermissions } from '../data';

interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  server: Server;
  onUpdateChannel: (channel: Channel) => void;
}

type View = 'main' | 'permissionsList' | 'permissionOverrides';
type PermissionState = 'allow' | 'deny' | 'neutral';

// --- UI HELPER COMPONENTS (Dark Theme for Modal) ---

const Header: React.FC<{ title: string; onBack: () => void; onSave?: () => void; saveDisabled?: boolean }> = ({ title, onBack, onSave, saveDisabled }) => (
    <div className="flex items-center p-4 bg-gray-800 shadow-md sticky top-0 z-10 shrink-0 border-b border-gray-900/50">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div className="flex-1 text-center min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{title}</h1>
        </div>
        {onSave ? (
            <button onClick={onSave} disabled={saveDisabled} className="font-bold text-green-500 disabled:text-gray-500 w-16 text-right">Done</button>
        ) : <div className="w-16"></div>}
    </div>
);

const NavItem: React.FC<{ label: string; description?: string; onClick: () => void }> = ({ label, description, onClick }) => (
    <div onClick={onClick} className="p-4 bg-gray-700 rounded-lg shadow-sm cursor-pointer hover:bg-gray-600">
        <div className="flex items-center justify-between">
            <span className="font-medium text-white">{label}</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
        role="switch"
        aria-checked={checked}
    >
        <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const ThreeStateSwitch: React.FC<{ state: PermissionState; onChange: (newState: PermissionState) => void }> = ({ state, onChange }) => {
    const handleDenyClick = () => onChange(state === 'deny' ? 'neutral' : 'deny');
    const handleAllowClick = () => onChange(state === 'allow' ? 'neutral' : 'allow');
    
    return (
        <div className="flex items-center bg-gray-900 rounded-full p-0.5">
            <button
                onClick={handleDenyClick}
                className={`w-9 h-7 flex items-center justify-center rounded-full transition-colors ${state === 'deny' ? 'bg-red-500' : ''}`}
            >
                <svg className={`w-5 h-5 ${state === 'deny' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="w-9 h-7 flex items-center justify-center">
                 {state === 'neutral' && <div className="w-5 h-1.5 bg-gray-600 rounded-full"></div>}
            </div>
            <button
                onClick={handleAllowClick}
                className={`w-9 h-7 flex items-center justify-center rounded-full transition-colors ${state === 'allow' ? 'bg-green-500' : ''}`}
            >
                <svg className={`w-5 h-5 ${state === 'allow' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
        </div>
    );
};


// --- VIEW COMPONENTS ---

const MainSettingsView: React.FC<{
    editedChannel: Channel;
    onChannelChange: (channel: Channel) => void;
    onNavigate: (view: View) => void;
}> = ({ editedChannel, onChannelChange, onNavigate }) => {
    const slowmodeValueText = (value: number) => {
        if (value === 0) return 'Slowmode is off';
        if (value < 60) return `${value} seconds`;
        if (value < 3600) return `${Math.round(value / 60)} minutes`;
        return `${Math.round(value / 3600)} hours`;
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-6 text-white">
            <div className="bg-gray-700 p-4 rounded-lg shadow-sm space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Channel Name</label>
                    <input
                        type="text"
                        value={editedChannel.name}
                        onChange={(e) => onChannelChange({ ...editedChannel, name: e.target.value })}
                        className="w-full bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Channel Topic</label>
                    <textarea
                        value={editedChannel.topic || ''}
                        onChange={(e) => onChannelChange({ ...editedChannel, topic: e.target.value })}
                        className="w-full bg-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                        maxLength={1024}
                    />
                    <div className="text-right text-xs text-gray-400">{editedChannel.topic?.length || 0}/1024</div>
                </div>
            </div>
            
            <NavItem label="Channel Permissions" description="Change privacy settings and customize how members can interact with this channel." onClick={() => onNavigate('permissionsList')} />
            
            <div className="bg-gray-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-white">Age-Restricted Channel</h3>
                        <p className="text-sm text-gray-400 mt-1">Users will need to confirm they are over the legal age.</p>
                    </div>
                    <ToggleSwitch 
                        checked={!!editedChannel.isAgeRestricted} 
                        onChange={(c) => onChannelChange({...editedChannel, isAgeRestricted: c })} 
                    />
                </div>

                <div className="border-t border-gray-800/60 my-4"></div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-white">Slowmode Cooldown</h3>
                        <span className="text-sm text-gray-400">{slowmodeValueText(editedChannel.slowmodeCooldown || 0)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="21600" // 6 hours
                        step="5"
                        value={editedChannel.slowmodeCooldown || 0}
                        onChange={(e) => onChannelChange({ ...editedChannel, slowmodeCooldown: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer"
                    />
                     <p className="text-sm text-gray-400 mt-2">Members will be restricted to sending one message per this interval.</p>
                </div>
            </div>

            <div className="text-center text-red-500 font-medium p-4 bg-gray-700 rounded-lg shadow-sm cursor-pointer hover:bg-red-500 hover:text-white transition-colors">
                Delete Channel
            </div>
        </main>
    );
};

const PermissionsListView: React.FC<{
    server: Server;
    onNavigate: (view: View, roleId: string) => void;
}> = ({ server, onNavigate }) => {
    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
             <div className="bg-gray-700 rounded-lg shadow-sm">
                 {(server.roles || []).map((role, index, arr) => (
                    <div key={role.id} onClick={() => onNavigate('permissionOverrides', role.id)} className={`flex items-center p-4 cursor-pointer hover:bg-gray-600 ${index !== arr.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                         <div className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: role.color }}></div>
                         <span className="font-medium text-white flex-1">{role.name}</span>
                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                 ))}
             </div>
        </main>
    )
}

const PermissionOverridesView: React.FC<{
    role: Role;
    editedChannel: Channel;
    onChannelChange: (channel: Channel) => void;
}> = ({ role, editedChannel, onChannelChange }) => {

     const getPermissionState = (permissionName: string, overwrite?: PermissionOverwrite): PermissionState => {
        if (overwrite?.allow.includes(permissionName)) return 'allow';
        if (overwrite?.deny.includes(permissionName)) return 'deny';
        return 'neutral';
    };

    const handlePermissionChange = (permissionName: string, newState: PermissionState) => {
        const currentOverwrites = editedChannel.permissionOverwrites || [];
        const existingOverwrite = currentOverwrites.find(o => o.id === role.id) || { id: role.id, type: 'role', allow: [], deny: [] };

        let newAllow = [...existingOverwrite.allow].filter(p => p !== permissionName);
        let newDeny = [...existingOverwrite.deny].filter(p => p !== permissionName);
        
        if (newState === 'allow') newAllow.push(permissionName);
        if (newState === 'deny') newDeny.push(permissionName);

        const newOverwrite: PermissionOverwrite = { ...existingOverwrite, allow: newAllow, deny: newDeny };
        
        const newOverwrites = currentOverwrites.find(o => o.id === role.id)
            ? currentOverwrites.map(o => o.id === role.id ? newOverwrite : o)
            : [...currentOverwrites, newOverwrite];
        
        onChannelChange({ ...editedChannel, permissionOverwrites: newOverwrites });
    };

    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {Object.entries(serverPermissions).map(([category, permissions]) => (
                <div key={category}>
                    <h2 className="text-sm font-bold uppercase text-gray-400 mb-2 px-1">{category}</h2>
                    <div className="bg-gray-700 rounded-lg shadow-sm p-4 space-y-3">
                         {permissions.map(perm => (
                            <div key={perm.name} className="flex items-start justify-between">
                                <div className="pr-4">
                                    <h3 className="font-medium text-white">{perm.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{perm.description}</p>
                                </div>
                                 <ThreeStateSwitch
                                    state={getPermissionState(perm.name, editedChannel.permissionOverwrites?.find(o => o.id === role.id))}
                                    onChange={(newState) => handlePermissionChange(perm.name, newState)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </main>
    );
};


// --- MAIN MODAL COMPONENT ---

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ isOpen, onClose, channel, server, onUpdateChannel }) => {
    const [view, setView] = React.useState<View>('main');
    const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null);
    const [editedChannel, setEditedChannel] = React.useState<Channel>(channel);
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setEditedChannel(channel);
        setView('main');
        setSelectedRoleId(null);
    }, [isOpen, channel]);

    const handleNavigate = (newView: View, roleId?: string) => {
        setView(newView);
        if (roleId) setSelectedRoleId(roleId);
    };

    const handleBack = () => {
        if (view === 'permissionOverrides') setView('permissionsList');
        else if (view === 'permissionsList') setView('main');
        else onClose();
    };

    const handleSave = () => {
        onUpdateChannel(editedChannel);
        onClose();
    };

    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && e.target === modalRef.current) onClose();
    };
    
    if (!isOpen) return null;

    const renderContent = () => {
        const selectedRole = server.roles?.find(r => r.id === selectedRoleId);
        
        switch(view) {
            case 'main':
                return <MainSettingsView editedChannel={editedChannel} onChannelChange={setEditedChannel} onNavigate={handleNavigate} />;
            case 'permissionsList':
                return <PermissionsListView server={server} onNavigate={handleNavigate} />;
            case 'permissionOverrides':
                if (!selectedRole) return null;
                return <PermissionOverridesView role={selectedRole} editedChannel={editedChannel} onChannelChange={setEditedChannel} />;
            default:
                return null;
        }
    };

    const getHeaderTitle = () => {
        if (view === 'permissionsList') return 'Channel Permissions';
        if (view === 'permissionOverrides') return server.roles?.find(r => r.id === selectedRoleId)?.name || 'Permission Overrides';
        return 'Channel Settings';
    }

    return (
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        >
            <div className="bg-gray-800 w-full max-w-2xl h-[90vh] max-h-[700px] rounded-2xl shadow-xl flex flex-col text-white">
                <Header title={getHeaderTitle()} onBack={handleBack} onSave={handleSave} />
                {renderContent()}
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.15s forwards ease-out;
                }
             `}</style>
        </div>
    );
};

export default ChannelSettingsModal;