import React from 'react';
import ReactDOM from 'react-dom';
import type { Channel, Message, User, Server, Role, Reaction, Emoji, Attachment, SubscriptionTier, Embed } from '../types';
import { EMOJIS } from '../constants';
import { getHighestRole, hasPermission } from '../permissions';
import { ChatAreaSkeleton } from './skeletons';
import { ContextMenuItem } from './ContextMenu';

interface ChatAreaProps {
  channel: Channel;
  channels: Channel[];
  messages: Message[];
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  currentUser: User;
  allUsers: User[];
  server: Server;
  onUpdateMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  isLoading: boolean;
  isCurrentUserTimedOut: boolean;
  timeoutExpiry?: string;
  developerMode?: boolean;
  onContextMenu: (event: React.MouseEvent, items: ContextMenuItem[]) => void;
  subscriptionPromptChannel: Channel | null;
  onSubscribe: (tierId: string) => void;
  onUserTyping: () => void;
  typingUsers: { userId: string }[];
  onChannelSelect: (channelId: string) => void;
}

// --- Constants for Virtualization ---
const OVERSCAN = 5; // Number of items to render before and after the visible area
const ESTIMATED_MESSAGE_HEIGHT = 65; // Average height for a message with author
const COMPACT_MESSAGE_HEIGHT = 40; // Average height for a subsequent message
const ATTACHMENT_HEIGHT = 200; // Extra height for an attachment
const REACTION_ROW_HEIGHT = 30; // Extra height for a row of reactions
const LINE_HEIGHT = 20; // Estimated height per line of text

// --- UI Icons and Helpers ---
const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
};

const SearchIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>;
const BellIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>;
const PinIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.707 3.293a1 1 0 00-1.414 0L14 5.586V4a1 1 0 00-1-1H7a1 1 0 000 2h5v1.586l-2.293 2.293A1 1 0 009 12v5a1 1 0 001 1h.01a1 1 0 00.707-.293l3-3a1 1 0 000-1.414L11.414 12l2.293-2.293a1 1 0 000-1.414l1.707-1.707a1 1 0 000-1.414L17.707 4.707a1 1 0 000-1.414zM10 16v-4h2l-2 4z" clipRule="evenodd"></path></svg>;
const UserGroupIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 0 013.75-2.906z"></path></svg>;
const PlusCircleIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>;
const GiftIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015.255-2.268a.75.75 0 001.49 0A3 3 0 0115 5v1.259a5.967 5.967 0 01-1.544 4.026.91.91 0 00-.46 1.085l.17.51a.91.91 0 00.835.62h.003c.483 0 .89-.364.954-.84l.17-.51a.91.91 0 00-.46-1.085A5.967 5.967 0 0115 6.26V5a1 1 0 10-2 0v1h-1V5a1 1 0 10-2 0v1h-1V5a1 1 0 10-2 0v1H6V5a1 1 0 10-2 0v1.26A5.967 5.967 0 013 10.291a.91.91 0 00-.46 1.085l.17.51a.91.91 0 00.954.84h.002a.91.91 0 00.835-.62l.17-.51a.91.91 0 00-.46-1.085A5.967 5.967 0 015 6.26V5zM2 14a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>;
const StickerIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path></svg>;
const EmojiIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.75.75 0 00-1.06 1.06 3.5 3.5 0 01-4.95 0 .75.75 0 00-1.06-1.06 5 5 0 007.07 0z" clipRule="evenodd"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const CopyIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"></path><path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H4z"></path></svg>;
const FileIcon = () => <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


