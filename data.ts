import type { Server, Channel, User, Message, Role, Emoji, Invite, Ban, AuditLogEntry, Category, UserActivity, UserSettings, Friend, AutoModRule, SubscriptionTier, UserStatus } from './types';
import React from 'react';

const DmIcon: React.FC<{ className?: string }> = ({ className }) => (
    React.createElement('svg', {
      className,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    },
      React.createElement('path', { d: "M12 2.25c-5.376 0-9.75 3.52-9.75 7.875 0 2.455 1.21 4.625 3.109 6.016l-1.01 3.535a.75.75 0 0 0 .964.964l3.535-1.01c.65.143 1.32.22 2.002.22 5.376 0 9.75-3.52 9.75-7.875S17.376 2.25 12 2.25Zm-2.625 8.5a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0Zm3.5 0a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0Zm3.5 0a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0Z" })
    )
);

const GAME_ICON_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMkE4IDggMCAwIDAgNCAxMHYxYTQgNCAwIDAgMC00IDR2M2E0IDQgMCAwIDAgNCA0aDJhNCA0IDAgMCAwIDQgNEg0YTQgNCAwIDAgMCA0LTR2LTJoMmE0IDQgMCAwIDAgNC00aDFhNCA0IDAgMCAwIDQtNHYtM2E4IDggMCAwIDAtOC04ek03IDhhMSAxIDAgMCAxIDEtMWgxYTQgNCAwIDAgMCA0LTRIOGExIDEgMCAwIDEgLTEtMXptOSA1YTEgMSAwIDAgMS0xIDFIMTRhNCA0IDAgMCAwLTQgNGgyYTQgNCAwIDAgMCA0LTRoMWExIDEgMCAwIDEgMSAxeiI+PC9wYXRoPjwvc3ZnPg==";
const MUSIC_ICON_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgM3YxMC41NWMtLjU5LS4zNC0xLjI3LS41NS0yLS41NS0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTRWN2g0VjNoLTZ6Ij48L3BhdGg+PC9zdmc+";

export const THEME_BACKGROUNDS = [
    { id: 'default', name: 'Default', color: '#36393f', url: null },
    { id: 'image-1', name: 'Nebula', color: null, url: 'https://picsum.photos/seed/bg1/1920/1080' },
    { id: 'image-2', name: 'Forest', color: null, url: 'https://picsum.photos/seed/bg2/1920/1080' },
    { id: 'solid-1', name: 'Dark Slate', color: '#2C2F33', url: null },
];

export const defaultUserSettings: UserSettings = {
    accentColor: '#5865F2',
    chatBackground: 'default',
    theme: 'dark',
    developerMode: false,
    friendRequestPermissions: 'everyone',
    allowDmsFromServers: true,
    explicitMediaFilter: true,
};

