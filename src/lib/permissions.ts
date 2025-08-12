/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * This file defines the permission structure for the Wingspan Yoga platform.
 * It serves as documentation and can be used for programmatic access control.
 */

export enum Role {
  MEMBER = 'MEMBER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export type Permission = 
  // General permissions
  | 'read:public_content'
  | 'manage:own_bookings'
  | 'manage:own_profile'
  
  // Class permissions
  | 'read:class_schedule'
  | 'read:own_classes'
  | 'manage:class_templates'
  | 'manage:class_instances'
  | 'read:class_rosters'
  
  // User management
  | 'read:all_users'
  | 'manage:all_users'
  | 'manage:user_roles'
  
  // Content management (future features)
  | 'create:blog_posts'
  | 'manage:own_blog_posts'
  | 'manage:all_blog_posts'
  | 'upload:videos'
  | 'manage:own_videos'
  | 'manage:all_videos'
  | 'manage:mailing_list'
  | 'manage:site_content'
  
  // System administration
  | 'manage:system_settings'
  | 'access:admin_dashboard'
  | 'access:instructor_portal'
  | 'manage:payments'
  | 'manage:subscriptions'
  | 'access:security_settings'
  | 'view:analytics'
  | 'manage:webhooks'

/**
 * Permission matrix defining what each role can do
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.MEMBER]: [
    'read:public_content',
    'manage:own_bookings',
    'manage:own_profile',
    'read:class_schedule',
  ],
  
  [Role.INSTRUCTOR]: [
    // All member permissions
    'read:public_content',
    'manage:own_bookings',
    'manage:own_profile',
    'read:class_schedule',
    
    // Instructor-specific permissions
    'read:own_classes',
    'read:class_rosters',
    'access:instructor_portal',
    
    // Future content management permissions
    'create:blog_posts',
    'manage:own_blog_posts',
    'upload:videos',
    'manage:own_videos',
    'manage:mailing_list',
    'manage:site_content',
  ],
  
  [Role.ADMIN]: [
    // All permissions - full system access
    'read:public_content',
    'manage:own_bookings',
    'manage:own_profile',
    'read:class_schedule',
    'read:own_classes',
    'manage:class_templates',
    'manage:class_instances',
    'read:class_rosters',
    'read:all_users',
    'manage:all_users',
    'manage:user_roles',
    'create:blog_posts',
    'manage:own_blog_posts',
    'manage:all_blog_posts',
    'upload:videos',
    'manage:own_videos',
    'manage:all_videos',
    'manage:mailing_list',
    'manage:site_content',
    'manage:system_settings',
    'access:admin_dashboard',
    'access:instructor_portal',
    'manage:payments',
    'manage:subscriptions',
    'access:security_settings',
    'view:analytics',
    'manage:webhooks',
  ],
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Check if a user role can access a specific route pattern
 */
export function canAccessRoute(userRole: Role, route: string): boolean {
  if (route.startsWith('/admin')) {
    return hasPermission(userRole, 'access:admin_dashboard');
  }
  
  if (route.startsWith('/instructor')) {
    return hasPermission(userRole, 'access:instructor_portal');
  }
  
  // Public routes are accessible to all roles
  return true;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(userRole: Role): Permission[] {
  return ROLE_PERMISSIONS[userRole];
}

/**
 * Role hierarchy for inheritance (lower number = higher privilege)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.ADMIN]: 1,
  [Role.INSTRUCTOR]: 2,
  [Role.MEMBER]: 3,
};

/**
 * Check if one role has higher or equal privilege than another
 */
export function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[requiredRole];
}
