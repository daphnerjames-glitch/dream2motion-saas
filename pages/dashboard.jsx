import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    fetchVideos();
  }, [router]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/videos/list', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);

        // Poll for status updates on processing videos
        const processingVideos = (data.videos || []).filter(
          v => v.status === 'generating' || v.status === 'processing'
        );

        if (processingVideos.length > 0) {
          processingVideos.forEach(video => {
            pollVideoStatus(video._id, token);
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollVideoStatus = async (videoId, authToken) => {
    try {
      const res = await fetch(`/api/videos/status?videoId=${videoId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (res.ok) {
        const data = await res.json();

        // Update the video in our state
        setVideos(prev =>
          prev.map(v =>
            v._id === videoId
              ? { ...v, status: data.status, videoUrl: data.videoUrl || v.videoUrl }
              : v
          )
        );

        // Continue polling if still generating
        if (data.status === 'generating') {
          setTimeout(() => pollVideoStatus(videoId, authToken), 10000); // Poll every 10 seconds
        }
      }
    } catch (err) {
      console.error('Failed to poll video status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const stats = {
    total: videos.length,
    completed: videos.filter(v => v.status === 'completed').length,
    processing: videos.filter(v => v.status === 'processing').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e1e8ed', padding: '20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#0f1419' }}>Dream2Motion Studio</h1>
            <p style={{ margin: '0', color: '#657786', fontSize: '14px' }}>Welcome back, {user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <a href="/create-video" style={{ padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎬</div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Create New Video</h2>
            <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>Generate your next AI video</p>
          </a>

          <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e8ed' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f1419' }}>Total Videos</h2>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{stats.total}</p>
          </div>

          <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e8ed' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f1419' }}>Completed</h2>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{stats.completed}</p>
          </div>

          <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e8ed' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f1419' }}>Processing</h2>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{stats.processing}</p>
          </div>
        </div>

        {/* Videos Section */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e1e8ed', padding: '30px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#0f1419' }}>Your Videos</h2>

          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#657786' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎥</div>
              <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>No videos yet</p>
              <p style={{ margin: '0', fontSize: '14px' }}>Create your first AI video to get started</p>
              <a href="/create-video" style={{ display: 'inline-block', marginTop: '15px', padding: '10px 25px', background: '#667eea', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Create Video</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {videos.map((video) => (
                <a
                  key={video._id}
                  href={video.status === 'completed' && video.videoUrl ? video.videoUrl : '#'}
                  target={video.status === 'completed' && video.videoUrl ? '_blank' : ''}
                  rel={video.status === 'completed' && video.videoUrl ? 'noopener noreferrer' : ''}
                  style={{
                    border: '1px solid #e1e8ed',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f9fafb',
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: video.status === 'completed' && video.videoUrl ? 'pointer' : 'default',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => {
                    if (video.status === 'completed' && video.videoUrl) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    background: '#e1e8ed',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#657786',
                    fontSize: '40px',
                    position: 'relative',
                  }}>
                    {video.status === 'generating' ? '⏳' : video.status === 'completed' ? '✅' : video.status === 'error' ? '❌' : '🎬'}
                    {video.status === 'generating' && (
                      <div style={{
                        position: 'absolute',
                        fontSize: '12px',
                        bottom: '8px',
                        color: '#657786',
                      }}>
                        Generating...
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f1419' }}>{video.title}</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#657786' }}>{video.duration || 'short'} • {video.style || 'Realistic'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: video.status === 'completed' ? '#d4edda' : video.status === 'generating' || video.status === 'processing' ? '#fff3cd' : '#f8d7da',
                        color: video.status === 'completed' ? '#155724' : video.status === 'generating' || video.status === 'processing' ? '#856404' : '#721c24',
                      }}>
                        {video.status === 'generating' ? 'Generating...' : video.status === 'completed' ? 'Ready' : video.status}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e1e8ed', display: 'flex', gap: '20px', fontSize: '14px', color: '#657786' }}>
          <a href="/granny" style={{ color: '#667eea', textDecoration: 'none' }}>Granny Episodes</a>
          <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>Back to Home</a>
        </div>
      </div>
    </div>
  );
}
