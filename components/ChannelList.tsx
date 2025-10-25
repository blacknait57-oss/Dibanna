import React from 'react';
import type { Channel, User, Server, Category } from '../types';
import { hasPermission, hasServerPermission } from '../permissions';
import VoiceControls from './VoiceControls';
import { ChannelListSkeleton } from './skeletons';
import { ContextMenuItem } from './ContextMenu';

interface ChannelListProps {
  server?: Server;
  categories: Category[];
  channels: Channel[];
  selectedChannelId: string;
  onChannelSelect: (channelId: string) => void;
  currentUser?: User;
  onOpenServerSettings: () => void;
  onOpenUserSettings: () => void;
  onOpenChannelSettings: (channelId: string) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDrop: (
    draggedItem: { id: string; type: 'channel' | 'category' },
    targetItem: { id: string; type: 'channel' | 'category' | 'category-header' },
  ) => void;
  isLoading: boolean;
  connectedVoiceChannelId: string | null;
  voiceUsers: User[];
  isSelfMuted: boolean;
  isSelfDeafened: boolean;
  onDisconnectFromVoice: () => void;
  onToggleSelfMute: () => void;
  onToggleSelfDeafen: () => void;
  developerMode?: boolean;
  onContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
}

const TextIcon = () => <span className="text-gray-400 text-xl mr-2">#</span>;
const VoiceIcon = () => (
    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
);
const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
);
const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);
const SettingsIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>;
const MicIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.001 8.001 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0v-1a1 1 0 011-1h2a1 1 0 011 1v1a8.001 8.001 0 01-9 6.93z" clipRule="evenodd"></path></svg>;
const HeadphoneIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 8a6 6 0 00-12 0v1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2v1a6 6 0 1012 0v-1h2a1 1 0 001-1V9a1 1 0 00-1-1h-2V8z"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const DeleteIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;


