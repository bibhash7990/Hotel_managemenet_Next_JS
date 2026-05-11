export const UserRoles = ['CUSTOMER', 'HOTEL_MANAGER', 'SUPER_ADMIN'] as const;
export type UserRole = (typeof UserRoles)[number];
