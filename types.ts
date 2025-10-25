import type { ReactNode } from 'react';

export interface Role {
  id: string;
  name: string;
  color: string;
  icon?: string;
  permissions: Record<string, boolean>;
  displaySeparately?: boolean;
  isMentionable?: boolean;
}

export interface Emoji {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Invite {
  code: string;
  inviterId: string;
  uses: number;
  maxUses: number | 'infinite';
  expiresAt: string;
}

export interface Ban {
  userId: string;
  reason?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string; // This will be in Arabic
  target?: string; // name of the target
  targetId?: string;
  changes?: { key: string; oldValue?: any; newValue?: any }[];
  timestamp: string;
}

export interface WelcomeScreenSettings {
  title: string;
  description: string;
  callToActionChannels: {
    channelId: string;
    label: string;
  }[];
}

export interface AutoModRule {
  id: string;
  name: string;
  type: 'keyword' | 'link';
  keywords?: string[];
  action: 'block' | 'alert' | 'timeout';
  timeoutDurationMs?: number;
  isEnabled: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string; // e.g., "$4.99"
  description: string;
  roleId: string;
}

export interface Server {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: ReactNode;
  memberIds: string[];
  memberRoles: Record<string, string[]>;
  roles?: Role[];
  emojis?: Emoji[];
  invites?: Invite[];
  bans?: Ban[];
  auditLog?: AuditLogEntry[];
  welcomeScreen?: WelcomeScreenSettings;
  memberNicknames?: Record<string, string>;
  ownerId?: string;
  memberTimeouts?: Record<string, string>; // ISO date string
  autoModRules?: AutoModRule[];
  subscriptionTiers?: SubscriptionTier[];
  memberSubscriptions?: Record<string, string>; // userId -> tierId
}

export interface PermissionOverwrite {
  id: string; // roleId
  type: 'role';
  allow: string[];
  deny: string[];
}

export interface Category {
  id: string;
  name: string;
  serverId: string;
  emoji?: string;
}


export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice' | 'dm';
  categoryId?: string;
  participantIds?: string[];
  emoji?: string;
  permissionOverwrites?: PermissionOverwrite[];
  topic?: string;
  slowmodeCooldown?: number; // in seconds
  isAgeRestricted?: boolean;
}

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface UserActivity {
  type: 'playing' | 'listening' | 'watching' | 'custom';
  name: string;
  details?: string;
  iconUrl?: string;
}

export interface UserSettings {
  accentColor: string;
  chatBackground: string;
  theme: 'dark' | 'light';
  developerMode?: boolean;
  friendRequestPermissions: 'everyone' | 'mutual_friends' | 'server_members';
  allowDmsFromServers: boolean;
  explicitMediaFilter: boolean;
}

export interface Friend {
    user: User;
    status: 'online' | 'pending' | 'blocked';
}

export interface User {
  id:string;
  name: string;
  publicId: string;
  avatarUrl: string;
  status: UserStatus;
  activity?: UserActivity | null;
  joinedAt: string;
  isMuted?: boolean;
  isDeafened?: boolean;
  isSpeaking?: boolean;
  settings?: UserSettings;
  friends?: Friend[];
  completedOnboarding?: string[];
  bio?: string;
  bannerUrl?: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: 'image' | 'video' | 'document';
  size: number;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface Embed {
  title?: string;
  description?: string;
  color?: string;
  fields?: EmbedField[];
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isSystemMessage?: boolean;
  embed?: Embed;
}
