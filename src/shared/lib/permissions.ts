import type { CurrentUser } from './auth';

export type UserRole = CurrentUser['role'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'מנהל מערכת',
  risk_manager: 'מנהל סיכונים',
  viewer: 'צופה',
  auditor: 'מבקר',
};

export const ROLE_COLORS: Record<UserRole, { color: string; bg: string }> = {
  admin: { color: '#7C3AED', bg: '#EDE9FE' },
  risk_manager: { color: '#1D6FAB', bg: '#E0F2FE' },
  viewer: { color: '#475569', bg: '#F1F5F9' },
  auditor: { color: '#D97706', bg: '#FEF3C7' },
};

/** Roles that can create/edit/delete data */
export function canEdit(role: UserRole): boolean {
  return role === 'admin' || role === 'risk_manager';
}

/** Only admins can manage users */
export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

/** Roles that can view audit logs */
export function canViewAudit(role: UserRole): boolean {
  return role === 'admin' || role === 'auditor';
}
