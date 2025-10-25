
import React from 'react';
import ServerList from './components/ServerList';
import ChannelList from './components/ChannelList';
import ChatArea from './components/ChatArea';
import UserList from './components/UserList';
import AddServerModal from './components/AddServerModal';
import ServerSettingsModal from './components/ServerSettingsModal';
import UserSettingsModal from './components/UserSettingsModal';
import ChannelSettingsModal from './components/ChannelSettingsModal';
import WelcomeScreenModal from './components/WelcomeScreenModal';
import HomeSidebar from './components/HomeSidebar';
import ContextMenu from './components/ContextMenu';
import { initialUsers, initialServers, initialChannels, initialCategories, initialMessages, initialCurrentUser, createPermissions, defaultUserSettings, THEME_BACKGROUNDS, initializeNewServer } from './data';
import type { Message, Server, Channel, User, Category, Role, UserSettings, AuditLogEntry, Emoji, Attachment, AutoModRule, SubscriptionTier, Embed, UserStatus } from './types';
import type { ContextMenuItem } from './components/ContextMenu';
import { hasPermission, hasServerPermission } from './permissions';

const App: React.FC = () => {
  const [servers, setServers] = React.useState<Server[]>(initialServers);
  const [channels, setChannels] = React.useState<Channel[]>(initialChannels);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  
  const [selectedServerId, setSelectedServerId] = React.useState<string>('1');
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>('c3');
  
  const [isAddServerModalOpen, setIsAddServerModalOpen] = React.useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = React.useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = React.useState(false);
  const [isChannelSettingsOpen, setIsChannelSettingsOpen] = React.useState(false);
  const [isWelcomeScreenOpen, setIsWelcomeScreenOpen] = React.useState(false);
  const [editingChannelId, setEditingChannelId] = React.useState<string | null>(null);

  // User State
  const [allUsers, setAllUsers] = React.useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = React.useState<User>(initialCurrentUser!);
  const [userSettings, setUserSettings] = React.useState<UserSettings>(currentUser?.settings || defaultUserSettings);
  
  // Voice Channel State
  const [connectedVoiceChannelId, setConnectedVoiceChannelId] = React.useState<string | null>(null);
  const [isSelfMuted, setIsSelfMuted] = React.useState(false);
  const [isSelfDeafened, setIsSelfDeafened] = React.useState(false);

  // UI State
  const [isLoading, setIsLoading] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<{ isOpen: boolean; position: { x: number; y: number }; items: ContextMenuItem[] } | null>(null);
  const [subscriptionPromptChannel, setSubscriptionPromptChannel] = React.useState<Channel | null>(null);
  const [typingUsers, setTypingUsers] = React.useState<Record<string, { userId: string, timeoutId: number }[]>>({});


  const handleContextMenu = (event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        items,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', userSettings.accentColor);
    const bg = THEME_BACKGROUNDS.find(b => b.id === userSettings.chatBackground);
    if (bg) {
        root.style.setProperty('--chat-background-image', bg.url ? `url(${bg.url})` : 'none');
        root.style.setProperty('--chat-background-color', bg.color || '#36393f');
    }
    
    if (userSettings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [userSettings]);

  const logAuditAction = React.useCallback((
    serverId: string,
    action: string,
    targetInfo: { id?: string; name?: string },
    changes?: { key: string; oldValue: any; newValue: any }[],
    actorId?: string
  ) => {
    const newEntry: AuditLogEntry = {
        id: `al-${Date.now()}`,
        action,
        actorId: actorId || currentUser?.id || 'system',
        target: targetInfo.name,
        targetId: targetInfo.id,
        changes,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setServers(prevServers => prevServers.map(server => {
        if (server.id === serverId) {
            return {
                ...server,
                auditLog: [newEntry, ...(server.auditLog || [])]
            };
        }
        return server;
    }));
  }, [currentUser]);
  
  const handleUpdateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleUpdateCurrentUser = (updatedData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
  };


  const openAddServerModal = React.useCallback(() => setIsAddServerModalOpen(true), []);
  const closeAddServerModal = React.useCallback(() => setIsAddServerModalOpen(false), []);
  const openServerSettings = React.useCallback(() => setIsServerSettingsOpen(true), []);
  const closeServerSettings = React.useCallback(() => setIsServerSettingsOpen(false), []);
  const openUserSettings = React.useCallback(() => setIsUserSettingsOpen(true), []);
  const closeUserSettings = React.useCallback(() => setIsUserSettingsOpen(false), []);

  const handleOpenChannelSettings = (channelId: string) => {
    setEditingChannelId(channelId);
    setIsChannelSettingsOpen(true);
  };

  const handleCloseChannelSettings = () => {
    setIsChannelSettingsOpen(false);
    setEditingChannelId(null);
  };

  const handleUpdateChannel = (updatedChannel: Channel) => {
    const oldChannel = channels.find(c => c.id === updatedChannel.id);
    if (oldChannel && oldChannel.name !== updatedChannel.name) {
        logAuditAction(updatedChannel.serverId, 'حدّث قناة', { id: updatedChannel.id, name: updatedChannel.name }, [
            { key: 'name', oldValue: oldChannel.name, newValue: updatedChannel.name }
        ]);
    }
    setChannels(prevChannels =>
      prevChannels.map(channel =>
        channel.id === updatedChannel.id ? updatedChannel : channel
      )
    );
  };

  const switchContent = (callback: () => void) => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
        callback();
        setIsLoading(false);
    }, 350);
  };

  const handleSelectServer = (serverId: string) => {
    if (serverId === selectedServerId) return;

    const server = servers.find(s => s.id === serverId);
    const hasOnboarded = currentUser?.completedOnboarding?.includes(serverId);

    if (server && server.welcomeScreen && !hasOnboarded) {
        switchContent(() => {
            setSelectedServerId(serverId);
            const firstChannel = channels.find(c => c.serverId === serverId && c.type === 'text');
            setSelectedChannelId(firstChannel?.id || '');
            setConnectedVoiceChannelId(null);
            setIsWelcomeScreenOpen(true);
            setSubscriptionPromptChannel(null);
        });
    } else {
        switchContent(() => {
            setSelectedServerId(serverId);
            if (serverId === 'dm') {
                const firstDm = channels.find(c => c.type === 'dm' && c.participantIds?.includes(currentUser!.id));
                setSelectedChannelId(firstDm?.id || '');
            } else {
                const firstChannelOfServer = channels.find(c => c.serverId === serverId && c.type === 'text');
                setSelectedChannelId(firstChannelOfServer?.id || '');
            }
            setConnectedVoiceChannelId(null);
            setSubscriptionPromptChannel(null);
        });
    }
  };

  const currentServer = React.useMemo(() => servers.find(s => s.id === selectedServerId), [servers, selectedServerId]);
  const selectedChannel = React.useMemo(() => channels.find(c => c.id === selectedChannelId), [channels, selectedChannelId]);
  const membersForServer = React.useMemo(() => {
      if (selectedServerId === 'dm' || !currentServer) return [];
      const memberIds = currentServer?.memberIds || [];
      return allUsers.filter(user => memberIds.includes(user.id));
  }, [currentServer, allUsers, selectedServerId]);

  const handleSelectChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel || !currentUser ) return;
    
    // Allow selecting channels from other servers for linking
    if (channel.serverId !== selectedServerId) {
        handleSelectServer(channel.serverId);
    }
    
    const targetServer = servers.find(s => s.id === channel.serverId);
    if (!targetServer) return;

    if (channel.type === 'voice') {
        setConnectedVoiceChannelId(prev => prev === channelId ? null : channelId);
        return;
    }
    
    const canView = hasPermission('View Channels', currentUser, targetServer, channel);
    
    if (!canView) {
        switchContent(() => {
            setSelectedChannelId('');
            setSubscriptionPromptChannel(channel);
        });
        return;
    }

    if (channelId === selectedChannelId) return;
    switchContent(() => {
        setSelectedChannelId(channelId);
        setSubscriptionPromptChannel(null);
    });
  };

  const handleCompleteOnboarding = () => {
    if (!currentUser || !currentServer) return;
    const updatedUser: User = {
        ...currentUser,
        completedOnboarding: [...(currentUser.completedOnboarding || []), currentServer.id],
    };
    handleUpdateCurrentUser(updatedUser);
    setIsWelcomeScreenOpen(false);
  };

  const handleDisconnectFromVoice = () => {
    setConnectedVoiceChannelId(null);
    setIsSelfMuted(false);
    setIsSelfDeafened(false);
  };
  
  const isCurrentUserTimedOut = React.useMemo(() => {
    if (!currentServer || !currentUser || !currentServer.memberTimeouts) return false;
    const timeoutExpiry = currentServer.memberTimeouts[currentUser.id];
    return timeoutExpiry && new Date(timeoutExpiry) > new Date();
  }, [currentServer, currentUser]);

  const handleToggleSelfMute = () => {
    if (isCurrentUserTimedOut) return; // Prevent unmuting if timed out
    setIsSelfMuted(prev => !prev);
  };
  
  const handleToggleSelfDeafen = () => {
    setIsSelfDeafened(prev => !prev);
  };

  const addSystemMessage = (content: string, embed?: Embed) => {
      if (!currentUser) return;
      const newMessage: Message = {
        id: `m-sys-${Date.now()}`,
        channelId: selectedChannelId,
        authorId: 'system', // Special ID for system user
        content,
        embed,
        isSystemMessage: true,
        timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date()),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  const handleSlashCommand = (commandText: string) => {
    if (!currentServer) return;
    const [command, ...args] = commandText.slice(1).split(' ');
    const normalizedCommand = command.toLowerCase();

    const requiresAdmin = (callback: () => void) => {
        if(hasServerPermission('Administrator', currentUser, currentServer)) {
            callback();
        } else {
            addSystemMessage('❌ You do not have permission to use this command.');
        }
    };
    
    switch (normalizedCommand) {
        case 'lock':
        case 'قفل':
            requiresAdmin(() => {
                const everyoneRole = currentServer.roles?.find(r => r.name === '@everyone');
                if (!everyoneRole || !selectedChannel) return;

                const currentOverwrites = selectedChannel.permissionOverwrites || [];
                const existingOverwrite = currentOverwrites.find(o => o.id === everyoneRole.id);

                const newOverwrite = {
                    ...(existingOverwrite || { id: everyoneRole.id, type: 'role', allow: [] }),
                    deny: [...(existingOverwrite?.deny.filter(p => p !== 'Send Messages') || []), 'Send Messages']
                };

                const newOverwrites = currentOverwrites.find(o => o.id === everyoneRole.id)
                    ? currentOverwrites.map(o => o.id === everyoneRole.id ? newOverwrite : o)
                    : [...currentOverwrites, newOverwrite];

                handleUpdateChannel({ ...selectedChannel, permissionOverwrites: newOverwrites });
                addSystemMessage(`🔒 Channel locked by ${currentUser.name}.`);
            });
            break;

        case 'unlock':
        case 'فتح':
             requiresAdmin(() => {
                const everyoneRole = currentServer.roles?.find(r => r.name === '@everyone');
                if (!everyoneRole || !selectedChannel) return;

                const newOverwrites = (selectedChannel.permissionOverwrites || [])
                    .map(o => o.id === everyoneRole.id ? { ...o, deny: o.deny.filter(p => p !== 'Send Messages') } : o);

                handleUpdateChannel({ ...selectedChannel, permissionOverwrites: newOverwrites });
                addSystemMessage(`🔓 Channel unlocked by ${currentUser.name}.`);
            });
            break;
        
        case 'delete':
        case 'حذف':
             if (hasServerPermission('Manage Messages', currentUser, currentServer)) {
                const amount = parseInt(args[0], 10) || 1;
                if (amount < 1 || amount > 100) {
                    addSystemMessage('❌ Please provide a number between 1 and 100.');
                    return;
                }
                setMessages(prev => {
                    const channelMessages = prev.filter(m => m.channelId === selectedChannelId);
                    const otherMessages = prev.filter(m => m.channelId !== selectedChannelId);
                    const messagesToDelete = channelMessages.slice(-amount).map(m => m.id);
                    return [...otherMessages, ...channelMessages.filter(m => !messagesToDelete.includes(m.id))];
                });
                // Transient message is hard, so we'll just log it.
                logAuditAction(currentServer.id, 'حذف الرسائل', { id: selectedChannelId, name: selectedChannel?.name }, [{ key: 'count', oldValue: 0, newValue: amount }]);
             } else {
                addSystemMessage('❌ You do not have permission to use this command.');
             }
            break;

        case 'invites':
        case 'دعوات':
            requiresAdmin(() => {
                const inviteEmbed: Embed = {
                    title: "قائمة الدعوات (من الأكثر إلى الأقل)",
                    color: "#2ECC71",
                    fields: membersForServer.slice(0, 5).map((user, i) => ({
                        name: `${i + 1}. ${user.name}`,
                        value: `${Math.floor(Math.random() * (60 - 10) + 10)} invites`,
                        inline: false,
                    }))
                };
                addSystemMessage('', inviteEmbed);
            });
            break;

        case 'help':
        case 'أوامر':
        case 'commands':
            const helpEmbed: Embed = {
                title: 'Help & Commands',
                description: 'Here is a list of available commands.',
                color: '#3498DB',
                fields: [
                    { name: '/help, /commands, /أوامر', value: 'Displays this help message.' },
                    { name: '/lock, /قفل', value: 'Locks the current channel for @everyone. (Admin only)' },
                    { name: '/unlock, /فتح', value: 'Unlocks the current channel for @everyone. (Admin only)' },
                    { name: '/delete [num], /حذف [num]', value: 'Deletes the last [num] messages. (Manage Messages perm)' },
                    { name: '/invites, /دعوات', value: 'Shows the server invite leaderboard. (Admin only)' },
                ]
            };
            addSystemMessage('', helpEmbed);
            break;

        default:
            addSystemMessage(`❌ Unknown command: \`${normalizedCommand}\`. Type \`/help\` for a list of commands.`);
    }
  };


  const addMessageToState = (content: string, attachments: Attachment[] = []) => {
      if ((!content.trim() && attachments.length === 0) || !currentUser) return;
  
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        channelId: selectedChannelId,
        authorId: currentUser.id,
        content,
        attachments,
        timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date()),
      };
  
      setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleSendMessage = (content: string, attachments: Attachment[] = []) => {
      if (!currentUser) return;

      if(content.startsWith('/')) {
        handleSlashCommand(content);
        return;
      }
      
      if (!currentServer) {
          addMessageToState(content, attachments);
          return;
      }
  
      const rules = currentServer.autoModRules?.filter(r => r.isEnabled) || [];
      let ruleTriggered = false;
  
      for (const rule of rules) {
          let violation = false;
          if (rule.type === 'keyword' && rule.keywords) {
              const lowerContent = content.toLowerCase();
              if (rule.keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
                  violation = true;
              }
          } else if (rule.type === 'link') {
              const linkRegex = /(discord\.(gg|com\/invite)\/[a-zA-Z0-9]+)/g;
              if (linkRegex.test(content)) {
                  violation = true;
              }
          }
  
          if (violation) {
              ruleTriggered = true;
              switch (rule.action) {
                  case 'block':
                      logAuditAction(currentServer.id, 'حذف رسالة', 
                          { id: currentUser.id, name: currentUser.name },
                          [{ key: 'reason', oldValue: '', newValue: `AutoMod Rule: ${rule.name}`}],
                          'automod'
                      );
                      break;
                  case 'alert':
                      logAuditAction(currentServer.id, 'أرسل تنبيهًا',
                          { id: currentUser.id, name: currentUser.name },
                          [{ key: 'reason', oldValue: '', newValue: `AutoMod Rule: ${rule.name}` }, { key: 'content', oldValue: '', newValue: content }],
                          'automod'
                      );
                      break;
                  case 'timeout':
                      logAuditAction(currentServer.id, 'أعطى مهلة للمستخدم',
                          { id: currentUser.id, name: currentUser.name },
                          [{ key: 'reason', oldValue: '', newValue: `AutoMod Rule: ${rule.name}` }],
                          'automod'
                      );
                      handleTimeoutMember(currentUser.id, rule.timeoutDurationMs || 60000, `Triggered AutoMod Rule: ${rule.name}`);
                      break;
              }
              break; 
          }
      }
  
      if (!ruleTriggered) {
          addMessageToState(content, attachments);
      }
  };
  
  const handleUpdateMessage = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ));
  };
  
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };
  
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const reactions = msg.reactions ? [...msg.reactions] : [];
      const reactionIndex = reactions.findIndex(r => r.emoji === emoji);

      if (reactionIndex > -1) {
        const reaction = { ...reactions[reactionIndex], userIds: [...reactions[reactionIndex].userIds] };
        const userIndex = reaction.userIds.indexOf(currentUser.id);

        if (userIndex > -1) {
          reaction.userIds.splice(userIndex, 1);
        } else {
          reaction.userIds.push(currentUser.id);
        }

        if (reaction.userIds.length === 0) {
          reactions.splice(reactionIndex, 1);
        } else {
          reactions[reactionIndex] = reaction;
        }
      } else {
        reactions.push({ emoji, userIds: [currentUser.id] });
      }

      return { ...msg, reactions };
    }));
  };

  const handleAddServer = (name: string, template: 'private' | 'community', imageUrl?: string) => {
    if (!currentUser) return;
  
    const { server: newServer, categories: newCategories, channels: newChannels } = initializeNewServer(name, currentUser.id, template);
    
    if (imageUrl) {
        newServer.imageUrl = imageUrl;
    }

    setServers(prev => [...prev, newServer]);
    setCategories(prev => [...prev, ...newCategories]);
    setChannels(prev => [...prev, ...newChannels]);
    
    handleSelectServer(newServer.id);
  };
  
  const handleUpdateServer = React.useCallback((updatedServer: Server) => {
    const oldServer = servers.find(s => s.id === updatedServer.id);
    if(oldServer && oldServer.name !== updatedServer.name) {
        logAuditAction(updatedServer.id, 'حدّث اسم السيرفر', {id: updatedServer.id, name: updatedServer.name}, [{ key: 'name', oldValue: oldServer.name, newValue: updatedServer.name }]);
    }
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === updatedServer.id ? updatedServer : server
      )
    );
  }, [servers, logAuditAction]);

  const handleDeleteServer = (serverId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this server? This action cannot be undone.")) {
        setServers(prev => prev.filter(s => s.id !== serverId));
        setChannels(prev => prev.filter(c => c.serverId !== serverId));
        setCategories(prev => prev.filter(c => c.serverId !== serverId));
        
        // Switch to DMs after deletion
        if (selectedServerId === serverId) {
            handleSelectServer('dm');
        }
        
        // Close the settings modal as the server is gone
        closeServerSettings();
    }
  };

  const handleOpenDm = (targetUser: User) => {
    if (!currentUser || currentUser.id === targetUser.id) return;

    const existingDm = channels.find(c => 
        c.type === 'dm' && 
        c.participantIds?.includes(currentUser.id) && 
        c.participantIds?.includes(targetUser.id)
    );

    if (existingDm) {
        switchContent(() => {
            setSelectedServerId('dm');
            setSelectedChannelId(existingDm.id);
            setSubscriptionPromptChannel(null);
        });
    } else {
        const newDmChannel: Channel = {
            id: `dm-${Date.now()}`,
            serverId: 'dm',
            name: targetUser.name,
            type: 'dm',
            participantIds: [currentUser.id, targetUser.id],
        };
        setChannels(prev => [...prev, newDmChannel]);
        switchContent(() => {
            setSelectedServerId('dm');
            setSelectedChannelId(newDmChannel.id);
            setSubscriptionPromptChannel(null);
        });
    }
  };
  
  // --- Category, Channel, and Role Management ---
  const handleAddChannel = (name: string, type: 'text' | 'voice') => {
    if (!currentServer) return;
    const newChannel: Channel = {
      id: `c-${Date.now()}`,
      serverId: currentServer.id,
      name,
      type,
    };
    logAuditAction(currentServer.id, 'أنشأ قناة', {id: newChannel.id, name: newChannel.name});
    setChannels(prev => [...prev, newChannel]);
  };

  const handleAddCategory = (name: string) => {
      if (!currentServer) return;
      const newCategory: Category = {
          id: `cat-${Date.now()}`,
          name: name,
          serverId: currentServer.id
      };
      logAuditAction(currentServer.id, 'أنشأ فئة', {id: newCategory.id, name: newCategory.name});
      setCategories(prev => [...prev, newCategory]);
  };
  
  const handleAddRole = () => {
    if (!currentServer) return;
    const newRole: Role = {
      id: `r-${Date.now()}`,
      name: 'new role',
      color: '#99AAB5',
      permissions: createPermissions([]),
    };
    logAuditAction(currentServer.id, 'أنشأ دورًا', {id: newRole.id, name: newRole.name});
    handleUpdateServer({
      ...currentServer,
      roles: [...(currentServer.roles || []), newRole],
    });
  };

  const handleUpdateRole = (updatedRole: Role) => {
    if (!currentServer || !currentServer.roles) return;
    const oldRole = currentServer.roles.find(r => r.id === updatedRole.id);
    if (!oldRole) return;
    
    const changes = Object.keys(updatedRole)
        .filter(key => key !== 'permissions' && updatedRole[key as keyof Role] !== oldRole[key as keyof Role])
        .map(key => ({
            key,
            oldValue: oldRole[key as keyof Role],
            newValue: updatedRole[key as keyof Role],
        }));
    
    if(changes.length > 0) {
        logAuditAction(currentServer.id, 'حدّث الدور', {id: updatedRole.id, name: updatedRole.name}, changes);
    }

    const newRoles = currentServer.roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    handleUpdateServer({ ...currentServer, roles: newRoles });
  };
  
  const handleDeleteRole = (roleId: string) => {
    if (!currentServer || !currentServer.roles) return;
    const roleToDelete = currentServer.roles.find(r => r.id === roleId);
    if (!roleToDelete) return;

    logAuditAction(currentServer.id, 'حذف دورًا', {id: roleId, name: roleToDelete.name});

    const updatedRoles = currentServer.roles.filter(r => r.id !== roleId);
    const updatedMemberRoles = { ...currentServer.memberRoles };
    Object.keys(updatedMemberRoles).forEach(memberId => {
        updatedMemberRoles[memberId] = updatedMemberRoles[memberId].filter(rId => rId !== roleId);
    });

    handleUpdateServer({ ...currentServer, roles: updatedRoles, memberRoles: updatedMemberRoles });
  };

  const handleAddEmoji = (name: string, imageUrl: string) => {
    if (!currentServer) return;
    const newEmoji: Emoji = {
      id: `e-${Date.now()}`,
      name,
      imageUrl,
    };
    logAuditAction(currentServer.id, 'أضاف رمزًا تعبيريًا', {id: newEmoji.id, name: newEmoji.name});
    const updatedEmojis = [...(currentServer.emojis || []), newEmoji];
    handleUpdateServer({ ...currentServer, emojis: updatedEmojis });
  };
  
  const handleDeleteEmoji = (emojiId: string) => {
    if(!currentServer || !currentServer.emojis) return;
    const emojiToDelete = currentServer.emojis.find(e => e.id === emojiId);
    if(!emojiToDelete) return;

    logAuditAction(currentServer.id, 'حذف رمزًا تعبيريًا', {id: emojiId, name: emojiToDelete.name});

    const updatedEmojis = currentServer.emojis.filter(e => e.id !== emojiId);
    handleUpdateServer({...currentServer, emojis: updatedEmojis});
  };

  
  const handleUpdateCategory = (updatedCategory: Category) => {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? Channels in it will not be deleted.")) {
      const categoryToDelete = categories.find(c => c.id === categoryId);
      if(categoryToDelete) {
        logAuditAction(categoryToDelete.serverId, 'حذف فئة', {id: categoryId, name: categoryToDelete.name});
      }
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setChannels(prev => prev.map(c => c.categoryId === categoryId ? { ...c, categoryId: undefined } : c));
    }
  };
  
  const handleDeleteChannel = (channelId: string) => {
    if (window.confirm("Are you sure you want to delete this channel? This cannot be undone.")) {
      const channelToDelete = channels.find(c => c.id === channelId);
      if (channelToDelete) {
        logAuditAction(channelToDelete.serverId, 'حذف قناة', {id: channelId, name: channelToDelete.name});
      }
      setChannels(prev => prev.filter(c => c.id !== channelId));
    }
  };

  const handleReorder = <T extends {id: string}>(
    items: T[],
    draggedId: string,
    targetId: string
  ): T[] => {
    const draggedIndex = items.findIndex(item => item.id === draggedId);
    const targetIndex = items.findIndex(item => item.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return items;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    return newItems;
  };
  
  const handleReorderChannels = (draggedId: string, targetId: string) => {
    setChannels(prev => {
        const serverItems = prev.filter(c => c.serverId === selectedServerId);
        const otherItems = prev.filter(c => c.serverId !== selectedServerId);
        const reordered = handleReorder(serverItems, draggedId, targetId);
        return [...otherItems, ...reordered];
    });
  };

  const handleReorderCategories = (draggedId: string, targetId: string) => {
    setCategories(prev => {
        const serverItems = prev.filter(c => c.serverId === selectedServerId);
        const otherItems = prev.filter(c => c.serverId !== selectedServerId);
        const reordered = handleReorder(serverItems, draggedId, targetId);
        return [...otherItems, ...reordered];
    });
  };

  const handleReorderRoles = (reorderedRoles: Role[]) => {
    if (!currentServer) return;
    logAuditAction(currentServer.id, 'أعاد ترتيب الأدوار', {id: currentServer.id, name: currentServer.name});
    handleUpdateServer({ ...currentServer, roles: reorderedRoles });
  };

  const handleMoveChannel = (channelId: string, categoryId: string | undefined) => {
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, categoryId } : c));
  };


  const handleDrop = (
    draggedItem: { id: string; type: 'channel' | 'category' },
    targetItem: { id: string; type: 'channel' | 'category' | 'category-header' },
  ) => {
    if (draggedItem.type === 'category' && (targetItem.type === 'category' || targetItem.type === 'category-header')) {
        handleReorderCategories(draggedItem.id, targetItem.id);
    } else if (draggedItem.type === 'channel' && targetItem.type === 'channel') {
        handleReorderChannels(draggedItem.id, targetItem.id);
    } else if (draggedItem.type === 'channel' && (targetItem.type === 'category-header' || targetItem.type === 'category')) {
        handleMoveChannel(draggedItem.id, targetItem.id);
    }
  };

  const handleUpdateServerMember = (memberId: string, updates: { roles?: string[]; nickname?: string }) => {
    if (!currentServer) return;
    const updatedServer = { ...currentServer };
    
    if (updates.roles !== undefined) {
      updatedServer.memberRoles = {
        ...updatedServer.memberRoles,
        [memberId]: updates.roles
      };
    }
    if (updates.nickname !== undefined) {
      updatedServer.memberNicknames = {
        ...(updatedServer.memberNicknames || {}),
        [memberId]: updates.nickname
      };
    }
    handleUpdateServer(updatedServer);
  };

  const handleTimeoutMember = (memberId: string, durationMs: number, reason: string) => {
    if (!currentServer) return;

    const timeoutUntil = new Date(Date.now() + durationMs).toISOString();
    
    const updatedTimeouts = {
        ...(currentServer.memberTimeouts || {}),
        [memberId]: timeoutUntil,
    };

    const userToTimeout = allUsers.find(u => u.id === memberId);
    if (userToTimeout && memberId !== 'automod') { // Don't log manual action for automod timeouts
        const durationSeconds = Math.round(durationMs / 1000);
        let durationString = `${durationSeconds} second(s)`;
        if (durationSeconds >= 60) {
            const durationMinutes = Math.round(durationSeconds / 60);
            if (durationMinutes >= 60) {
                const durationHours = Math.round(durationMinutes / 60);
                 if (durationHours >= 24) {
                    const durationDays = Math.round(durationHours / 24);
                    durationString = `${durationDays} day(s)`;
                } else {
                    durationString = `${durationHours} hour(s)`;
                }
            } else {
                 durationString = `${durationMinutes} minute(s)`;
            }
        }
        
        logAuditAction(currentServer.id, 'أعطى مهلة للمستخدم', 
            { id: memberId, name: userToTimeout.name },
            [
                { key: 'duration', oldValue: '', newValue: durationString },
                { key: 'reason', oldValue: '', newValue: reason || 'No reason provided' }
            ]
        );
    }

    handleUpdateServer({ ...currentServer, memberTimeouts: updatedTimeouts });
  };

  const handleUnbanUser = (userId: string) => {
    if (!currentServer) return;
    const updatedBans = (currentServer.bans || []).filter(ban => ban.userId !== userId);
    logAuditAction(currentServer.id, 'ألغى حظر مستخدم', { id: userId, name: allUsers.find(u=>u.id === userId)?.name || 'Unknown'});
    handleUpdateServer({ ...currentServer, bans: updatedBans });
  };

  const handleUpdateSubscriptionTiers = (tiers: SubscriptionTier[]) => {
      if (!currentServer) return;
      handleUpdateServer({ ...currentServer, subscriptionTiers: tiers });
  };
  
  const handleSubscribe = (tierId: string) => {
      if (!currentServer || !currentUser) return;
      const tier = currentServer.subscriptionTiers?.find(t => t.id === tierId);
      if (!tier) return;
  
      // Add subscription record
      const newMemberSubscriptions = {
          ...(currentServer.memberSubscriptions || {}),
          [currentUser.id]: tier.id
      };
  
      // Add role to user
      const currentUserRoles = currentServer.memberRoles[currentUser.id] || [];
      const newMemberRoles = {
          ...currentServer.memberRoles,
          [currentUser.id]: [...currentUserRoles, tier.roleId]
      };
      
      handleUpdateServer({
          ...currentServer,
          memberSubscriptions: newMemberSubscriptions,
          memberRoles: newMemberRoles
      });
  
      // Automatically select the channel they were trying to access
      if(subscriptionPromptChannel) {
          handleSelectChannel(subscriptionPromptChannel.id);
      }
  };

  const handleUserTyping = React.useCallback(() => {
    if (!currentUser || !selectedChannelId) return;

    setTypingUsers(prev => {
        const channelTypers = prev[selectedChannelId] || [];
        const existingTyperIndex = channelTypers.findIndex(t => t.userId === currentUser.id);

        if (existingTyperIndex > -1) {
            clearTimeout(channelTypers[existingTyperIndex].timeoutId);
        }

        const newTimeoutId = window.setTimeout(() => {
            setTypingUsers(current => {
                const currentChannelTypers = current[selectedChannelId] || [];
                const updatedTypers = currentChannelTypers.filter(t => t.userId !== currentUser.id);
                return { ...current, [selectedChannelId]: updatedTypers };
            });
        }, 3000);

        const newTyper = { userId: currentUser.id, timeoutId: newTimeoutId };

        // Fix: Completed the logic for updating the typers list.
        const updatedTypers = existingTyperIndex > -1
            ? channelTypers.map((t, i) => (i === existingTyperIndex ? newTyper : t))
            : [...channelTypers, newTyper];

        return { ...prev, [selectedChannelId]: updatedTypers };
    });
  }, [currentUser, selectedChannelId]);

  return (
    <div className="flex h-screen bg-gray-800 text-gray-100" onClick={closeContextMenu}>
      {contextMenu && <ContextMenu {...contextMenu} onClose={closeContextMenu} />}
  
      <ServerList
        servers={servers}
        selectedServerId={selectedServerId}
        onServerSelect={handleSelectServer}
        onAddServerClick={openAddServerModal}
      />
  
      <div className="flex flex-1 min-w-0 bg-gray-700">
        {selectedServerId === 'dm' ? (
            <div className="w-64 bg-gray-700 flex-shrink-0">
                <HomeSidebar
                    currentUser={currentUser!}
                    allUsers={allUsers}
                    dmChannels={channels.filter(c => c.type === 'dm')}
                    selectedChannelId={selectedChannelId}
                    onChannelSelect={handleSelectChannel}
                    onOpenUserSettings={openUserSettings}
                    onOpenDm={handleOpenDm}
                />
            </div>
        ) : (
            <div className="w-64 bg-gray-700 flex-shrink-0">
                <ChannelList
                    server={currentServer}
                    categories={categories.filter(c => c.serverId === selectedServerId)}
                    channels={channels.filter(c => c.serverId === selectedServerId)}
                    selectedChannelId={selectedChannelId}
                    onChannelSelect={handleSelectChannel}
                    currentUser={currentUser}
                    onOpenServerSettings={openServerSettings}
                    onOpenUserSettings={openUserSettings}
                    onOpenChannelSettings={handleOpenChannelSettings}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onDrop={handleDrop}
                    isLoading={isLoading}
                    connectedVoiceChannelId={connectedVoiceChannelId}
                    voiceUsers={allUsers.filter(u => u.isSpeaking || u.isMuted || u.isDeafened)}
                    isSelfMuted={isSelfMuted}
                    isSelfDeafened={isSelfDeafened}
                    onDisconnectFromVoice={handleDisconnectFromVoice}
                    onToggleSelfMute={handleToggleSelfMute}
                    onToggleSelfDeafen={handleToggleSelfDeafen}
                    developerMode={userSettings.developerMode}
                    onContextMenu={handleContextMenu}
                />
          </div>
        )}
  
        <div className="flex flex-col flex-1">
          {selectedChannel ? (
            <ChatArea
              key={selectedChannelId}
              channel={selectedChannel}
              channels={channels.filter(c => c.serverId === selectedServerId || c.type === 'dm')}
              messages={messages.filter(m => m.channelId === selectedChannelId)}
              onSendMessage={handleSendMessage}
              currentUser={currentUser!}
              allUsers={allUsers}
              server={currentServer!}
              onUpdateMessage={handleUpdateMessage}
              onDeleteMessage={handleDeleteMessage}
              onAddReaction={handleAddReaction}
              isLoading={isLoading}
              isCurrentUserTimedOut={isCurrentUserTimedOut}
              timeoutExpiry={currentServer?.memberTimeouts?.[currentUser.id]}
              developerMode={userSettings.developerMode}
              onContextMenu={handleContextMenu}
              subscriptionPromptChannel={subscriptionPromptChannel}
              onSubscribe={handleSubscribe}
              onUserTyping={handleUserTyping}
              typingUsers={typingUsers[selectedChannelId] || []}
              onChannelSelect={handleSelectChannel}
            />
          ) : subscriptionPromptChannel ? (
            <ChatArea
              key={subscriptionPromptChannel.id}
              channel={subscriptionPromptChannel}
              channels={[]}
              messages={[]}
              onSendMessage={() => {}}
              currentUser={currentUser!}
              allUsers={allUsers}
              server={currentServer!}
              onUpdateMessage={() => {}}
              onDeleteMessage={() => {}}
              onAddReaction={() => {}}
              isLoading={isLoading}
              isCurrentUserTimedOut={false}
              developerMode={userSettings.developerMode}
              onContextMenu={handleContextMenu}
              subscriptionPromptChannel={subscriptionPromptChannel}
              onSubscribe={handleSubscribe}
              onUserTyping={() => {}}
              typingUsers={[]}
              onChannelSelect={handleSelectChannel}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a channel to start chatting.
            </div>
          )}
        </div>
  
        {selectedServerId !== 'dm' && currentServer && (
          <div className="w-64 bg-gray-700 flex-shrink-0">
            <UserList
              server={currentServer}
              users={membersForServer}
              allUsers={allUsers}
              currentUser={currentUser!}
              onUpdateServer={handleUpdateServer}
              onOpenDm={handleOpenDm}
              onTimeoutMember={handleTimeoutMember}
              isLoading={isLoading}
              developerMode={userSettings.developerMode}
              onContextMenu={handleContextMenu}
              onUpdateCurrentUser={handleUpdateCurrentUser}
            />
          </div>
        )}
      </div>
  
      {isAddServerModalOpen && <AddServerModal isOpen={isAddServerModalOpen} onClose={closeAddServerModal} onAddServer={handleAddServer} />}
      {isServerSettingsOpen && currentServer && <ServerSettingsModal isOpen={isServerSettingsOpen} onClose={closeServerSettings} server={currentServer} allUsers={allUsers} currentUser={currentUser} channels={channels.filter(c => c.serverId === currentServer.id)} categories={categories.filter(c => c.serverId === currentServer.id)} onUpdateServer={handleUpdateServer} onDeleteServer={handleDeleteServer} onAddChannel={handleAddChannel} onAddCategory={handleAddCategory} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onReorderRoles={handleReorderRoles} onUpdateServerMember={handleUpdateServerMember} onUnbanUser={handleUnbanUser} onAddEmoji={handleAddEmoji} onDeleteEmoji={handleDeleteEmoji} onUpdateSubscriptionTiers={handleUpdateSubscriptionTiers} />}
      {isUserSettingsOpen && currentUser && <UserSettingsModal isOpen={isUserSettingsOpen} onClose={closeUserSettings} user={currentUser} userSettings={userSettings} onUpdateUserSettings={handleUpdateUserSettings} onUpdateCurrentUser={handleUpdateCurrentUser} />}
      {isChannelSettingsOpen && editingChannelId && <ChannelSettingsModal isOpen={isChannelSettingsOpen} onClose={handleCloseChannelSettings} channel={channels.find(c => c.id === editingChannelId)!} server={servers.find(s => s.id === channels.find(c => c.id === editingChannelId)?.serverId)!} onUpdateChannel={handleUpdateChannel} />}
      {isWelcomeScreenOpen && currentServer && <WelcomeScreenModal isOpen={isWelcomeScreenOpen} onClose={handleCompleteOnboarding} onSelectChannel={handleSelectChannel} server={currentServer} />}
    </div>
  );
};

export default App;
