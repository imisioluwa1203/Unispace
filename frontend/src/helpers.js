export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function initials(fullName) {
  return fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function pagesRead(documents) {
  return documents.reduce((sum, d) => sum + (d.total_pages ? d.last_page : 0), 0);
}

// The PDF you opened most recently (falls back to the newest one you have opened)
export function pickContinue(documents) {
  const opened = documents.filter((d) => d.total_pages && d.last_page);
  if (opened.length === 0) return null;
  const stamp = (d) => (d.last_opened_at ? Date.parse(d.last_opened_at) : 0);
  return [...opened].sort((a, b) => stamp(b) - stamp(a) || b.id - a.id)[0];
}