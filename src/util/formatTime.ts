// Turns an ISO timestamp into a short WhatsApp-style label.
export function formatShortTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const withinAWeek = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 7;
  if (withinAWeek) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString();
}