const ChannelList: React.FC<ChannelListProps> = (props) => {
  const { 
    server, categories, channels, selectedChannelId, onChannelSelect, 
    currentUser, onOpenServerSettings, onOpenUserSettings, onOpenChannelSettings,
    onAddCategory, onUpdateCategory, onDeleteCategory, onDrop,
    isLoading, connectedVoiceChannelId, voiceUsers, isSelfMuted, isSelfDeafened,
    onDisconnectFromVoice, onToggleSelfMute, onToggleSelfDeafen, developerMode, onContextMenu
  } = props;

  const [isServerDropdownOpen, setIsServerDropdownOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<{id: string, name: string} | null>(null);
  const [draggedItem, setDraggedItem] = React.useState<{id: string, type: 'channel' | 'category'} | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const canManageChannels = React.useMemo(() => {
    if (!currentUser || !server) return false;
    return hasServerPermission('Manage Channels', currentUser, server);
  }, [currentUser, server]);
  
  const canAccessServerSettings = React.useMemo(() => {
    if (!currentUser || !server) return false;
    const adminPermissions = [
        "Manage Server", "Manage Roles", "Manage Channels", "Manage Expressions", 
        "View Audit Log", "Ban Members", "Kick, Approve, and Reject Members", "Manage Nicknames"
    ];
    return adminPermissions.some(p => hasServerPermission(p, currentUser, server));
  }, [currentUser, server]);


  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'channel' | 'category') => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ id, type });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetItem: { id: string; type: 'channel' | 'category' | 'category-header' }) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== targetItem.id) {
        onDrop(draggedItem, targetItem);
    }
    setDraggedItem(null);
  };
  
  const handleEditCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && editingCategory) {
          onUpdateCategory({ ...editingCategory, name: e.currentTarget.value });
          setEditingCategory(null);
      } else if (e.key === 'Escape') {
          setEditingCategory(null);
      }
  };

  if (isLoading) {
    return <ChannelListSkeleton />;
  }
  
  if (!currentUser || !server) return null;

  const uncategorizedChannels = channels.filter(c => !c.categoryId);

  return (
    <div className="flex flex-col h-full">
        <div className="relative">
            <div
                onClick={() => setIsServerDropdownOpen(prev => !prev)}
                className="p-4 shadow-md flex items-center justify-between cursor-pointer hover:bg-gray-600/50 border-b border-gray-900/50"
            >
                <h1 className="font-bold text-white text-lg truncate">{server?.name}</h1>
                <ChevronDownIcon />
            </div>
            {isServerDropdownOpen && (
                <div ref={dropdownRef} className="absolute top-16 left-2 right-2 bg-gray-900 rounded shadow-lg z-10 p-2 text-sm">
                    {canManageChannels && (
                        <button 
                            onClick={() => { onAddCategory('New Category'); setIsServerDropdownOpen(false); }}
                            className="w-full px-2 py-1.5 text-left text-gray-300 hover:bg-green-600 hover:text-white rounded"
                        >
                            Create Category
                        </button>
                    )}
                    {canAccessServerSettings && (
                        <button 
                            onClick={() => { onOpenServerSettings(); setIsServerDropdownOpen(false); }}
                            className="flex justify-between items-center w-full px-2 py-1.5 text-gray-300 hover:bg-green-600 hover:text-white rounded"
                        >
                            Server Settings
                            <SettingsIcon />
                        </button>
                    )}
                </div>
            )}
        </div>
      <div className="flex-1 overflow-y-auto p-2">
        {uncategorizedChannels.map(channel => (
          <ChannelItemWrapper key={channel.id} channel={channel} server={server!} currentUser={currentUser!} selectedChannelId={selectedChannelId} onChannelSelect={onChannelSelect} onOpenChannelSettings={onOpenChannelSettings} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} connectedVoiceChannelId={connectedVoiceChannelId} voiceUsers={voiceUsers} developerMode={developerMode} onContextMenu={onContextMenu} />
        ))}
        
        {categories.map(category => (
          <div 
            key={category.id} 
            className="mb-4"
            draggable
            onDragStart={(e) => handleDragStart(e, category.id, 'category')}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, { id: category.id, type: 'category' })}
          >
            <div 
              className="flex items-center group px-2"
              onDragOver={handleDragOver}
              onDrop={(e) => { e.stopPropagation(); handleDrop(e, { id: category.id, type: 'category-header' }); }}
            >
              {editingCategory?.id === category.id ? (
                  <input 
                      type="text"
                      defaultValue={category.name}
                      onKeyDown={handleEditCategory}
                      onBlur={() => setEditingCategory(null)}
                      autoFocus
                      className="text-xs font-bold uppercase text-gray-200 bg-transparent flex-1 focus:outline-none"
                  />
              ) : (
                <>
                  <div className="flex items-center flex-1 min-w-0">
                      {category.emoji && (
                          category.emoji.startsWith('data:image') ? 
                          <img src={category.emoji} alt="" className="w-4 h-4 mr-1.5 rounded-sm object-cover flex-shrink-0" /> :
                          <span className="mr-1.5">{category.emoji}</span>
                      )}
                      <h2 className="text-xs font-bold uppercase text-gray-400 mb-1 truncate">{category.name}</h2>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                      {canManageChannels && (
                          <>
                            <button onClick={() => setEditingCategory({id: category.id, name: category.name})} className="text-gray-400 hover:text-white"><EditIcon /></button>
                            <button onClick={() => onDeleteCategory(category.id)} className="text-gray-400 hover:text-white"><DeleteIcon /></button>
                          </>
                      )}
                  </div>
                </>
              )}
            </div>
            {channels.filter(c => c.categoryId === category.id).map(channel => (
              <ChannelItemWrapper key={channel.id} channel={channel} server={server!} currentUser={currentUser!} selectedChannelId={selectedChannelId} onChannelSelect={onChannelSelect} onOpenChannelSettings={onOpenChannelSettings} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} connectedVoiceChannelId={connectedVoiceChannelId} voiceUsers={voiceUsers} developerMode={developerMode} onContextMenu={onContextMenu} />
            ))}
          </div>
        ))}
      </div>
      {connectedVoiceChannelId && server && (
          <VoiceControls 
            channelName={channels.find(c => c.id === connectedVoiceChannelId)?.name || ''}
            isMuted={isSelfMuted}
            isDeafened={isSelfDeafened}
            onToggleMute={onToggleSelfMute}
            onToggleDeafen={onToggleSelfDeafen}
            onDisconnect={onDisconnectFromVoice}
          />
      )}
      <div className="flex items-center p-2 bg-gray-800/60">
        <div className="relative">
          <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-8 h-8 rounded-full" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{currentUser?.name}</p>
          <p className="text-xs text-gray-400 leading-tight">Online</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <button className="hover:text-white hover:bg-gray-700 p-1 rounded"><MicIcon /></button>
          <button className="hover:text-white hover:bg-gray-700 p-1 rounded"><HeadphoneIcon /></button>
          <button onClick={onOpenUserSettings} className="hover:text-white hover:bg-gray-700 p-1 rounded"><SettingsIcon /></button>
        </div>
      </div>
    </div>
  );
};

