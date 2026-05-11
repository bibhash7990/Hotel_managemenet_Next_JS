'use client';

import { createContext, useContext } from 'react';

const StaffBasePathContext = createContext('/admin');

export function StaffBasePathProvider({ value, children }: { value: string; children: React.ReactNode }) {
  return <StaffBasePathContext.Provider value={value}>{children}</StaffBasePathContext.Provider>;
}

/** Base URL for the current staff panel (`/admin` or `/manager`). */
export function useStaffBasePath(): string {
  return useContext(StaffBasePathContext);
}