const EmojiPicker: React.FC<{
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
  serverEmojis: Emoji[];
}> = ({ onSelect, onClose, position, serverEmojis }) => {
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      ref={pickerRef}
      className="absolute z-30 bg-gray-900 rounded-lg shadow-lg p-2 w-80 h-96 flex flex-col"
      style={{ top: position.top, left: position.left, transform: 'translateY(-100%) translateX(-50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-y-auto pr-1">
        {serverEmojis.length > 0 && (
          <>
            <h3 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Server Emojis</h3>
            <div className="grid grid-cols-9 gap-1 p-1">
              {serverEmojis.map(emoji => (
                <button
                  key={emoji.id}
                  onClick={() => onSelect(`:${emoji.name}:`)}
                  className="rounded-md hover:bg-gray-700 aspect-square transition-colors p-1"
                  title={emoji.name}
                >
                  <img src={emoji.imageUrl} alt={emoji.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="h-px bg-gray-700/50 my-2"></div>
          </>
        )}
        <h3 className="text-xs font-bold uppercase text-gray-400 px-2 my-2">Standard Emojis</h3>
        <div className="grid grid-cols-9 gap-1 p-1">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-2xl rounded-md hover:bg-gray-700 aspect-square transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ channel, channels, messages, onSendMessage, currentUser, allUsers, server, onUpdateMessage, onDeleteMessage, onAddReaction, isLoading, isCurrentUserTimedOut, timeoutExpiry, developerMode, onContextMenu, subscriptionPromptChannel, onSubscribe, onUserTyping, typingUsers, onChannelSelect }) => {
    const findAuthor = (authorId: string) => allUsers.find(u => u.id === authorId);
    const [inputValue, setInputValue] = React.useState('');
    const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
    const [editingContent, setEditingContent] = React.useState('');
    const [hoveredMessageId, setHoveredMessageId] = React.useState<string | null>(null);
    const [emojiPickerState, setEmojiPickerState] = React.useState<{
        isOpen: boolean;
        target: { type: 'input' } | { type: 'reaction', messageId: string };
        position: { top: number, left: number };
      } | null>(null);
    
    const [pendingAttachments, setPendingAttachments] = React.useState<Attachment[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [revealedBlockedMessages, setRevealedBlockedMessages] = React.useState<Set<string>>(new Set());
    const [revealedExplicitMedia, setRevealedExplicitMedia] = React.useState<Set<string>>(new Set());

    const serverEmojis = server.emojis || [];
    
    // --- Virtualization State & Refs ---
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const lastMessageCount = React.useRef(messages.length);
    const isAtBottom = React.useRef(true);
    const [visibleWindow, setVisibleWindow] = React.useState({ top: 0, bottom: 0 });

    const messageLayout = React.useMemo(() => {
        let totalHeight = 0;
        const positions = messages.map((msg, index) => {
            const top = totalHeight;
            const prevMessage = messages[index - 1];
            const isFirstInGroup = !prevMessage || prevMessage.authorId !== msg.authorId || msg.isSystemMessage;
            let height = isFirstInGroup ? ESTIMATED_MESSAGE_HEIGHT : COMPACT_MESSAGE_HEIGHT;
            if (msg.isSystemMessage) height = 40;
            if (msg.embed) height += 150; // Estimate embed height
            const lineBreaks = (msg.content.match(/\n/g) || []).length;
            height += lineBreaks * LINE_HEIGHT;
            if (msg.attachments && msg.attachments.length > 0) {
                height += (msg.attachments.length * ATTACHMENT_HEIGHT);
            }
            if (msg.reactions && msg.reactions.length > 0) {
                const reactionRows = Math.ceil(msg.reactions.length / 7);
                height += reactionRows * REACTION_ROW_HEIGHT;
            }
            totalHeight += height;
            return { top, height };
        });
        return { totalHeight, positions };
    }, [messages]);

    const handleScroll = React.useCallback(() => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current;
        setVisibleWindow({ top: scrollTop, bottom: scrollTop + clientHeight });
        isAtBottom.current = scrollHeight - scrollTop - clientHeight < 150;
    }, []);
    
    React.useLayoutEffect(() => {
        const scrollEl = scrollContainerRef.current;
        if (!scrollEl || isLoading) return;

        const shouldScroll = messages.length > lastMessageCount.current && isAtBottom.current;
        const channelChanged = lastMessageCount.current === -1; 
        const isInitialLoad = (lastMessageCount.current === 0 || channelChanged) && messages.length > 0;
        
        if (shouldScroll || isInitialLoad) {
            scrollEl.scrollTop = scrollEl.scrollHeight;
        }

        lastMessageCount.current = messages.length;
    }, [messages, isLoading, channel.id]);

    React.useEffect(() => {
        // Reset scroll state on channel change
        lastMessageCount.current = -1; 
        setRevealedBlockedMessages(new Set());
        setRevealedExplicitMedia(new Set());
        if(scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        handleScroll();
    }, [channel.id, handleScroll]);


    React.useEffect(() => {
        setInputValue('');
        setPendingAttachments([]);
    }, [channel.id]);
    
    // Cleanup for object URLs
    React.useEffect(() => {
        return () => {
            pendingAttachments.forEach(att => URL.revokeObjectURL(att.url));
        };
    }, [pendingAttachments]);

    const parseMentionsForSending = (text: string): string => {
        let newText = text;
        const userMentionRegex = /@([\w-]+)/g;
        newText = newText.replace(userMentionRegex, (match, username) => {
            const user = allUsers.find(u => u.name.toLowerCase() === username.toLowerCase());
            return user ? `<@${user.id}>` : match;
        });

        const channelMentionRegex = /#([\w-]+)/g;
        newText = newText.replace(channelMentionRegex, (match, channelName) => {
            const mentionedChannel = channels.find(c => c.name.toLowerCase() === channelName.toLowerCase());
            return mentionedChannel ? `<#${mentionedChannel.id}>` : match;
        });
        return newText;
    };


    const handleFormSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (inputValue.trim() || pendingAttachments.length > 0) {
        const parsedContent = parseMentionsForSending(inputValue);
        onSendMessage(parsedContent, pendingAttachments);
        setInputValue('');
        setPendingAttachments([]);
      }
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newAttachments: Attachment[] = files.map((file: File) => ({
            id: crypto.randomUUID(),
            filename: file.name,
            size: file.size,
            fileType: file.type.startsWith('image/') ? 'image' : 'document',
            url: URL.createObjectURL(file)
        }));
        setPendingAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
    
        if (event.target) event.target.value = '';
    };

    const handleRemoveAttachment = (id: string) => {
        setPendingAttachments(prev => prev.filter(att => att.id !== id));
    };
    
    const isDM = channel.type === 'dm';
    const authorForDMHeader = isDM ? allUsers.find(u => u.name === channel.name) : null;
    
    const canSendMessage = React.useMemo(() => {
        if (isDM) return true;
        if (!currentUser || !server) return false;
        return hasPermission('Send Messages', currentUser, server, channel);
    }, [currentUser, server, channel, isDM]);
    
    const handleStartEdit = (message: Message) => {
        setEditingMessageId(message.id);
        setEditingContent(message.content);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editingMessageId && editingContent.trim()) {
                onUpdateMessage(editingMessageId, editingContent.trim());
            }
            setEditingMessageId(null);
        } else if (e.key === 'Escape') {
            setEditingMessageId(null);
        }
    };

    const handleOpenEmojiPicker = (e: React.MouseEvent, target: { type: 'input' } | { type: 'reaction', messageId: string }) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setEmojiPickerState({
            isOpen: true,
            target,
            position: { top: rect.top, left: rect.left + rect.width / 2 }
        });
    };
  
    const handleEmojiSelect = (emoji: string) => {
        if (!emojiPickerState) return;
        if (emojiPickerState.target.type === 'input') {
            setInputValue(prev => prev + emoji);
        } else if (emojiPickerState.target.type === 'reaction') {
            onAddReaction(emojiPickerState.target.messageId, emoji);
        }
        setEmojiPickerState(null);
    };

    const renderMessageContent = (content: string) => {
      const tokenRegex = /(<@\w+>)|(<#\w+>)|(:[\w-]+:)/g;
      const parts = content.split(tokenRegex).filter(Boolean);
  
      return (
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
          {parts.map((part, i) => {
            const userMatch = part.match(/^<@(\w+)>$/);
            if (userMatch) {
              const userId = userMatch[1];
              const user = allUsers.find(u => u.id === userId);
              if (!user) return part;
              const role = getHighestRole(user, server);
              return (
                <span key={i} className="bg-blue-500/30 font-medium rounded px-1 cursor-pointer hover:bg-blue-500/50" style={{color: role?.color}}>
                  @{user.name}
                </span>
              );
            }
  
            const channelMatch = part.match(/^<#(\w+)>$/);
            if (channelMatch) {
              const channelId = channelMatch[1];
              const mentionedChannel = channels.find(c => c.id === channelId);
              if (!mentionedChannel) return part;
              return (
                <span key={i} onClick={() => onChannelSelect(channelId)} className="text-blue-400 font-medium rounded px-1 cursor-pointer hover:underline bg-black/20">
                  #{mentionedChannel.name}
                </span>
              );
            }
  
            const emojiMatch = part.match(/^:([\w-]+):$/);
            if (emojiMatch) {
              const emojiName = emojiMatch[1];
              const emoji = serverEmojis.find(e => e.name === emojiName);
              if (emoji) {
                return (
                  <img
                    key={i}
                    src={emoji.imageUrl}
                    alt={`:${emoji.name}:`}
                    title={`:${emoji.name}:`}
                    className="inline-block w-6 h-6 object-contain align-bottom"
                  />
                );
              }
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
          })}
        </p>
      );
    };

    const renderMessage = (msg: Message, index: number) => {
        const author = findAuthor(msg.authorId);
        
        if (msg.isSystemMessage) {
            return (
                <div className="flex items-center my-2 text-sm text-gray-400">
                    <div className="w-10 mr-4 h-px bg-gray-600/50"></div>
                    <span className="flex-shrink-0">{msg.content}</span>
                    <div className="flex-1 ml-4 h-px bg-gray-600/50"></div>
                </div>
            )
        }
        
        if (!author) return null;

        const isBlocked = (currentUser.friends || []).some(f => f.user.id === msg.authorId && f.status === 'blocked');
        if (isBlocked && !revealedBlockedMessages.has(msg.id)) {
            return (
                <div className="flex items-center my-2 p-2 border-t border-b border-gray-900/50">
                    <span className="text-sm text-gray-400">1 Blocked Message</span>
                    <button onClick={() => setRevealedBlockedMessages(prev => new Set(prev).add(msg.id))} className="ml-2 text-sm text-blue-400 hover:underline">Show</button>
                </div>
            )
        }

        const highestRole = isDM ? null : getHighestRole(author, server);
        const authorNameColor = highestRole?.color || '#FFFFFF';
        const roleIcon = highestRole?.icon;
        
        const roleIconElement = roleIcon ? (
            roleIcon.startsWith('data:image') ?
            <img src={roleIcon} alt={`${highestRole?.name} icon`} className="w-4 h-4 rounded-sm object-cover mr-1.5 inline-block" /> :
            <span className="mr-1.5">{roleIcon}</span>
        ) : null;

        const prevMessage = messages[index - 1];
        const showAuthor = !prevMessage || prevMessage.authorId !== msg.authorId || prevMessage.isSystemMessage;
        const isEditing = editingMessageId === msg.id;
        const canManageMessages = hasPermission('Manage Messages', currentUser, server, channel);
        const canDelete = msg.authorId === currentUser.id || canManageMessages;

        const handleContextMenu = (e: React.MouseEvent) => {
            if (developerMode) {
                const menuItems: ContextMenuItem[] = [{
                    label: 'Copy Message ID',
                    onClick: () => navigator.clipboard.writeText(msg.id),
                }];

                if(msg.authorId) {
                    menuItems.push({
                        label: 'Copy User ID',
                        onClick: () => navigator.clipboard.writeText(msg.authorId),
                    });
                }
                
                onContextMenu(e, menuItems);
            }
        };

        return (
            <div 
              onMouseEnter={() => setHoveredMessageId(msg.id)} 
              onMouseLeave={() => setHoveredMessageId(null)} 
              onContextMenu={handleContextMenu}
              className={`flex items-start mb-1 py-1 rounded relative ${showAuthor ? 'mt-4' : ''} ${hoveredMessageId === msg.id || isEditing ? 'bg-black/20' : ''}`}
            >
            {showAuthor ? (
                <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full mr-4" />
            ) : (
                <div className="w-10 mr-4"></div>
            )}
            <div className="flex-1 min-w-0">
                {showAuthor && (
                <div className="flex items-baseline">
                    <p className="font-semibold mr-2 flex items-center" style={{ color: authorNameColor }}>
                    {!isDM && roleIconElement}
                    {author.name}
                    </p>
                    <p className="text-xs text-gray-400">{msg.timestamp}</p>
                </div>
                )}
                {isEditing ? (
                    <div className="flex flex-col space-y-2">
                        <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full bg-gray-800 rounded p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                        />
                        <div className="text-xs text-gray-400">escape to <button onClick={() => setEditingMessageId(null)} className="text-blue-400 hover:underline">cancel</button> • enter to <button onClick={() => handleEditKeyDown({ key: 'Enter', shiftKey: false } as any)} className="text-blue-400 hover:underline">save</button></div>
                    </div>
                ) : (
                    <>
                        {msg.content && renderMessageContent(msg.content)}
                        {msg.embed && <MessageEmbed embed={msg.embed} />}
                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {msg.attachments.map(att => <AttachmentView key={att.id} attachment={att} messageId={msg.id} authorId={msg.authorId} />)}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                            {msg.reactions?.map(reaction => {
                                const hasReacted = reaction.userIds.includes(currentUser.id);
                                const customEmoji = serverEmojis.find(e => `:${e.name}:` === reaction.emoji);

                                const emojiContent = customEmoji ? (
                                    <img src={customEmoji.imageUrl} alt={customEmoji.name} className="w-4 h-4 object-contain"/>
                                ) : (
                                    <span>{reaction.emoji}</span>
                                );
                                
                                return (
                                    <button
                                        key={reaction.emoji}
                                        onClick={() => onAddReaction(msg.id, reaction.emoji)}
                                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-sm transition-colors ${hasReacted ? 'bg-blue-500/30 border border-blue-400 text-white' : 'bg-gray-600/70 hover:bg-gray-600 border border-transparent text-gray-300'}`}
                                        aria-label={`React with ${reaction.emoji}`}
                                    >
                                        {emojiContent}
                                        <span className="font-medium">{reaction.userIds.length}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
            {!isEditing && hoveredMessageId === msg.id && (
                <div className="absolute -top-4 right-4 bg-gray-800 rounded-md shadow-lg flex items-center border border-gray-900/50">
                    <button onClick={(e) => handleOpenEmojiPicker(e, {type: 'reaction', messageId: msg.id})} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l-md"><EmojiIcon /></button>
                    {msg.authorId === currentUser.id && <button onClick={() => handleStartEdit(msg)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700"><EditIcon /></button>}
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700"><CopyIcon /></button>
                    {canDelete && <button onClick={() => onDeleteMessage(msg.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-r-md"><TrashIcon /></button>}
                </div>
            )}
            </div>
        );
    }

    const renderVirtualList = () => {
        if (messageLayout.positions.length === 0) return null;

        const { top, bottom } = visibleWindow;
        
        let startIndex = 0;
        for (let i = 0; i < messageLayout.positions.length; i++) {
            if (messageLayout.positions[i].top + messageLayout.positions[i].height >= top) {
                startIndex = i;
                break;
            }
        }
        
        let endIndex = startIndex;
        for (let i = startIndex; i < messageLayout.positions.length; i++) {
            if (messageLayout.positions[i].top > bottom) {
                endIndex = i;
                break;
            }
            endIndex = i;
        }

        startIndex = Math.max(0, startIndex - OVERSCAN);
        endIndex = Math.min(messages.length - 1, endIndex + OVERSCAN);

        const itemsToRender = [];
        for (let i = startIndex; i <= endIndex; i++) {
            const position = messageLayout.positions[i];
            itemsToRender.push(
                <div key={messages[i].id} style={{ position: 'absolute', top: position.top, left: 0, right: 0, paddingLeft: '1rem', paddingRight: '1rem' }}>
                    {renderMessage(messages[i], i)}
                </div>
            );
        }

        return <div style={{ position: 'relative', height: messageLayout.totalHeight }}>{itemsToRender}</div>;
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const AttachmentPreview: React.FC<{ attachments: Attachment[]; onRemove: (id: string) => void }> = ({ attachments, onRemove }) => (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-700/50 rounded-t-lg">
            {attachments.map(att => (
                <div key={att.id} className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-md">
                    {att.fileType === 'image' ? (
                        <img src={att.url} alt={att.filename} className="w-full h-24 object-cover" />
                    ) : (
                        <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400 p-2">
                            <FileIcon />
                            <p className="text-xs text-center mt-2 truncate w-full">{att.filename}</p>
                        </div>
                    )}
                    <button 
                        onClick={() => onRemove(att.id)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove attachment"
                    >
                        <CloseIcon />
                    </button>
                </div>
            ))}
        </div>
    );
    
    const AttachmentView: React.FC<{ attachment: Attachment; messageId: string; authorId: string; }> = ({ attachment, messageId, authorId }) => {
        const isNonFriendDm = isDM && !(currentUser.friends || []).some(f => f.user.id === authorId && f.status === 'online');
        const showFilter = currentUser.settings?.explicitMediaFilter && isNonFriendDm && attachment.fileType === 'image';
        
        if (showFilter && !revealedExplicitMedia.has(messageId)) {
            return (
                <div className="bg-gray-800/80 p-3 rounded-lg flex items-center space-x-3 max-w-sm">
                    <p className="text-gray-400 text-sm">Potentially Explicit Media</p>
                    <button onClick={() => setRevealedExplicitMedia(prev => new Set(prev).add(messageId))} className="text-blue-400 hover:underline text-sm">Show</button>
                </div>
            );
        }

        if (attachment.fileType === 'image') {
            return (
                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-sm">
                    <img src={attachment.url} alt={attachment.filename} className="rounded-lg max-h-80 object-cover" />
                </a>
            );
        }
        return (
            <div className="bg-gray-800/80 p-3 rounded-lg flex items-center space-x-3 max-w-sm">
                <div className="text-gray-400"><FileIcon /></div>
                <div className="flex-1 min-w-0">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">{attachment.filename}</a>
                    <p className="text-xs text-gray-500">{formatBytes(attachment.size)}</p>
                </div>
            </div>
        );
    };
    
    const placeholderText = isCurrentUserTimedOut && timeoutExpiry
      ? `أنت في وضع الإيقاف المؤقت حتى ${new Date(timeoutExpiry).toLocaleString()}`
      : !canSendMessage
      ? 'You do not have permission to send messages in this channel.'
      : isDM
      ? `Message @${channel.name}`
      : `Message #${channel.name}`;

    const renderSubscriptionPrompt = () => {
        if (!subscriptionPromptChannel) return null;
        const tiers = server.subscriptionTiers || [];

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">This is a subscribers-only channel.</h2>
                <p className="text-gray-400 mt-2 max-w-md">Get access to this and other exclusive channels and perks by subscribing to one of the tiers below.</p>
                <div className="mt-6 space-y-3 w-full max-w-sm">
                    {tiers.map(tier => (
                         <div key={tier.id} className="bg-gray-800 p-4 rounded-lg text-left">
                             <div className="flex justify-between items-center">
                                 <h3 className="text-lg font-bold text-yellow-400">{tier.name}</h3>
                                 <button onClick={() => onSubscribe(tier.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200">
                                     Subscribe - {tier.price}
                                 </button>
                             </div>
                             <p className="text-sm text-gray-300 mt-2">{tier.description}</p>
                         </div>
                    ))}
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col h-full bg-cover bg-center" style={{ backgroundColor: 'var(--chat-background-color)', backgroundImage: 'var(--chat-background-image)' }}>
      <div className="flex items-center p-3 shadow-md border-b border-gray-900/50 bg-gray-700/80 backdrop-blur-sm">
        {isDM && authorForDMHeader ? (
             <div className="relative mr-2">
                <img src={authorForDMHeader.avatarUrl} alt={channel.name} className="w-6 h-6 rounded-full"/>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(authorForDMHeader.status)} border-2 border-gray-700 rounded-full`}></div>
            </div>
        ) : (
            <span className="text-gray-400 text-2xl font-semibold">#</span>
        )}
        <h2 className="font-bold text-white text-lg flex-1">{channel.name}</h2>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-white"><BellIcon /></button>
          <button className="hover:text-white"><PinIcon /></button>
          <button className="hover:text-white"><UserGroupIcon /></button>
          <div className="relative">
            <input type="text" placeholder="Search" className="bg-gray-900 rounded px-2 py-1 text-sm w-36 focus:outline-none" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2"><SearchIcon /></div>
          </div>
        </div>
      </div>
      
      {isLoading ? <ChatAreaSkeleton /> : subscriptionPromptChannel ? renderSubscriptionPrompt() : (
        <>
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
                {renderVirtualList()}
            </div>
          
            <div className="px-4 pb-4 bg-transparent">
                {pendingAttachments.length > 0 && <AttachmentPreview attachments={pendingAttachments} onRemove={handleRemoveAttachment} />}
                <form onSubmit={handleFormSubmit} className={`bg-gray-600 flex items-center p-2 ${pendingAttachments.length > 0 ? 'rounded-b-lg' : 'rounded-lg'}`}>
                    <input type="file" multiple onChange={handleFileSelect} hidden ref={fileInputRef} accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white"><PlusCircleIcon /></button>
                    <input 
                      type="text" 
                      placeholder={placeholderText} 
                      className="flex-1 bg-transparent px-2 text-white focus:outline-none disabled:cursor-not-allowed disabled:placeholder:text-gray-500"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        onUserTyping();
                      }}
                      aria-label={`Message ${channel.name}`}
                      disabled={!canSendMessage || isCurrentUserTimedOut}
                    />
                    <div className="flex items-center space-x-3 text-gray-400">
                        <button type="button" className="hover:text-white"><GiftIcon /></button>
                        <button type="button" className="hover:text-white"><StickerIcon /></button>
                        <button type="button" onClick={(e) => handleOpenEmojiPicker(e, {type: 'input'})} className="hover:text-white"><EmojiIcon /></button>
                    </div>
                </form>
                 <TypingIndicator typingUsers={typingUsers} allUsers={allUsers} currentUser={currentUser} />
            </div>
        </>
      )}
      
      {emojiPickerState?.isOpen && (
        <EmojiPicker 
            onSelect={handleEmojiSelect}
            onClose={() => setEmojiPickerState(null)}
            position={emojiPickerState.position}
            serverEmojis={serverEmojis}
        />
      )}
    </div>
  );
};

const TypingIndicator: React.FC<{ typingUsers: { userId: string }[], allUsers: User[], currentUser: User }> = ({ typingUsers, allUsers, currentUser }) => {
    const activeTypers = typingUsers.filter(t => t.userId !== currentUser.id);

    if (activeTypers.length === 0) {
        return <div className="h-6"></div>;
    }

    const typerNames = activeTypers
        .map(t => allUsers.find(u => u.id === t.userId)?.name)
        .filter((name): name is string => !!name);

    let text = '';
    if (typerNames.length === 1) {
        text = `${typerNames[0]} is typing`;
    } else if (typerNames.length === 2) {
        text = `${typerNames[0]} and ${typerNames[1]} are typing`;
    } else if (typerNames.length > 2) {
        text = `Several people are typing`;
    }

    return (
        <div className="h-6 text-sm text-gray-400 italic flex items-center">
            {text && <span className="typing-ellipsis font-semibold">{text}</span>}
            <style>{`
                .typing-ellipsis::after {
                    content: '...';
                    animation: ellipsis 1.5s infinite;
                    display: inline-block;
                    width: 1em;
                    text-align: left;
                }
                @keyframes ellipsis {
                    0% { content: '.'; }
                    33% { content: '..'; }
                    66% { content: '...'; }
                }
            `}</style>
        </div>
    );
};

const MessageEmbed: React.FC<{ embed: Embed }> = ({ embed }) => {
    const borderColor = embed.color || 'var(--accent-color)';
    return (
        <div className="bg-gray-800/80 rounded-lg flex mt-2 max-w-lg" style={{ borderLeft: `4px solid ${borderColor}` }}>
            <div className="p-4">
                {embed.title && <h3 className="font-bold text-white text-lg mb-1">{embed.title}</h3>}
                {embed.description && <p className="text-gray-300 whitespace-pre-wrap">{embed.description}</p>}
                {embed.fields && (
                    <div className={`mt-4 grid gap-4 ${embed.fields.some(f => f.inline) ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : ''}`}>
                        {embed.fields.map((field, index) => (
                            <div key={index} className={field.inline ? '' : 'col-span-full'}>
                                <h4 className="font-bold text-white mb-1">{field.name}</h4>
                                <p className="text-gray-300 whitespace-pre-wrap">{field.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default ChatArea;