const ChannelItemWrapper: React.FC<Omit<ChannelItemProps, 'onDrop'> & {
    onDrop: (e: React.DragEvent, targetItem: { id: string; type: 'channel' | 'category' | 'category-header' }) => void;
    connectedVoiceChannelId: string | null;
    voiceUsers: User[];
}> = (props) => {
    const { channel, connectedVoiceChannelId, voiceUsers, ...rest } = props;
    const isConnected = channel.type === 'voice' && connectedVoiceChannelId === channel.id;
    return (
        <div>
            <ChannelItem
                channel={channel}
                {...rest}
                onDrop={(e, target) => props.onDrop(e, target)}
            />
            {isConnected && (
                <div className="pl-6 py-1 space-y-1">
                    {voiceUsers.map(user => <VoiceUserItem key={user.id} user={user} />)}
                </div>
            )}
        </div>
    );
};

const VoiceUserItem: React.FC<{ user: User }> = ({ user }) => (
    <div className="flex items-center pl-4 py-1 group">
        <div className="relative">
            <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className={`w-6 h-6 rounded-full transition-all duration-150 ${user.isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-700' : ''}`} 
            />
        </div>
        <span className="ml-2 text-sm text-gray-300 group-hover:text-white truncate">{user.name}</span>
        <div className="ml-auto flex items-center pr-2">
            {user.isDeafened && <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 8a6 6 0 00-12 0v1H4a1 1 0 00-1 1v2a1 1 0 001 1h2v1a6 6 0 1012 0v-1h2a1 1 0 001-1V9a1 1 0 00-1-1h-2V8z"></path><path fillRule="evenodd" d="M1.707 3.293a1 1 0 011.414 0L17.414 17.707a1 1 0 01-1.414 1.414L1.707 4.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>}
            {user.isMuted && !user.isDeafened && <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.001 8.001 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0v-1a1 1 0 011-1h2a1 1 0 011 1v1a8.001 8.001 0 01-9 6.93zM1.707 3.293a1 1 0 011.414 0L17.414 17.707a1 1 0 01-1.414 1.414L1.707 4.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>}
        </div>
    </div>
);


interface ChannelItemProps {
    channel: Channel;
    server: Server;
    currentUser: User;
    selectedChannelId: string;
    onChannelSelect: (id: string) => void;
    onOpenChannelSettings: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string, type: 'channel') => void;
    onDragEnd: () => void;
    onDrop: (e: React.DragEvent, targetItem: { id: string, type: 'channel' }) => void;
    developerMode?: boolean;
    onContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, server, currentUser, selectedChannelId, onChannelSelect, onOpenChannelSettings, onDragStart, onDragEnd, onDrop, developerMode, onContextMenu }) => {
    const canView = hasPermission('View Channels', currentUser, server, channel);
    const canManageChannel = hasPermission('Manage Channel', currentUser, server, channel);

    const isLocked = !canView;
    
    let emojiContent;
    if (isLocked) {
        emojiContent = <LockIcon />;
    } else if (channel.emoji) {
      emojiContent = channel.emoji.startsWith('data:image') ? (
        <img src={channel.emoji} alt="" className="w-5 h-5 mr-2 rounded-sm object-cover flex-shrink-0" />
      ) : (
        <span className="text-xl mr-2">{channel.emoji}</span>
      );
    } else {
      emojiContent = channel.type === 'text' ? <TextIcon /> : <VoiceIcon />;
    }
    
    const isSelected = !isLocked && channel.type === 'text' && selectedChannelId === channel.id;
    const itemStyle = isSelected ? { backgroundColor: 'var(--accent-color)' } : {};

    const classNames = [
        'flex items-center p-2 rounded-md group',
        isSelected ? 'text-white' : 'text-gray-400',
        'cursor-pointer',
        !isSelected ? 'hover:bg-gray-600/50 hover:text-white' : '',
        isLocked ? 'opacity-60' : ''
    ].filter(Boolean).join(' ');

    const handleContextMenu = (e: React.MouseEvent) => {
      if (developerMode) {
        onContextMenu(e, [{
          label: 'Copy Channel ID',
          onClick: () => navigator.clipboard.writeText(channel.id)
        }]);
      }
    };

    return (
        <div 
            key={channel.id} 
            className={classNames}
            style={itemStyle}
            onClick={() => onChannelSelect(channel.id)}
            onContextMenu={handleContextMenu}
            title={isLocked ? "This channel is for subscribers only." : undefined}
            draggable
            onDragStart={(e) => onDragStart(e, channel.id, 'channel')}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, {id: channel.id, type: 'channel'})}
        >
            {emojiContent}
            <span className="flex-1 truncate">{channel.name}</span>
            {canManageChannel && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenChannelSettings(channel.id); }} 
                    className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Settings for ${channel.name}`}
                >
                    <SettingsIcon />
                </button>
            )}
        </div>
    );
};


export default ChannelList;