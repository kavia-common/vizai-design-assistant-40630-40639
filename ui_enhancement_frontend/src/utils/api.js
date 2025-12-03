import { getApiBase } from '../AppRouter';

// PUBLIC_INTERFACE
export async function apiGet(path) {
  /** Perform GET to backend API base with graceful empty fallback. */
  const base = getApiBase();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return await res.json();
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, options = {}) {
  /** Perform POST to backend API; return JSON or null. */
  const base = getApiBase();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`POST ${path} failed`);
    const ct = res.headers.get('content-type')||'';
    if (ct.includes('application/json')) return await res.json();
    return { ok: true };
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export async function apiDownload(path, body, type = 'pdf') {
  /** Download file (PDF/Excel). Returns blob URL or null. */
  const base = getApiBase();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    // Attempt filename from headers
    let filename = `export.${type === 'excel' ? 'xlsx' : 'pdf'}`;
    const disp = res.headers.get('content-disposition');
    if (disp && disp.includes('filename=')) {
      filename = disp.split('filename=')[1].replace(/"/g, '').trim();
    }
    return { blobUrl, filename };
  } catch {
    return null;
  }
}
