const ROLE_KEY = 'hotel_role';

export function setSessionRole(role: string | null): void {
  if (typeof window === 'undefined') return;
  if (!role) sessionStorage.removeItem(ROLE_KEY);
  else sessionStorage.setItem(ROLE_KEY, role);
}

export function getSessionRole(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ROLE_KEY);
}

export function isSuperAdminRole(role: string | null): boolean {
  return role === 'SUPER_ADMIN';
}

export function isHotelManagerRole(role: string | null): boolean {
  return role === 'HOTEL_MANAGER';
}

/** Either staff role (API `/admin/*` and legacy checks). */
export function isAdminRole(role: string | null): boolean {
  return isSuperAdminRole(role) || isHotelManagerRole(role);
}