// All users in the app
export const initialUsers: User[] = [
    { id: 'u1', name: 'CodeCrusader', publicId: '8293041735', avatarUrl: 'https://picsum.photos/seed/u1/32/32', status: 'online', joinedAt: 'Dec 12, 2022', activity: { type: 'custom', name: 'Building Discord clones' }, isMuted: false, isDeafened: false, isSpeaking: false, settings: defaultUserSettings, completedOnboarding: [], bio: 'Full-stack developer turning coffee into code. Building a faithful Discord clone with React & TypeScript.', bannerUrl: 'https://picsum.photos/seed/banner1/600/240' },
    { id: 'u2', name: 'Gemine', publicId: '2038412746', avatarUrl: 'https://picsum.photos/seed/u2/32/32', status: 'online', activity: null, joinedAt: 'Jan 1, 2023', isMuted: false, isDeafened: false, isSpeaking: false },
    { id: 'u3', name: 'Dev Chuant', publicId: '3049523857', avatarUrl: 'https://picsum.photos/seed/u3/32/32', status: 'dnd', activity: { type: 'playing', name: 'Visual Studio Code', details: 'Editing permissions.ts', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png' }, joinedAt: 'Feb 15, 2023', isMuted: false, isDeafened: false, isSpeaking: false },
    { id: 'u4', name: 'TYSON', publicId: '1027301635', avatarUrl: 'https://picsum.photos/seed/u4/32/32', status: 'online', activity: { type: 'playing', name: 'Valorant', details: 'Competitive (2-1)', iconUrl: GAME_ICON_URL }, joinedAt: 'May 29, 2023', isMuted: false, isDeafened: false, isSpeaking: true },
    { id: 'u5', name: 'Aolmralles', publicId: '5061745079', avatarUrl: 'https://picsum.photos/seed/u5/32/32', status: 'idle', activity: { type: 'listening', name: 'Lo-fi Hip Hop Radio', details: 'by Lofi Girl', iconUrl: MUSIC_ICON_URL }, joinedAt: 'Apr 5, 2023', isMuted: true, isDeafened: false, isSpeaking: false },
    { id: 'u6', name: 'PixalPlay', publicId: '6072856180', avatarUrl: 'https://picsum.photos/seed/u6/40/40', status: 'online', joinedAt: 'May 1, 2023', activity: { type: 'custom', name: 'Designing new assets! 🎨' }, isMuted: false, isDeafened: false, isSpeaking: false },
    { id: 'u7', name: 'Coe Fkoplory', publicId: '7083967291', avatarUrl: 'https://picsum.photos/seed/u7/40/40', status: 'online', joinedAt: 'Jun 10, 2023', activity: null, isMuted: false, isDeafened: false, isSpeaking: false },
    { id: 'u8', name: 'EchoDelta', publicId: '8094078302', avatarUrl: 'https://picsum.photos/seed/u8/32/32', status: 'online', joinedAt: 'Jul 2, 2023', activity: { type: 'playing', name: 'Minecraft', iconUrl: GAME_ICON_URL }, isMuted: false, isDeafened: true, isSpeaking: false },
    { id: 'u99', name: 'SpamBot', publicId: '9999999999', avatarUrl: 'https://picsum.photos/seed/u99/32/32', status: 'offline', joinedAt: 'Aug 21, 2023', activity: null, isMuted: false, isDeafened: false, isSpeaking: false }
];

export const initialCurrentUser: User | undefined = initialUsers.find(u => u.id === 'u1');

if (initialCurrentUser) {
    initialCurrentUser.friends = [
        { user: initialUsers.find(u => u.id === 'u2')!, status: 'online' },
        { user: initialUsers.find(u => u.id === 'u3')!, status: 'online' },
        { user: initialUsers.find(u => u.id === 'u5')!, status: 'online' },
        { user: initialUsers.find(u => u.id === 'u6')!, status: 'online' },
        { user: initialUsers.find(u => u.id === 'u8')!, status: 'online' },
        { user: initialUsers.find(u => u.id === 'u99')!, status: 'blocked' },
    ];
}


export const serverPermissions: Record<string, { name: string; description: string }[]> = {
    "GENERAL SERVER PERMISSIONS": [
        { name: "View Audit Log", description: "يتيح الاطلاع على سجل الإجراءات الإدارية." },
        { name: "Manage Server", description: "يسمح بتغيير الاسم، المنطقة، ومستوى التحقق." },
        { name: "Manage Roles", description: "يتيح إنشاء وتعديل وحذف الرتب الأدنى من رتبته." },
        { name: "Manage Channels", description: "يتيح إنشاء، حذف، وتعديل القنوات والفئات." },
        { name: "Kick Members", description: "يسمح بطرد الأعضاء." },
        { name: "Ban Members", description: "يسمح بحظر الأعضاء." },
        { name: "Create Invite", description: "يتيح إنشاء روابط دعوة للخادم." },
        { name: "Change Nickname", description: "يتيح تغيير اسمه الخاص في الخادم." },
        { name: "Manage Nicknames", description: "يتيح تغيير أسماء الأعضاء الآخرين." },
    ],
    "MEMBERSHIP PERMISSIONS": [
        { name: "View Channels", description: "الإذن الأساسي لرؤية القنوات في الشريط الجانبي." },
        { name: "Send Messages", description: "الإذن اللازم للكتابة في حقل الرسالة في القنوات النصية." },
        { name: "Send Messages in Threads", description: "يسمح بالمشاركة في المحادثات الفرعية (Threads)." },
        { name: "Embed Links", description: "يتيح عرض معاينة للروابط (URL Previews)." },
        { name: "Attach Files", description: "يتيح تحميل الملفات والصور في الرسائل." },
        { name: "Read Message History", description: "يتيح رؤية الرسائل القديمة التي أُرسلت قبل انضمامهم." },
        { name: "Use External Emojis", description: "يتيح استخدام الرموز التعبيرية من خوادم أخرى." },
    ],
    "TEXT MODERATION PERMISSIONS": [
        { name: "Manage Messages", description: "يتيح حذف رسائل الأعضاء الآخرين وتثبيتها." },
        { name: "Manage Threads", description: "يتيح أرشفة المواضيع وحذفها (حتى لو لم ينشئها هو)." },
        { name: "Mention @everyone, @here", description: "يتيح استخدام التنبيهات الشاملة (Spam Prevention)." },
        { name: "Use Application Commands", description: "يتيح استخدام الأوامر المائلة (Slash Commands) للبوتات." },
    ],
    "VOICE CHANNEL PERMISSIONS": [
        { name: "Connect", description: "يتيح الانضمام إلى القنوات الصوتية." },
        { name: "Speak", description: "يتيح إخراج الصوت (يتأثر بإعدادات Push-to-Talk)." },
        { name: "Video", description: "يتيح مشاركة الفيديو/الشاشة في القناة الصوتية." },
        { name: "Mute Members", description: "يتيح كتم صوت ميكروفون أعضاء آخرين قسرياً." },
        { name: "Deafen Members", description: "يتيح منع أعضاء آخرين من سماع أي صوت في القناة." },
        { name: "Move Members", description: "يتيح سحب الأعضاء من قناة صوتية إلى أخرى." },
    ],
     "ADVANCED PERMISSIONS": [
        { name: "Administrator", description: "يمنح جميع الأذونات ويتجاوز قواعد المنع الصريحة. (الأهمية القصوى)" },
    ]
};

export const createPermissions = (allowed: string[]): Record<string, boolean> => {
    const allPermissions = Object.values(serverPermissions).flat().map(p => p.name);
    const permissions: Record<string, boolean> = {};
    for (const p of allPermissions) {
        permissions[p] = allowed.includes(p);
    }
    return permissions;
};

const ownerPermissions = createPermissions(Object.values(serverPermissions).flat().map(p => p.name));
const adminPermissions = createPermissions(["View Channels", "Manage Channels", "Manage Roles", "View Audit Log", "Manage Server", "Create Invite", "Change Nickname", "Manage Nicknames", "Kick Members", "Ban Members", "Send Messages", "Send Messages in Threads", "Embed Links", "Attach Files", "Read Message History", "Use External Emojis", "Mention @everyone, @here", "Connect", "Speak", "Video", "Mute Members", "Deafen Members", "Move Members", "Manage Messages"]);
const memberPermissions = createPermissions(["View Channels", "Create Invite", "Change Nickname", "Send Messages", "Send Messages in Threads", "Embed Links", "Attach Files", "Read Message History", "Use External Emojis", "Connect", "Speak", "Video"]);
const everyonePermissions = createPermissions(["View Channels", "Read Message History", "Connect", "Speak", "Send Messages"]);
const goldSubscriberPermissions = createPermissions(["View Channels", "Create Invite", "Change Nickname", "Send Messages", "Send Messages in Threads", "Embed Links", "Attach Files", "Read Message History", "Use External Emojis", "Connect", "Speak", "Video"]);


const ghRoles: Role[] = [
    { id: 'r0', name: 'OWNER SHIP👑', color: '#FFD700', permissions: ownerPermissions, icon: '👑', displaySeparately: true, isMentionable: false },
    { id: 'r1', name: 'Admin', color: '#E74C3C', permissions: adminPermissions, icon: '🛡️', displaySeparately: true, isMentionable: true },
    { id: 'r-gold', name: 'Gold Subscriber', color: '#F1C40F', permissions: goldSubscriberPermissions, icon: '⭐', displaySeparately: true, isMentionable: false },
    { id: 'r2', name: 'Member', color: '#3498DB', permissions: memberPermissions, displaySeparately: false, isMentionable: false },
    { id: 'r3', name: '@everyone', color: '#99AAB5', permissions: everyonePermissions, displaySeparately: false, isMentionable: false },
];

const ghEmojis: Emoji[] = [
    { id: 'e1', name: 'pog', imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACYSURBVEhL7dAxCsAgEATR+v+fbk5SQ1gqQcCanf2yA9/DaI6p0D8Pz8C41UoFzD8dIKgBAlU3gVSAoIZQBREaghJECUEUhFSC4JAIpQhC4JEI5QkC5JVI5QkC5ZVIFQkCgKVIJQgCaJFIJQgCKJFIZQgCqJVIZQgCqJVI5ZUD1J8FUr9Bqf6LVI4D8A/ct3gA6tY/iH0BxtgLz2/kAAAAAElFTkSuQmCC' },
    { id: 'e2', name: 'catjam', imageUrl: 'data:image/gif;base64,R0lGODlhGgAaAIAAAAAAAP///yH5BAEAAAAALAAAAAAaABoAAAIwjI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyrAGBjdE63d/4EwUAOw==' },
];

const ghInvites: Invite[] = [
    { code: 'Hj3kPq', inviterId: 'u1', uses: 12, maxUses: 'infinite', expiresAt: 'Never' }
];

const ghBans: Ban[] = [
    { userId: 'u99', reason: 'Spamming links' }
];

const ghAuditLog: AuditLogEntry[] = [
    { id: 'al4', actorId: 'automod', action: 'حذف رسالة', target: 'SpamBot', targetId: 'u99', changes: [{ key: 'reason', oldValue: '', newValue: 'Blocked Keyword: heck'}], timestamp: 'Sep 2, 2023' },
    { id: 'al3', actorId: 'u1', action: 'حدّث الدور', target: 'Admin', targetId: 'r1', changes: [{ key: 'color', oldValue: '#FF0000', newValue: '#E74C3C'}], timestamp: 'Sep 1, 2023' },
    { id: 'al2', actorId: 'u1', action: 'حظر مستخدم', target: 'SpamBot', targetId: 'u99', timestamp: 'Aug 21, 2023' },
    { id: 'al1', actorId: 'u2', action: 'أنشأ قناة', target: 'general', targetId: 'c3', timestamp: 'Jan 1, 2023' },
];

const ghAutoModRules: AutoModRule[] = [
    {
        id: 'amr1',
        name: 'Block Profanity',
        type: 'keyword',
        keywords: ['heck', 'darn', 'badword'],
        action: 'block',
        isEnabled: true,
    },
    {
        id: 'amr2',
        name: 'Timeout for Spam Links',
        type: 'link',
        action: 'timeout',
        timeoutDurationMs: 60000, // 60 seconds
        isEnabled: true,
    },
    {
        id: 'amr3',
        name: 'Alert for bad vibes',
        type: 'keyword',
        keywords: ['i hate this', 'this server is bad'],
        action: 'alert',
        isEnabled: false,
    }
];

const ghSubscriptionTiers: SubscriptionTier[] = [
    {
        id: 'tier1',
        name: 'Gold Tier',
        price: '$4.99/month',
        description: 'Get access to exclusive channels, a special role color, and our eternal gratitude!',
        roleId: 'r-gold',
    }
];

export const initialServers: Server[] = [
    { 
      id: 'dm', 
      name: 'Direct Messages', 
      icon: React.createElement(DmIcon, { className: "w-7 h-7" }), 
      memberIds: [], 
      memberRoles: {},
    },
    { 
      id: '1', 
      name: 'Gaming Hub', 
      imageUrl: 'https://picsum.photos/seed/s1/48/48',
      ownerId: 'u1',
      memberIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'],
      memberRoles: {
          'u1': ['r0', 'r3'],
          'u2': ['r1', 'r3'],
          'u3': ['r1', 'r3'],
          'u4': ['r2', 'r3'],
          'u5': ['r2', 'r3'],
          'u6': ['r2', 'r3'],
          'u7': ['r2', 'r3'],
          'u8': ['r2', 'r3'],
      },
      memberNicknames: {
        'u4': 'T-Bone',
        'u5': 'DJ LoFi'
      },
      memberTimeouts: {},
      roles: ghRoles,
      emojis: ghEmojis,
      invites: ghInvites,
      bans: ghBans,
      auditLog: ghAuditLog,
      autoModRules: ghAutoModRules,
      subscriptionTiers: ghSubscriptionTiers,
      memberSubscriptions: {},
      welcomeScreen: {
        title: 'Welcome to the Gaming Hub!',
        description: "This is the place for all things gaming. Here are a few recommended channels to get you started:",
        callToActionChannels: [
          { channelId: 'c2', label: '📜 Read the server rules' },
          { channelId: 'c3', label: '👋 Introduce yourself in #general' },
          { channelId: 'c4', label: '🔫 Find a group in #valorant-lfg' }
        ]
      }
    },
    { id: '2', name: 'Art Corner', imageUrl: 'https://picsum.photos/seed/s2/48/48', memberIds: ['u1'], memberRoles: {}, ownerId: 'u1' },
    { id: '3', name: 'Study Group', imageUrl: 'https://picsum.photos/seed/s3/48/48', memberIds: ['u1'], memberRoles: {}, ownerId: 'u1' }
];

export const initialCategories: Category[] = [
    { id: 'cat1', name: 'Text Channels', serverId: '1' },
    { id: 'cat-subs', name: '⭐ Subscribers Only', serverId: '1' },
    { id: 'cat2', name: 'Voice Channels', serverId: '1' },
];

// FIX: Corrected and completed initialChannels array
export const initialChannels: Channel[] = [
    // DM channels
    { id: 'dm-u2', serverId: 'dm', name: 'Gemine', type: 'dm', participantIds: ['u1', 'u2']},
    { id: 'dm-u3', serverId: 'dm', name: 'Dev Chuant', type: 'dm', participantIds: ['u1', 'u3']},
    
    // Gaming Hub channels
    { id: 'c1', serverId: '1', name: 'announcements', type: 'text', categoryId: 'cat1' },
    { id: 'c2', serverId: '1', name: 'rules', type: 'text', categoryId: 'cat1' },
    { id: 'c3', serverId: '1', name: 'general', type: 'text', categoryId: 'cat1' },
    { id: 'c4', serverId: '1', name: 'valorant-lfg', type: 'text', categoryId: 'cat1' },
    { id: 'c5', serverId: '1', name: 'minecraft-chat', type: 'text', categoryId: 'cat1' },
    { 
        id: 'c-gold', 
        serverId: '1', 
        name: 'gold-chat', 
        type: 'text', 
        categoryId: 'cat-subs',
        permissionOverwrites: [
            { id: 'r3', type: 'role', allow: [], deny: ['View Channels'] }, // @everyone
            { id: 'r-gold', type: 'role', allow: ['View Channels'], deny: [] } // Gold Subscribers
        ]
    },
    { id: 'vc1', serverId: '1', name: 'Lobby', type: 'voice', categoryId: 'cat2' },
    { id: 'vc2', serverId: '1', name: 'Valorant Duo', type: 'voice', categoryId: 'cat2' },
    
    // Art Corner channels
    { id: 'ac1', serverId: '2', name: 'showcase', type: 'text' },
    { id: 'ac2', serverId: '2', name: 'critique', type: 'text' },
    
    // Study Group channels
    { id: 'sc1', serverId: '3', name: 'homework-help', type: 'text' },
];

// FIX: Add initialMessages export
export const initialMessages: Message[] = [
  { id: 'msg1', channelId: 'c3', authorId: 'u2', content: 'Hey everyone, welcome to the server! Feel free to introduce yourselves.', timestamp: '10:30 AM' },
  { id: 'msg2', channelId: 'c3', authorId: 'u4', content: "What's up! Anyone wanna queue for some Valorant?", timestamp: '10:32 AM', reactions: [{ emoji: '👋', userIds: ['u1', 'u5']}] },
  { id: 'msg3', channelId: 'c3', authorId: 'u1', content: "I'm down for some Val later tonight maybe. Just finishing up some work right now.", timestamp: '10:35 AM' },
  { id: 'msg4', channelId: 'c4', authorId: 'u4', content: 'LFG for comp, need 2 more. I can play smokes.', timestamp: '10:40 AM' },
  { id: 'msg5', channelId: 'c2', authorId: 'u1', content: '## Server Rules\n1. Be respectful to all members.\n2. No spamming or self-promotion.\n3. Keep conversations in their respective channels.', timestamp: '10:20 AM' },
  { id: 'msg6', channelId: 'dm-u3', authorId: 'u3', content: 'Did you manage to fix that bug with the permissions?', timestamp: '11:00 AM' },
  { id: 'msg7', channelId: 'dm-u3', authorId: 'u1', content: 'Yeah, just pushed the fix. It was a weird edge case with role overrides.', timestamp: '11:02 AM' },
  { id: 'msg8', channelId: 'c3', authorId: 'u5', content: "Chilling with some lo-fi beats. What's everyone's favorite study music?", timestamp: '11:15 AM' },
  { id: 'msg9', channelId: 'c3', authorId: 'u6', content: 'Just finished a new design, check it out in #showcase on the Art Corner server!', timestamp: '11:20 AM' },
  { id: 'msg10', channelId: 'dm-u2', authorId: 'u2', content: 'Hello! I am an AI assistant. How can I help you today?', timestamp: '9:00 AM' },
  { id: 'msg11', channelId: 'c3', authorId: 'u99', content: 'This message should be hidden because SpamBot is blocked.', timestamp: '11:30 AM' },
  { id: 'msg12', channelId: 'dm-u2', authorId: 'u2', content: 'This is a message with an image from a non-friend.', timestamp: '11:45 AM', attachments: [{ id: 'att-dm', filename: 'dm_image.png', url: 'https://picsum.photos/seed/dm-image/400/300', fileType: 'image', size: 12345 }] },

];

// FIX: Add initializeNewServer export
export const initializeNewServer = (name: string, ownerId: string, template: 'private' | 'community'): { server: Server, categories: Category[], channels: Channel[] } => {
    const serverId = `s-${Date.now()}`;
    const memberIds = [ownerId];

    // A simplified role structure for new servers.
    // It's important to use unique IDs for roles too.
    const newOwnerRole: Role = { id: `r-${serverId}-0`, name: 'OWNER SHIP👑', color: '#FFD700', permissions: createPermissions(Object.values(serverPermissions).flat().map(p => p.name)), displaySeparately: true };
    const newMemberRole: Role = { id: `r-${serverId}-2`, name: 'Member', color: '#3498DB', permissions: createPermissions(["View Channels", "Create Invite", "Change Nickname", "Send Messages", "Read Message History", "Connect", "Speak"]) };
    const newEveryoneRole: Role = { id: `r-${serverId}-3`, name: '@everyone', color: '#99AAB5', permissions: createPermissions(["View Channels", "Read Message History", "Connect", "Speak"]) };

    const roles: Role[] = [newOwnerRole, newMemberRole, newEveryoneRole];
    const memberRoles = { [ownerId]: [newOwnerRole.id, newEveryoneRole.id] };
    
    const newServer: Server = {
        id: serverId,
        name,
        ownerId,
        memberIds,
        memberRoles,
        roles,
        imageUrl: `https://picsum.photos/seed/${serverId}/48/48`,
    };

    let newCategories: Category[] = [];
    let newChannels: Channel[] = [];

    if (template === 'private') {
        newChannels.push({ id: `c-${serverId}-1`, serverId, name: 'general', type: 'text' });
        newChannels.push({ id: `vc-${serverId}-1`, serverId, name: 'Lounge', type: 'voice' });
    } else { // community template
        const textCatId = `cat-${serverId}-1`;
        const voiceCatId = `cat-${serverId}-2`;
        newCategories = [
            { id: textCatId, name: 'Text Channels', serverId },
            { id: voiceCatId, name: 'Voice Channels', serverId }
        ];
        newChannels = [
            { id: `c-${serverId}-1`, serverId, name: 'welcome-and-rules', type: 'text', categoryId: textCatId },
            { id: `c-${serverId}-2`, serverId, name: 'general', type: 'text', categoryId: textCatId },
            { id: `vc-${serverId}-1`, serverId, name: 'General', type: 'voice', categoryId: voiceCatId }
        ];
    }

    return { server: newServer, categories: newCategories, channels: newChannels };
};
