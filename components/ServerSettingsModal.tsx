
import React from 'react';
import type { Server, Role, Channel, Category, User, Emoji, AuditLogEntry, Ban, WelcomeScreenSettings, AutoModRule, SubscriptionTier } from '../types';
import { serverPermissions } from '../data';
import { getHighestRole, hasServerPermission } from '../permissions';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  allUsers: User[];
  currentUser?: User;
  channels: Channel[];
  categories: Category[];
  onUpdateServer: (server: Server) => void;
  onDeleteServer: (serverId: string) => void;
  onAddChannel: (name: string, type: 'text' | 'voice') => void;
  onAddCategory: (name: string) => void;
  onAddRole: () => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
  onReorderRoles: (reorderedRoles: Role[]) => void;
  onUpdateServerMember: (memberId: string, updates: { roles?: string[]; nickname?: string; }) => void;
  onUnbanUser: (userId: string) => void;
  onAddEmoji: (name: string, imageUrl: string) => void;
  onDeleteEmoji: (emojiId: string) => void;
  onUpdateSubscriptionTiers: (tiers: SubscriptionTier[]) => void;
}

// --- UI HELPER COMPONENTS ---

const PRESET_COLORS = [
  '#99AAB5', '#607D8B', '#7289DA', '#5865F2', '#3498DB', '#03A9F4',
  '#1ABC9C', '#11806A', '#2ECC71', '#1F8B4C', '#84CC16', '#558B2F',
  '#F1C40F', '#C27C0E', '#F9A825', '#E67E22', '#A84300', '#795548',
  '#E74C3C', '#992D22', '#E91E63', '#AD1457', '#9B59B6', '#71368A'
];

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    const icon = checked 
        ? <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>;

    return (
        <button 
            onClick={() => !disabled && onChange(!checked)} 
            className={`relative inline-flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
        >
            <span className={`absolute left-1 transition-transform duration-200 ease-in-out transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}>
                <span className="flex items-center justify-center w-5 h-5 bg-white/80 rounded-full shadow">
                    {icon}
                </span>
            </span>
        </button>
    );
}
const DeleteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const CheckIcon = () => <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CrossIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const NeutralIcon = () => <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;


// --- SUB-VIEWS FOR SETTINGS ---

