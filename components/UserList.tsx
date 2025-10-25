
import React from 'react';
import ReactDOM from 'react-dom';
import type { User, Server, Role, UserActivity, Friend } from '../types';
import { getHighestRole, hasServerPermission } from '../permissions';
import { UserListSkeleton } from './skeletons';
import { ContextMenuItem } from './ContextMenu';

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: User['status']) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-yellow-500';
    case 'dnd': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const TIMEOUT_DURATIONS = [
    { label: '60 Seconds', value: 60 * 1000 },
    { label: '5 Minutes', value: 5 * 60 * 1000 },
    { label: '10 Minutes', value: 10 * 60 * 1000 },
    { label: '1 Hour', value: 60 * 60 * 1000 },
    { label: '1 Day', value: 24 * 60 * 60 * 1000 },
    { label: '1 Week', value: 7 * 24 * 60 * 60 * 1000 },
];


// --- SUB-COMPONENTS ---

const TimeoutModal: React.FC<{
    user: User;
    onClose: () => void;
    onTimeout: (durationMs: number, reason: string) => void;
}> = ({ user, onClose, onTimeout }) => {
    const [duration, setDuration] = React.useState(TIMEOUT_DURATIONS[0].value);
    const [reason, setReason] = React.useState('');
    const modalRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSubmit = () => {
        onTimeout(duration, reason);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-gray-700 rounded-lg shadow-xl w-full max-w-md p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Timeout {user.name}</h2>
                <p className="text-sm text-gray-400 mb-4">Select the duration for the timeout. They will not be able to send messages or speak in voice channels.</p>
                
                <div className="space-y-3 mb-4">
                    <label className="text-xs font-bold uppercase text-gray-400">Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TIMEOUT_DURATIONS.map(d => (
                            <button 
                                key={d.value}
                                onClick={() => setDuration(d.value)}
                                className={`p-2 rounded text-sm font-semibold transition-colors ${duration === d.value ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-600'}`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold uppercase text-gray-400">Reason (Optional)</label>
                    <input 
                        type="text" 
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full bg-gray-800 rounded p-2 text-sm"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm font-semibold hover:underline">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold">Timeout</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const UserProfilePopover: React.FC<{
  user: User;
  server: Server;
  allUsers: User[];
  onOpenDm: (user: User) => void;
  onUpdateServer: (server: Server) => void;
  onTimeoutMember: (memberId: string, durationMs: number, reason: string) => void;
  currentUser: User;
  onUpdateCurrentUser: (updatedData: Partial<User>) => void;
  position: { top: number, left: number };
}> = ({ user, server, onOpenDm, onUpdateServer, onTimeoutMember, currentUser, onUpdateCurrentUser, position, allUsers }) => {
    const userRoles = (server.memberRoles[user.id] || [])
        .map(roleId => server.roles?.find(r => r.id === roleId))
        .filter((r): r is Role => !!r);
        
    const [isEditingRoles, setIsEditingRoles] = React.useState(false);
    const [isTimeoutModalOpen, setIsTimeoutModalOpen] = React.useState(false);

    const isBlocked = (currentUser.friends || []).some(f => f.user.id === user.id && f.status === 'blocked');

    const handleBlockToggle = () => {
        const friends = currentUser.friends || [];
        const targetUser = allUsers.find(u => u.id === user.id);
        if (!targetUser) return;

        if (isBlocked) {
            // Unblock
            const updatedFriends = friends.filter(f => f.user.id !== user.id);
            onUpdateCurrentUser({ ...currentUser, friends: updatedFriends });
        } else {
            // Block
            const updatedFriends = friends.filter(f => f.user.id !== user.id); // Remove any existing friend status
            updatedFriends.push({ user: targetUser, status: 'blocked' });
            onUpdateCurrentUser({ ...currentUser, friends: updatedFriends });
        }
    };

    const canManageRoles = React.useMemo(() => {
        return hasServerPermission("Manage Roles", currentUser, server);
    }, [currentUser, server]);

    const canTimeout = React.useMemo(() => {
        return hasServerPermission("Kick Members", currentUser, server);
    }, [currentUser, server]);

    const handleRoleToggle = (roleId: string) => {
        const currentRoles = server.memberRoles[user.id] || [];
        const isAssigned = currentRoles.includes(roleId);
        
        const newRoles = isAssigned 
            ? currentRoles.filter(id => id !== roleId)
            : [...currentRoles, roleId];

        // Re-sort the user's roles according to the server's role order to maintain hierarchy.
        const sortedNewRoles = (server.roles || [])
            .map(r => r.id)
            .filter(id => newRoles.includes(id));

        const newMemberRoles = {
            ...server.memberRoles,
            [user.id]: sortedNewRoles,
        };
        
        onUpdateServer({ ...server, memberRoles: newMemberRoles });
    };

    const MessageActionIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>;
    const BlockActionIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 8.41 8.41 5 7 6.41 10.59 10 7 13.59 8.41 15 12 11.41 15.59 15 17 13.59 13.41 10 17 6.41z"></path></svg>;
    const AddFriendActionIcon = () => <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4-4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>;
    const TimeoutIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-12h2v4h4v2h-6v-6z"></path></svg>;

    return (
        <>
            <div 
                className="fixed z-20 w-[340px] bg-[#111214] rounded-lg shadow-xl"
                style={{ top: position.top, left: position.left, transform: 'translateX(-100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-24 bg-black rounded-t-lg relative">
                     <div className="absolute -bottom-12 left-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-8 border-[#111214] bg-gray-900 object-cover" />
                        <div className={`absolute bottom-2 right-2 w-6 h-6 ${getStatusColor(user.status)} border-4 border-[#111214] rounded-full`}></div>
                    </div>
                </div>
                
                <div className="pt-14 p-4">
                    <h2 className="text-2xl font-bold font-serif text-white uppercase">{user.name}</h2>
                    
                    {user.id !== currentUser.id && (
                        <div className="grid grid-cols-4 gap-4 text-center my-4 text-gray-400">
                            <button onClick={() => onOpenDm(user)} className="flex flex-col items-center space-y-1.5 hover:text-white">
                                <MessageActionIcon />
                                <span className="text-xs">Message</span>
                            </button>
                            {canTimeout && (
                                <button onClick={() => setIsTimeoutModalOpen(true)} className="flex flex-col items-center space-y-1.5 hover:text-white">
                                    <TimeoutIcon />
                                    <span className="text-xs">إيقاف مؤقت</span>
                                </button>
                            )}
                            <button onClick={handleBlockToggle} className={`flex flex-col items-center space-y-1.5 ${isBlocked ? 'text-red-500 hover:text-red-400' : 'hover:text-white'}`}>
                                <BlockActionIcon />
                                <span className="text-xs">{isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>
                            <button disabled className="flex flex-col items-center space-y-1.5 opacity-50 cursor-not-allowed">
                                <AddFriendActionIcon />
                                <span className="text-xs">Add Friend</span>
                            </button>
                        </div>
                    )}

                    <div className="bg-[#232428] p-4 rounded-lg mt-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">date</h3>
                            <p className="text-sm text-white mt-1">{user.joinedAt}</p>
                        </div>

                        {userRoles.length > 0 && (
                            <>
                                <div className="h-px bg-black/20 my-3"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-medium text-gray-400">Roles</h3>
                                        {canManageRoles && user.id !== currentUser.id && (
                                            <button onClick={() => setIsEditingRoles(!isEditingRoles)} className="text-gray-400 hover:text-white p-1 rounded-md">
                                                {isEditingRoles 
                                                    ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                }
                                            </button>
                                        )}
                                    </div>
                                    {isEditingRoles ? (
                                        <div className="space-y-2">
                                            {(server.roles || []).filter(r => r.name !== 'OWNER SHIP👑').map(role => {
                                                const isAssigned = userRoles.some(ur => ur.id === role.id);
                                                return (
                                                    <div key={role.id} onClick={() => handleRoleToggle(role.id)} className="flex items-center cursor-pointer group">
                                                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mr-2 transition-colors ${isAssigned ? 'bg-blue-500 border-blue-500' : 'border-gray-500 group-hover:border-white'}`}>
                                                            {isAssigned && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                        </div>
                                                        <div className="flex items-center bg-gray-800 rounded px-2 py-1 text-xs flex-1">
                                                            <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: role.color }}></div>
                                                            <span className="text-gray-300">{role.name}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {userRoles.map(role => (
                                                <div key={role.id} className="flex items-center bg-gray-800 rounded px-2 py-1 text-xs">
                                                    <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: role.color }}></div>
                                                    <span className="text-gray-300">{role.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {isTimeoutModalOpen && 
                <TimeoutModal 
                    user={user} 
                    onClose={() => setIsTimeoutModalOpen(false)} 
                    onTimeout={onTimeoutMember} 
                />
            }
        </>
    );
};


// --- MAIN COMPONENT ---
interface UserListProps {
  server: Server;
  users: User[];
  allUsers: User[];
  currentUser: User;
  onUpdateServer: (server: Server) => void;
  onOpenDm: (user: User) => void;
  onTimeoutMember: (memberId: string, durationMs: number, reason: string) => void;
  isLoading: boolean;
  developerMode?: boolean;
  onContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
  onUpdateCurrentUser: (updatedData: Partial<User>) => void;
}

const MemberListItem: React.FC<{
    user: User,
    role?: Role,
    nickname?: string,
    onClick: (e: React.MouseEvent) => void;
    developerMode?: boolean;
    onContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
}> = ({ user, role, nickname, onClick, developerMode, onContextMenu }) => {
    
    const handleContextMenu = (e: React.MouseEvent) => {
        if (developerMode) {
          onContextMenu(e, [{
            label: 'Copy User ID',
            onClick: () => navigator.clipboard.writeText(user.id)
          }]);
        }
    };

    return (
        <div 
            className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-600/50" 
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            <div className="relative">
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} border-2 border-gray-700 rounded-full`}></div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <p 
                    className="text-sm font-semibold truncate"
                    style={{ color: role?.color }}
                >
                    {nickname || user.name}
                </p>
                {user.activity && <p className="text-xs text-gray-400 truncate">{user.activity.type === 'custom' ? user.activity.name : `${user.activity.type.charAt(0).toUpperCase() + user.activity.type.slice(1)} ${user.activity.name}`}</p>}
            </div>
        </div>
    );
};


const UserList: React.FC<UserListProps> = ({ server, users, currentUser, onUpdateServer, onOpenDm, onTimeoutMember, isLoading, developerMode, onContextMenu, onUpdateCurrentUser, allUsers }) => {
  const [popover, setPopover] = React.useState<{ user: User; position: { top: number, left: number } } | null>(null);

  const handleUserClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      user,
      position: { top: rect.top, left: rect.left },
    });
  };
  
  React.useEffect(() => {
    const closePopover = () => setPopover(null);
    window.addEventListener('click', closePopover);
    return () => window.removeEventListener('click', closePopover);
  }, []);


  const usersByRole = React.useMemo(() => {
    const rolesWithUsers: { role: Role; users: User[] }[] = [];
    const onlineUsersWithoutRole: User[] = [];
    const offlineUsers: User[] = [];

    const sortedRoles = (server.roles || []).filter(r => r.displaySeparately && r.name !== '@everyone').sort((a,b) => (server.roles!.indexOf(a) - server.roles!.indexOf(b)));
    
    for (const role of sortedRoles) {
      const usersInRole = users.filter(u => server.memberRoles[u.id]?.includes(role.id) && u.status !== 'offline');
      if (usersInRole.length > 0) {
        rolesWithUsers.push({ role, users: usersInRole });
      }
    }
    
    users.forEach(user => {
      if (user.status === 'offline') {
        offlineUsers.push(user);
        return;
      }
      const hasDisplayedRole = sortedRoles.some(role => server.memberRoles[user.id]?.includes(role.id));
      if (!hasDisplayedRole) {
        onlineUsersWithoutRole.push(user);
      }
    });

    return { rolesWithUsers, onlineUsersWithoutRole, offlineUsers };
  }, [server, users]);
  
  if (isLoading) {
    return <UserListSkeleton />;
  }

  return (
    <>
      <div className="flex-1 p-2 overflow-y-auto">
        {usersByRole.rolesWithUsers.map(({ role, users }) => (
          <div key={role.id}>
            <h2 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">{role.name} — {users.length}</h2>
            {users.map(user => (
              <MemberListItem 
                key={user.id} 
                user={user} 
                role={role} 
                nickname={server.memberNicknames?.[user.id]}
                onClick={(e) => handleUserClick(e, user)} 
                developerMode={developerMode}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        ))}

        {usersByRole.onlineUsersWithoutRole.length > 0 && (
            <div>
                 <h2 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Online — {usersByRole.onlineUsersWithoutRole.length}</h2>
                 {usersByRole.onlineUsersWithoutRole.map(user => {
                    const highestRole = getHighestRole(user, server);
                    return <MemberListItem 
                                key={user.id} 
                                user={user} 
                                role={highestRole || undefined} 
                                nickname={server.memberNicknames?.[user.id]}
                                onClick={(e) => handleUserClick(e, user)}
                                developerMode={developerMode}
                                onContextMenu={onContextMenu}
                            />
                 })}
            </div>
        )}
        
        {usersByRole.offlineUsers.length > 0 && (
            <div>
                 <h2 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Offline — {usersByRole.offlineUsers.length}</h2>
                 {usersByRole.offlineUsers.map(user => {
                    const highestRole = getHighestRole(user, server);
                    return <div className="opacity-50" key={user.id}><MemberListItem 
                                user={user} 
                                role={highestRole || undefined} 
                                nickname={server.memberNicknames?.[user.id]}
                                onClick={(e) => handleUserClick(e, user)}
                                developerMode={developerMode}
                                onContextMenu={onContextMenu}
                            /></div>
                 })}
            </div>
        )}
      </div>
      {popover && (
        <UserProfilePopover
          user={popover.user}
          server={server}
          position={popover.position}
          onOpenDm={onOpenDm}
          onUpdateServer={onUpdateServer}
          onTimeoutMember={onTimeoutMember}
          currentUser={currentUser}
          onUpdateCurrentUser={onUpdateCurrentUser}
          allUsers={allUsers}
        />
      )}
    </>
  );
};

export default UserList;
