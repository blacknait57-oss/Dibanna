import React from 'react';
import type { Channel, User, Friend } from '../types';

interface HomeSidebarProps {
  currentUser: User;
  allUsers: User[];
  dmChannels: Channel[];
  selectedChannelId: string;
  onChannelSelect: (channelId: string) => void;
  onOpenUserSettings: () => void;
  onOpenDm: (user: User) => void;
}

const getStatusColor = (status: User['status']) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-yellow-500';
    case 'dnd': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const SettingsIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>;
const MicIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.001 8.001 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0v-1a1 1 0 011-1h2a1 1 0 011 1v1a8.001 8.001 0 01-9 6.93z" clipRule="evenodd"></path></svg>;
const HeadphoneIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 8a6 6 0 00-12 0v1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2v1a6 6 0 1012 0v-1h2a1 1 0 001-1V9a1 1 0 00-1-1h-2V8z"></path></svg>;

const HomeSidebar: React.FC<HomeSidebarProps> = ({ currentUser, allUsers, dmChannels, selectedChannelId, onChannelSelect, onOpenUserSettings, onOpenDm }) => {
    
    const onlineFriends = (currentUser.friends || []).filter(f => f.user.status !== 'offline');

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 shadow-md border-b border-gray-900/50">
          <input type="text" placeholder="Find or start a conversation" className="w-full bg-gray-900 rounded px-2 py-1.5 text-sm text-gray-200 placeholder-gray-400 focus:outline-none"/>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pt-2 space-y-4">
            <div>
                 <h2 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Online Friends — {onlineFriends.length}</h2>
                 {onlineFriends.map(friend => {
                    const friendUser = allUsers.find(u => u.id === friend.user.id);
                    if (!friendUser) return null;
                    return (
                        <div 
                            key={friendUser.id} 
                            className={`flex items-center p-2 rounded-md cursor-pointer text-gray-400 hover:bg-gray-600/50 hover:text-white`}
                            onClick={() => onOpenDm(friendUser)}
                        >
                            <div className="relative">
                                <img src={friendUser.avatarUrl} alt={friendUser.name} className="w-8 h-8 rounded-full" />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(friendUser.status)} border-2 border-gray-700 rounded-full`}></div>
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{friendUser.name}</p>
                                 {friendUser.activity && <p className="text-xs truncate">{friendUser.activity.type === 'custom' ? friendUser.activity.name : `Playing ${friendUser.activity.name}`}</p>}
                            </div>
                        </div>
                    )
                 })}
            </div>
            <div>
                <h2 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Direct Messages</h2>
                {dmChannels.map(channel => {
                   const otherUserId = channel.participantIds?.find(id => id !== currentUser?.id);
                   const otherUser = allUsers.find(u => u.id === otherUserId);
                   if (!otherUser) return null;
                   return (
                    <div 
                        key={channel.id} 
                        className={`flex items-center p-2 rounded-md cursor-pointer ${selectedChannelId === channel.id ? 'bg-gray-500/50 text-white' : 'text-gray-400 hover:bg-gray-600/50 hover:text-white'}`}
                        onClick={() => onChannelSelect(channel.id)}
                    >
                        <div className="relative">
                            <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-8 h-8 rounded-full" />
                             <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(otherUser.status)} border-2 border-gray-700 rounded-full`}></div>
                        </div>
                        <span className="ml-3 font-medium">{otherUser.name}</span>
                    </div>
                   )
                })}
            </div>
        </div>
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

export default HomeSidebar;