const OverviewView: React.FC<{ server: Server, onUpdateServer: (s: Server) => void, currentUser: User }> = ({ server, onUpdateServer, currentUser }) => {
    const [name, setName] = React.useState(server.name);
    const [imageUrl, setImageUrl] = React.useState(server.imageUrl);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const canManageServer = hasServerPermission('Manage Server', currentUser, server);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        onUpdateServer({ ...server, name, imageUrl });
    };
    
    const hasChanges = name !== server.name || imageUrl !== server.imageUrl;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Server Overview</h2>
            <div className="flex space-x-6">
                <div className="flex-shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={!canManageServer} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={!canManageServer} className="relative w-32 h-32 group">
                        <img src={imageUrl || 'https://via.placeholder.com/128'} alt="Server Icon" className="w-full h-full rounded-full object-cover"/>
                        {canManageServer && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">CHANGE ICON</div>}
                    </button>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Server Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={!canManageServer} className="w-full bg-gray-800 rounded p-2 disabled:cursor-not-allowed"/>
                    <p className="text-xs text-gray-400 mt-2">We recommend a name that's easy to remember.</p>
                </div>
            </div>
            {hasChanges && (
                <div className="mt-4 bg-gray-900/50 p-3 rounded flex justify-between items-center">
                    <span className="text-sm text-gray-300">You have unsaved changes.</span>
                    <div>
                        <button onClick={() => { setName(server.name); setImageUrl(server.imageUrl); }} className="text-white hover:underline text-sm font-medium mr-4">Reset</button>
                        <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm">Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
};
const RolesView: React.FC<{ server: Server, currentUser?: User, allUsers: User[], onAddRole: () => void, onUpdateRole: (r: Role) => void, onDeleteRole: (id: string) => void, onReorderRoles: (roles: Role[]) => void, onUpdateServerMember: (memberId: string, updates: { roles?: string[], nickname?: string }) => void }> = ({ server, currentUser, onAddRole, onUpdateRole, onDeleteRole, onReorderRoles, onUpdateServerMember, allUsers }) => {
    type Screen = 'list' | 'edit' | 'permissions' | 'members';
    const [screen, setScreen] = React.useState<Screen>('list');
    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
    
    const [editedRole, setEditedRole] = React.useState<Role | null>(null);
    const [draggedRoleId, setDraggedRoleId] = React.useState<string | null>(null);
    const [isReordering, setIsReordering] = React.useState(false);

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        setEditedRole(role);
        setScreen('edit');
    };

    const handleBack = () => {
        if (screen === 'edit' || screen === 'permissions' || screen === 'members') {
            setScreen('list');
            setSelectedRole(null);
            setEditedRole(null);
        }
    };

    const handleSaveChanges = () => {
        if (editedRole) {
            onUpdateRole(editedRole);
            handleBack();
        }
    };

    const handleDragStart = (e: React.DragEvent, roleId: string) => {
        setDraggedRoleId(roleId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetRoleId: string) => {
        e.preventDefault();
        if (!draggedRoleId || draggedRoleId === targetRoleId || !server.roles) return;
        
        const roles = [...server.roles];
        const draggedIndex = roles.findIndex(r => r.id === draggedRoleId);
        const targetIndex = roles.findIndex(r => r.id === targetRoleId);
        
        const [draggedItem] = roles.splice(draggedIndex, 1);
        roles.splice(targetIndex, 0, draggedItem);
        
        onReorderRoles(roles);
        setDraggedRoleId(null);
    };

    const RolesListScreen = () => (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Roles</h3>
                <div>
                    <button onClick={() => setIsReordering(!isReordering)} className="text-sm text-blue-400 hover:underline mr-4">{isReordering ? 'Done' : 'Reorder'}</button>
                    <button onClick={onAddRole} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-sm">+</button>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">Use roles to group your members and assign permissions.</p>
            <div className="space-y-2">
                {server.roles?.map(role => {
                    const memberCount = Object.values(server.memberRoles).filter(r => Array.isArray(r) && r.includes(role.id)).length;
                    return (
                        <div 
                            key={role.id} 
                            draggable={isReordering}
                            onDragStart={(e) => handleDragStart(e, role.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, role.id)}
                            onClick={() => !isReordering && handleSelectRole(role)}
                            className={`flex items-center justify-between p-3 rounded-lg ${isReordering ? 'cursor-move' : 'cursor-pointer hover:bg-gray-600/50'}`}
                        >
                            <div className="flex items-center">
                                <div className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: role.color }}></div>
                                <span className="font-semibold">{role.name}</span>
                            </div>
                            <span className="text-sm text-gray-400">{memberCount} Members</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    if (screen === 'edit' && selectedRole && editedRole) {
        return <RoleEditView role={selectedRole} editedRole={editedRole} onUpdate={setEditedRole} onBack={handleBack} onSave={handleSaveChanges} onDelete={() => { onDeleteRole(selectedRole.id); handleBack(); }} setScreen={setScreen} />;
    }
    if (screen === 'permissions' && selectedRole && editedRole) {
        return <PermissionsSettingsView role={editedRole} onUpdate={setEditedRole} onBack={() => setScreen('edit')} onSave={handleSaveChanges} />;
    }
    if (screen === 'members' && selectedRole && editedRole) {
        return <RoleMembersView role={editedRole} server={server} allUsers={allUsers} onUpdateServerMember={onUpdateServerMember} onBack={() => setScreen('edit')} />;
    }
    
    return <div className="p-6"><RolesListScreen /></div>;
};

const RoleEditView: React.FC<{
    role: Role;
    editedRole: Role;
    onUpdate: (role: Role) => void;
    onBack: () => void;
    onSave: () => void;
    onDelete: () => void;
    setScreen: (screen: 'edit' | 'permissions' | 'members') => void;
}> = ({ role, editedRole, onUpdate, onBack, onSave, onDelete, setScreen }) => {
    
    const hasChanges = JSON.stringify(role) !== JSON.stringify(editedRole);

    return (
        <div>
            <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="text-lg font-bold">Edit Role - {role.name}</h3>
            </div>
            <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Role Name</label>
                    <input type="text" value={editedRole.name} onChange={e => onUpdate({ ...editedRole, name: e.target.value })} className="w-full bg-gray-800 rounded p-2"/>
                </div>
                 <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Role Color</label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map(color => (
                            <button key={color} onClick={() => onUpdate({ ...editedRole, color })} className={`w-10 h-10 rounded-full transition-all ${editedRole.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-700' : ''}`} style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Role Icon</label>
                    <input type="text" value={editedRole.icon || ''} onChange={e => onUpdate({ ...editedRole, icon: e.target.value })} placeholder="👑" className="w-20 bg-gray-800 rounded p-2 text-center" />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">Display role members separately</h4>
                        <p className="text-sm text-gray-400">Show this role in its own group in the members list.</p>
                    </div>
                    <ToggleSwitch checked={!!editedRole.displaySeparately} onChange={c => onUpdate({ ...editedRole, displaySeparately: c })} />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">Allow anyone to @mention this role</h4>
                        <p className="text-sm text-gray-400">Let anyone ping this role in chat.</p>
                    </div>
                    <ToggleSwitch checked={!!editedRole.isMentionable} onChange={c => onUpdate({ ...editedRole, isMentionable: c })} />
                </div>

                <div className="space-y-2">
                    <button onClick={() => setScreen('permissions')} className="w-full text-left p-3 bg-gray-800 hover:bg-gray-900/50 rounded-lg">Permissions</button>
                    <button onClick={() => setScreen('members')} className="w-full text-left p-3 bg-gray-800 hover:bg-gray-900/50 rounded-lg">Manage Members</button>
                </div>

                <div className="border-t border-gray-900/50 pt-4">
                     <button onClick={onDelete} className="text-red-500 font-semibold hover:underline">Delete Role</button>
                </div>
            </div>
            {hasChanges && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-max bg-gray-900 p-3 rounded-lg shadow-2xl flex items-center space-x-4">
                    <p className="text-sm text-gray-300">Careful — you have unsaved changes!</p>
                    <button onClick={() => onUpdate(role)} className="text-white hover:underline text-sm font-medium">Reset</button>
                    <button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200">Save Changes</button>
                </div>
            )}
        </div>
    );
};

const PermissionsSettingsView: React.FC<{
    role: Role;
    onUpdate: (role: Role) => void;
    onBack: () => void;
    onSave: () => void;
}> = ({ role, onUpdate, onBack, onSave }) => {

    const [searchTerm, setSearchTerm] = React.useState('');
    
    const handlePermissionToggle = (permission: string, value: boolean) => {
        onUpdate({
            ...role,
            permissions: { ...role.permissions, [permission]: value }
        });
    };

    const filteredPermissions = React.useMemo(() => {
        if (!searchTerm) return serverPermissions;
        const lowerSearch = searchTerm.toLowerCase();
        const filtered: typeof serverPermissions = {};
        Object.entries(serverPermissions).forEach(([category, permissions]) => {
            const matchingPermissions = permissions.filter(p => 
                p.name.toLowerCase().includes(lowerSearch) || 
                p.description.toLowerCase().includes(lowerSearch)
            );
            if (matchingPermissions.length > 0) {
                filtered[category] = matchingPermissions;
            }
        });
        return filtered;
    }, [searchTerm]);

    return (
        <div>
             <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="text-lg font-bold">Permissions - {role.name}</h3>
            </div>
            <div className="mb-4">
                <input type="text" placeholder="Search permissions" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-800 rounded p-2" />
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                {Object.keys(filteredPermissions).map(category => (
                    <div key={category}>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">{category}</h4>
                        {filteredPermissions[category].map(perm => (
                            <div key={perm.name} className="flex justify-between items-center py-3 border-b border-gray-800/60">
                                <div>
                                    <p className="font-semibold">{perm.name}</p>
                                    <p className="text-sm text-gray-400">{perm.description}</p>
                                </div>
                                <ToggleSwitch 
                                    checked={role.permissions[perm.name] || false} 
                                    onChange={(c) => handlePermissionToggle(perm.name, c)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const RoleMembersView: React.FC<{
    role: Role;
    server: Server;
    allUsers: User[];
    onUpdateServerMember: (memberId: string, updates: { roles?: string[] }) => void;
    onBack: () => void;
}> = ({ role, server, allUsers, onUpdateServerMember, onBack }) => {
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);

    const membersWithRole = React.useMemo(() => {
        return allUsers.filter(u => server.memberRoles[u.id]?.includes(role.id));
    }, [allUsers, server.memberRoles, role.id]);

    const availableMembers = React.useMemo(() => {
        return allUsers.filter(u => server.memberIds.includes(u.id) && !server.memberRoles[u.id]?.includes(role.id));
    }, [allUsers, server.memberIds, server.memberRoles, role.id]);

    const handleToggleMember = (memberId: string, hasRole: boolean) => {
        const currentRoles = server.memberRoles[memberId] || [];
        const newRoles = hasRole
            ? currentRoles.filter(rId => rId !== role.id)
            : [...currentRoles, role.id];
        onUpdateServerMember(memberId, { roles: newRoles });
    };

    const displayedMembers = (isAdding ? availableMembers : membersWithRole)
        .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
         <div>
             <div className="flex items-center mb-6">
                 <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="text-lg font-bold">{isAdding ? 'Add Members to' : 'Members with'} - {role.name}</h3>
            </div>
            <div className="flex justify-between items-center mb-4">
                <input type="text" placeholder="Search members" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-800 rounded p-2" />
                <button onClick={() => setIsAdding(!isAdding)} className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm whitespace-nowrap">{isAdding ? 'Done' : 'Add Members'}</button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                {displayedMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50">
                        <div className="flex items-center">
                            <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full mr-3"/>
                            <span className="font-semibold">{member.name}</span>
                        </div>
                        <button onClick={() => handleToggleMember(member.id, !isAdding)} className={`px-3 py-1 text-sm rounded ${isAdding ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}>
                            {isAdding ? 'Add' : 'Remove'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
};


const PermissionsViewerView: React.FC<{ server: Server; channels: Channel[]; allUsers: User[] }> = ({ server, channels, allUsers }) => {
    const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
    const [selectedChannelId, setSelectedChannelId] = React.useState<string | null>(null);

    const calculatedPermissions = React.useMemo(() => {
        if (!selectedMemberId || !selectedChannelId) return null;

        const member = allUsers.find(u => u.id === selectedMemberId);
        const channel = channels.find(c => c.id === selectedChannelId);
        if (!member || !channel || !server.roles) return null;

        const memberRoles = server.roles.filter(r => server.memberRoles[member.id]?.includes(r.id));
        const isAdmin = memberRoles.some(r => r.permissions['Administrator']);

        const results: { name: string; description: string; server: boolean; channel: 'allow' | 'deny' | 'neutral'; final: boolean; }[] = [];
        
        Object.values(serverPermissions).flat().forEach(perm => {
            const hasBasePermission = memberRoles.some(r => r.permissions[perm.name]);
            const serverPermission = isAdmin || hasBasePermission;

            const overrides = channel.permissionOverwrites || [];
            const hasDeny = memberRoles.some(role => overrides.find(o => o.id === role.id)?.deny.includes(perm.name));
            const hasAllow = memberRoles.some(role => overrides.find(o => o.id === role.id)?.allow.includes(perm.name));
            
            let channelOverride: 'allow' | 'deny' | 'neutral' = 'neutral';
            if (hasDeny) channelOverride = 'deny';
            else if (hasAllow) channelOverride = 'allow';
            
            let finalResult = serverPermission;
            if (channelOverride === 'deny') finalResult = false;
            if (channelOverride === 'allow') finalResult = true;
            if (isAdmin) finalResult = true;

            results.push({
                name: perm.name,
                description: perm.description,
                server: serverPermission,
                channel: channelOverride,
                final: finalResult
            });
        });
        
        return results;

    }, [selectedMemberId, selectedChannelId, server, channels, allUsers]);
    
    const Select: React.FC<{ options: {value: string, label: string}[], value: string | null, onChange: (value: string) => void, placeholder: string }> = ({ options, value, onChange, placeholder }) => (
        <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-gray-800 rounded p-2 text-white border border-gray-900/50 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Permissions Viewer</h2>
            <p className="text-sm text-gray-400 mb-6">Select a member and a channel to see a detailed breakdown of their permissions. This helps debug why someone can or cannot do something.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Select
                    value={selectedMemberId}
                    onChange={setSelectedMemberId}
                    placeholder="Select a member"
                    options={allUsers.filter(u => server.memberIds.includes(u.id)).map(u => ({ value: u.id, label: u.name }))}
                />
                <Select
                    value={selectedChannelId}
                    onChange={setSelectedChannelId}
                    placeholder="Select a channel"
                    options={channels.map(c => ({ value: c.id, label: `#${c.name}` }))}
                />
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {!calculatedPermissions ? (
                    <div className="text-center text-gray-500 pt-10">Select a member and a channel to view permissions.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 bg-gray-700">
                            <tr>
                                <th className="p-2 font-semibold">Permission</th>
                                <th className="p-2 font-semibold text-center">Server Role</th>
                                <th className="p-2 font-semibold text-center">Channel Override</th>
                                <th className="p-2 font-semibold text-center">Final Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculatedPermissions.map(perm => (
                                <tr key={perm.name} className="border-b border-gray-800/60 hover:bg-gray-800/30">
                                    <td className="p-2 font-medium">{perm.name}</td>
                                    <td className="p-2 text-center">{perm.server ? <CheckIcon /> : <CrossIcon />}</td>
                                    <td className="p-2 text-center">
                                        {perm.channel === 'allow' && <CheckIcon />}
                                        {perm.channel === 'deny' && <CrossIcon />}
                                        {perm.channel === 'neutral' && <NeutralIcon />}
                                    </td>
                                    <td className="p-2 text-center">{perm.final ? <CheckIcon /> : <CrossIcon />}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const SubscriptionSettingsView: React.FC<{ server: Server; onUpdateTiers: (tiers: SubscriptionTier[]) => void; }> = ({ server, onUpdateTiers }) => {
    const [tiers, setTiers] = React.useState(server.subscriptionTiers || []);
    const [editingTier, setEditingTier] = React.useState<Partial<SubscriptionTier> | null>(null);

    const handleSave = () => {
        if (!editingTier) return;
        if (editingTier.id) {
            onUpdateTiers(tiers.map(t => t.id === editingTier!.id ? editingTier as SubscriptionTier : t));
        } else {
            onUpdateTiers([...tiers, { ...editingTier, id: `tier-${Date.now()}` } as SubscriptionTier]);
        }
        setEditingTier(null);
    };

    const handleDelete = (tierId: string) => {
        if (window.confirm("Are you sure you want to delete this tier? This cannot be undone.")) {
            onUpdateTiers(tiers.filter(t => t.id !== tierId));
        }
    };
    
    if (editingTier) {
        return (
            <div className="p-6">
                 <h2 className="text-xl font-bold mb-4">{editingTier.id ? 'Edit Tier' : 'Create Tier'}</h2>
                 <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Tier Name</label>
                        <input type="text" value={editingTier.name || ''} onChange={e => setEditingTier({...editingTier, name: e.target.value})} className="w-full bg-gray-800 rounded p-2"/>
                    </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Price</label>
                        <input type="text" value={editingTier.price || ''} placeholder="$4.99/month" onChange={e => setEditingTier({...editingTier, price: e.target.value})} className="w-full bg-gray-800 rounded p-2"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Description</label>
                        <textarea value={editingTier.description || ''} onChange={e => setEditingTier({...editingTier, description: e.target.value})} className="w-full bg-gray-800 rounded p-2 h-24 resize-none"/>
                    </div>
                    <div>
                         <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Linked Role</label>
                         <select value={editingTier.roleId || ''} onChange={e => setEditingTier({...editingTier, roleId: e.target.value})} className="w-full bg-gray-800 rounded p-2">
                            <option value="" disabled>Select a role</option>
                            {(server.roles || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                         </select>
                    </div>
                 </div>
                 <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={() => setEditingTier(null)} className="text-white hover:underline">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">Save Tier</button>
                 </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">Server Subscriptions</h2>
                 <button onClick={() => setEditingTier({})} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">Create Tier</button>
            </div>
            <p className="text-sm text-gray-400 mb-6">Create subscription tiers to offer exclusive content and monetize your server.</p>
            <div className="space-y-4">
                {(server.subscriptionTiers || []).map(tier => (
                    <div key={tier.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-yellow-400">{tier.name} - <span className="text-white">{tier.price}</span></h3>
                                <p className="text-sm text-gray-300 mt-1">{tier.description}</p>
                                <div className="text-xs text-gray-500 mt-2">Linked Role: <span className="font-semibold" style={{color: server.roles?.find(r => r.id === tier.roleId)?.color}}>{server.roles?.find(r => r.id === tier.roleId)?.name || 'None'}</span></div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => setEditingTier(tier)} className="text-sm text-blue-400 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(tier.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmojisView: React.FC<{ server: Server, onAddEmoji: (name: string, url: string) => void, onDeleteEmoji: (id: string) => void, currentUser: User }> = ({ server, onAddEmoji, onDeleteEmoji, currentUser }) => {
    const canManageEmojis = hasServerPermission('Manage Expressions', currentUser, server);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const name = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '');
                if (name) {
                    onAddEmoji(name, reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset file input
    };
    
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Emojis</h2>
            <div className="grid grid-cols-5 gap-4">
                {(server.emojis || []).map(emoji => (
                    <div key={emoji.id} className="group relative flex flex-col items-center bg-gray-800 p-2 rounded">
                        <img src={emoji.imageUrl} alt={emoji.name} className="w-12 h-12 object-contain" />
                        <p className="text-sm text-gray-300 mt-1">:{emoji.name}:</p>
                        {canManageEmojis && (
                            <button onClick={() => onDeleteEmoji(emoji.id)} className="absolute top-1 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100">
                                <DeleteIcon />
                            </button>
                        )}
                    </div>
                ))}
                {canManageEmojis && (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center bg-gray-800 p-2 rounded border-2 border-dashed border-gray-600 hover:border-green-500">
                            <span className="text-3xl text-gray-500">+</span>
                            <span className="text-xs font-bold text-gray-400">UPLOAD EMOJI</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const AuditLogView: React.FC<{ server: Server, allUsers: User[] }> = ({ server, allUsers }) => {
    const auditLog = server.auditLog || [];
    const getActorName = (actorId: string) => {
        if (actorId === 'system') return 'System';
        if (actorId === 'automod') return 'AutoMod';
        return allUsers.find(u => u.id === actorId)?.name || 'Unknown User';
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Audit Log</h2>
            <div className="flex-1 overflow-y-auto">
                {auditLog.length === 0 ? (
                    <p className="text-gray-400">No audit log entries yet.</p>
                ) : (
                    <div className="space-y-4">
                        {auditLog.map(entry => (
                            <div key={entry.id} className="p-3 bg-gray-800 rounded">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-white">
                                        <span className="text-blue-400">{getActorName(entry.actorId)}</span> {entry.action} <span className="text-yellow-400">{entry.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{entry.timestamp}</p>
                                </div>
                                {entry.changes && entry.changes.map((change, index) => (
                                    <p key={index} className="text-sm text-gray-400 pl-4">- {change.key}: "{String(change.oldValue)}" to "{String(change.newValue)}"</p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const BansView: React.FC<{ server: Server, allUsers: User[], onUnbanUser: (userId: string) => void }> = ({ server, allUsers, onUnbanUser }) => {
    const bans = server.bans || [];
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Bans ({bans.length})</h2>
            {bans.length === 0 ? (
                <p className="text-gray-400">No one is banned from this server.</p>
            ) : (
                <div className="space-y-2">
                    {bans.map(ban => {
                        const user = allUsers.find(u => u.id === ban.userId);
                        return (
                            <div key={ban.userId} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                                <div className="flex items-center">
                                    <img src={user?.avatarUrl || 'https://via.placeholder.com/40'} alt={user?.name} className="w-10 h-10 rounded-full mr-4" />
                                    <div>
                                        <p className="font-semibold text-white">{user?.name || 'Unknown User'}</p>
                                        <p className="text-sm text-gray-400">Reason: {ban.reason || 'No reason provided.'}</p>
                                    </div>
                                </div>
                                <button onClick={() => onUnbanUser(ban.userId)} className="text-sm text-blue-400 hover:underline">Revoke Ban</button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const MembersView: React.FC<{ server: Server, allUsers: User[] }> = ({ server, allUsers }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const members = allUsers.filter(u => server.memberIds.includes(u.id) && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
         <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Members ({server.memberIds.length})</h2>
            <input type="text" placeholder="Search members" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-800 rounded p-2 mb-4" />
            <div className="flex-1 overflow-y-auto">
                {members.map(member => {
                    const highestRole = getHighestRole(member, server);
                    return (
                        <div key={member.id} className="flex items-center p-2 border-b border-gray-800/60">
                            <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-semibold" style={{color: highestRole?.color}}>{server.memberNicknames?.[member.id] || member.name}</p>
                                <p className="text-xs text-gray-400">Joined: {member.joinedAt}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN MODAL COMPONENT ---
const ServerSettingsModal: React.FC<ServerSettingsModalProps> = (props) => {
  const { isOpen, onClose, server, currentUser } = props;
  const [activeSection, setActiveSection] = React.useState('Overview');
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) setActiveSection('Overview');
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) onClose();
  };
  
  if (!isOpen || !currentUser) return null;
  
  const hasPerm = (p: string) => hasServerPermission(p, currentUser, server);
  const isOwner = server.ownerId === currentUser.id;
  
  const menuItems = [
    { name: 'Overview', show: true },
    { name: 'Roles', show: hasPerm('Manage Roles') },
    { name: 'Emojis', show: hasPerm('Manage Expressions') },
    { name: 'Welcome Screen', show: hasPerm('Manage Server') },
    { name: 'Server Subscriptions', show: isOwner },
    { name: 'AutoMod', show: hasPerm('Manage Server') },
    { name: 'Moderation', isHeader: true, show: true },
    { name: 'Audit Log', show: hasPerm('View Audit Log') },
    { name: 'Bans', show: hasPerm('Ban Members') },
    { name: 'Permissions Viewer', show: hasPerm('View Audit Log') },
    { name: 'User Management', isHeader: true, show: true },
    { name: 'Members', show: hasPerm('Manage Nicknames') || hasPerm('Kick Members') },
    { name: 'Invites', show: hasPerm('Manage Server') },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'Overview':
        return <OverviewView server={server} onUpdateServer={props.onUpdateServer} currentUser={currentUser} />;
      case 'Roles':
        return <RolesView {...props} />;
      case 'Permissions Viewer':
        return <PermissionsViewerView server={server} channels={props.channels} allUsers={props.allUsers} />;
      case 'Server Subscriptions':
        return <SubscriptionSettingsView server={server} onUpdateTiers={props.onUpdateSubscriptionTiers} />;
      case 'Emojis':
        return <EmojisView server={server} onAddEmoji={props.onAddEmoji} onDeleteEmoji={props.onDeleteEmoji} currentUser={currentUser} />;
      case 'Audit Log':
        return <AuditLogView server={server} allUsers={props.allUsers} />;
      case 'Bans':
        return <BansView server={server} allUsers={props.allUsers} onUnbanUser={props.onUnbanUser} />;
      case 'Members':
        return <MembersView server={server} allUsers={props.allUsers} />;
      default:
        return (
          <div className="p-6 text-center text-gray-400">
            <h2 className="text-xl font-bold text-white mb-4">{activeSection}</h2>
            <p>This section is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-800 w-full max-w-5xl h-[90vh] rounded-lg shadow-xl flex transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="w-1/4 bg-gray-800 p-4 pt-14 flex flex-col space-y-1">
          {menuItems.filter(item => item.show).map(item =>
            item.isHeader ? (
              <h3 key={item.name} className="text-xs font-bold uppercase text-gray-400 px-2 mt-4 mb-1">{item.name}</h3>
            ) : (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full text-left text-sm font-medium py-1.5 px-2 rounded ${activeSection === item.name ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
              >
                {item.name}
              </button>
            )
          )}
           <div className="border-t border-gray-900/50 my-2"></div>
           {hasPerm('Manage Server') && <button onClick={() => props.onDeleteServer(server.id)} className="w-full text-left text-sm font-medium py-1.5 px-2 rounded text-red-500 hover:bg-red-500/20">Delete Server</button>}
        </div>
        <div className="w-3/4 bg-gray-700 relative rounded-r-lg flex flex-col">
           <div className="flex-1 overflow-y-auto">{renderContent()}</div>
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

export default ServerSettingsModal;
