import { useEffect, useState } from 'react';
import { APP_NAME, type HealthResponse } from '@listo/shared';

type ApiStatus = 'loading' | 'ok' | 'error';

export function App() {
  const [status, setStatus] = useState<ApiStatus>('loading');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? (res.json() as Promise<HealthResponse>) : Promise.reject(res)))
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>API: {status}</p>
    </main>
  );
}
