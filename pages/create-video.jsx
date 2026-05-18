import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateVideo() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: 'realistic',
    duration: 'short',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create video');
        return;
      }

      setSuccess('✅ Video generation started! Check your dashboard for progress.');
      setFormData({ title: '', description: '', style: 'realistic', duration: 'short' });

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError('Error creating video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e1e8ed', padding: '20px 40px' }}>
        <h1 style={{ margin: '0', fontSize: '28px', color: '#0f1419' }}>Create New Video</h1>
      </div>

      {/* Content */}
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #e1e8ed' }}>
          {error && (
            <div style={{ color: '#721c24', marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: '#155724', marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f1419', fontSize: '14px' }}>Video Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Mystery at the Casino"
                value={formData.title}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #e1e8ed', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
                required
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#657786' }}>Give your video a catchy title</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f1419', fontSize: '14px' }}>Story / Script *</label>
              <textarea
                name="description"
                placeholder="Describe your video story, characters, plot, and any special details..."
                value={formData.description}
                onChange={handleChange}
                rows="6"
                style={{ width: '100%', padding: '12px', border: '1px solid #e1e8ed', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px', fontFamily: 'monospace', resize: 'vertical' }}
                required
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#657786' }}>Be detailed about characters, setting, and action</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f1419', fontSize: '14px' }}>Video Style</label>
              <select
                name="style"
                value={formData.style}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #e1e8ed', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="realistic">Realistic (Live-action style)</option>
                <option value="cartoon">Cartoon (Animated style)</option>
                <option value="anime">Anime (Japanese animation)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f1419', fontSize: '14px' }}>Video Duration</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #e1e8ed', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="short">Short (1-2 minutes) - $3</option>
                <option value="medium">Medium (3-5 minutes) - $7</option>
                <option value="long">Long (10+ minutes) - $15</option>
              </select>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#657786' }}>Longer videos cost more but have more detail</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '10px',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? '⏳ Generating Video...' : '🎬 Generate Video'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="/dashboard" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
