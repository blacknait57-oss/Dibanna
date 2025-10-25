
import type { User, Server, Channel, Role } from './types';

export const getHighestRole = (user: User, server: Server): Role | null => {
    const userRoleIds = server.memberRoles[user.id] || [];
    if (!server.roles) return null;
    // Roles are pre-sorted in data.ts from highest to lowest, so we just find the first match.
    for (const role of server.roles) {
      if (userRoleIds.includes(role.id)) {
        return role;
      }
    }
    return null;
};

export const hasServerPermission = (
  permission: string,
  user: User,
  server: Server
): boolean => {
  if (!user || !server || !server.roles) return false;

  const userRoleIds = server.memberRoles[user.id] || [];
  
  const everyoneRole = server.roles.find(r => r.name === '@everyone');
  if (everyoneRole && !userRoleIds.includes(everyoneRole.id)) {
      userRoleIds.push(everyoneRole.id);
  }

  const userRoles = server.roles.filter(role => userRoleIds.includes(role.id));

  // 1. Administrator permission overrides everything.
  if (userRoles.some(role => role.permissions['Administrator'])) {
    return true;
  }

  // 2. Check if any role has the specific permission.
  return userRoles.some(role => role.permissions[permission]);
};


export const hasPermission = (
  permission: string,
  user: User,
  server: Server,
  channel: Channel
): boolean => {
  if (!user || !server || !server.roles) return false;

  const userRoleIds = server.memberRoles[user.id] || [];
  const everyoneRole = server.roles.find(r => r.name === '@everyone');
  if (everyoneRole && !userRoleIds.includes(everyoneRole.id)) {
      userRoleIds.push(everyoneRole.id);
  }

  const userRoles = server.roles.filter(role => userRoleIds.includes(role.id));

  // 1. Administrator permission overrides everything.
  if (userRoles.some(role => role.permissions['Administrator'])) {
    return true;
  }

  // 2. Calculate base permissions from server roles.
  let hasPermissionAtServerLevel = false;
  for (const role of userRoles) {
    if (role.permissions[permission]) {
      hasPermissionAtServerLevel = true;
      break;
    }
  }

  // 3. Apply channel overwrites
  const overwrites = channel.permissionOverwrites || [];

  // Check for an explicit DENY on any role. This takes highest priority.
  const hasDeny = userRoles.some(role => {
    const overwrite = overwrites.find(o => o.id === role.id);
    return overwrite?.deny.includes(permission);
  });
  if (hasDeny) return false;

  // Check for an explicit ALLOW on any role. This is next.
  const hasAllow = userRoles.some(role => {
    const overwrite = overwrites.find(o => o.id === role.id);
    return overwrite?.allow.includes(permission);
  });
  if (hasAllow) return true;

  // If no channel-specific rule, fall back to the server-level permissions.
  return hasPermissionAtServerLevel;
};