import { StaffShell } from '@/components/staff/staff-shell';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/hotels', label: 'Hotels' },
  { href: '/admin/rooms', label: 'Rooms' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffShell
      basePath="/admin"
      eyebrow="StayHub super admin"
      navAriaLabel="Super admin sections"
      links={links}
    >
      {children}
    </StaffShell>
  );
}
