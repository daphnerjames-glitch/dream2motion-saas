import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function GrannyDashboard() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchEpisodes();
  }, [router]);

  const fetchEpisodes = async () => {
    try {
      const res = await fetch('/api/granny/episodes');
      if (!res.ok) {
        setError('Failed to load episodes');
        return;
      }
      const data = await res.json();
      setEpisodes(data.episodes || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error loading episodes');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    fetchEpisodes();
  };

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading episodes...</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1>Granny YouTube Episodes</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={refreshStatus}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh Status
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Characters</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Length (min)</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((episode, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{episode.date}</td>
                <td style={{ padding: '10px' }}>{episode.title}</td>
                <td style={{ padding: '10px' }}>{episode.characters}</td>
                <td style={{ padding: '10px' }}>{episode.length}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: episode.status === 'success' ? '#d4edda' : episode.status === 'error' ? '#f8d7da' : '#fff3cd',
                    color: episode.status === 'success' ? '#155724' : episode.status === 'error' ? '#721c24' : '#856404'
                  }}>
                    {episode.status}
                  </span>
                </td>
                <td style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
                  {episode.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
