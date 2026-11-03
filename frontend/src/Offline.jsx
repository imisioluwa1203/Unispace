import { useState, useEffect } from "react";

const PDF_CACHE = "unispace-pdfs";
const DATA_PREFIX = "unispace_data_";

// Same id + same upload time = same PDF. (SQLite can reuse an id after a delete.)
export function docKey(doc) {
  return `${doc.id}-${doc.created_at}`;
}

function pdfUrl(doc) {
  return `/offline-pdf/${encodeURIComponent(docKey(doc))}`;
}

export async function getCachedPdf(doc) {
  if (!("caches" in window)) return null;
  try {
    const cache = await caches.open(PDF_CACHE);
    const hit = await cache.match(pdfUrl(doc));
    return hit ? await hit.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function savePdfToCache(doc, buffer) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(PDF_CACHE);
    await cache.put(
      pdfUrl(doc),
      new Response(buffer, { headers: { "Content-Type": "application/pdf" } })
    );
  } catch {
    // storage full or blocked: the PDF still opens, it just is not saved
  }
}

export async function hasCachedPdf(doc) {
  if (!("caches" in window)) return false;
  try {
    const cache = await caches.open(PDF_CACHE);
    return Boolean(await cache.match(pdfUrl(doc)));
  } catch {
    return false;
  }
}

export async function removeCachedPdf(doc) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(PDF_CACHE);
    await cache.delete(pdfUrl(doc));
  } catch {
    // nothing to remove
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(DATA_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full: skip
  }
}

export function loadData(key) {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeData(key) {
  localStorage.removeItem(DATA_PREFIX + key);
}

// Used on logout, so the next person on a shared phone sees nothing of yours
export async function clearOffline() {
  if ("caches" in window) {
    try {
      await caches.delete(PDF_CACHE);
    } catch {
      // nothing to clear
    }
  }
  Object.keys(localStorage)
    .filter((k) => k.startsWith(DATA_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  return online;
}