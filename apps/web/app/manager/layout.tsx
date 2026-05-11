import { StaffShell } from '@/components/staff/staff-shell';

const links = [
  { href: '/manager', label: 'Overview' },
  { href: '/manager/hotels', label: 'Hotels' },
  { href: '/manager/rooms', label: 'Rooms' },
  { href: '/manager/bookings', label: 'Bookings' },
  { href: '/manager/reviews', label: 'Reviews' },
  { href: '/manager/reports', label: 'Reports' },
] as const;

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffShell
      basePath="/manager"
      eyebrow="Hotel manager"
      navAriaLabel="Hotel manager sections"
      links={links}
    >
      {children}
    </StaffShell>
  );
}
