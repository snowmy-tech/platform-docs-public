'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    setLoading(false);
    if (res.ok) {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('from') || '/';
    } else {
      setError('Invalid key');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Enter your access key to continue.</p>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Access key"
          autoFocus
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
        />
        {error && <span style={{ color: '#c00', fontSize: 13 }}>{error}</span>}
        <button type="submit" disabled={loading || !key} style={{ padding: 8, borderRadius: 4, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
