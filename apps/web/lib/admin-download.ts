const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function downloadAdminReport(format: 'csv' | 'pdf', accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/reports/export?format=${format}&limit=500`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = format === 'pdf' ? 'stayhub-reports.pdf' : 'stayhub-reports.csv';
  a.click();
  URL.revokeObjectURL(url);
}
