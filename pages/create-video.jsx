import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateVideo() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: 'realistic',
    duration: 'short',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Credit costs for each duration
  const CREDIT_COSTS = {
    short: 1,
    medium: 3,
    long: 8,
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    fetchUser(storedToken);
  }, [router]);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if user has enough credits
    const creditCost = CREDIT_COSTS[formData.duration];
    if (!user || user.credits < creditCost) {
      setLoading(false);
      setError(`Insufficient credits. You need ${creditCost} credits but only have ${user?.credits || 0}. Buy more credits to continue.`);
      setShowPricingModal(true);
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch('/api/videos/generate-with-replicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create video');
        return;
      }

      setSuccess(`✅ Video generation started! This may take 2-5 minutes. Credits remaining: ${data.creditsRemaining}`);
      setFormData({ title: '', description: '', style: 'realistic', duration: 'short' });

      // Refresh user credits
      setTimeout(() => {
        fetchUser(authToken);
      }, 1000);

      setTimeout(() => router.push(`/dashboard?videoId=${data.videoId}`), 3000);
    } catch (err) {
      setError('Error creating video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (plan) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        setError('Failed to initiate checkout');
      }
    } catch (err) {
      setError('Error processing payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e1e8ed', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: '0', fontSize: '28px', color: '#0f1419' }}>Create New Video</h1>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={async () => {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/user/add-credits', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ credits: 50 }),
                });
                if (res.ok) {
                  window.location.reload();
                }
              }}
              style={{
                padding: '8px 15px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
              }}
            >
              + 50 Credits (Test)
            </button>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
              💰 Credits: <span style={{ fontSize: '24px' }}>{user.credits}</span>
            </div>
          </div>
        )}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f1419', fontSize: '14px