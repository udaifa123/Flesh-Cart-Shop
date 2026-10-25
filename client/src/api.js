export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    const err = new Error('Cannot reach the server. Check that the backend is running.');
    err.status = 0;
    err.errors = {};
    throw err;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    // Session ended (expired/logged out elsewhere): tell the app so it can redirect to login
    if (res.status === 401 && path !== '/auth/login') window.dispatchEvent(new Event('auth-expired'));
    const err = new Error(data?.message || 'Request failed');
    err.status = res.status;
    err.errors = data?.errors || {};
    throw err;
  }
  return data;
}
