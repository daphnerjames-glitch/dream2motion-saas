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
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
            💰 Credits: <span style={{ fontSize: '24px' }}>{user.credits}</span>
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
                <option value="short">Short (1-2 minutes) - 1 credit</option>
                <option value="medium">Medium (3-5 minutes) - 3 credits</option>
                <option value="long">Long (10+ minutes) - 8 credits</option>
              </select>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#657786' }}>
                Cost: {CREDIT_COSTS[formData.duration]} credit{CREDIT_COSTS[formData.duration] > 1 ? 's' : ''} • You have: {user?.credits || 0}
              </p>
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

      {/* Pricing Modal */}
      {showPricingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '900px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: '0', fontSize: '24px', color: '#0f1419' }}>Buy Credits</h2>
              <button
                onClick={() => setShowPricingModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#657786',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}>
              {/* Starter */}
              <div style={{
                border: '1px solid #e1e8ed',
                borderRadius: '8px',
                padding: '25px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f1419' }}>Starter</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>$9</p>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#657786' }}>5 videos per month</p>
                <button
                  onClick={() => handleBuyCredits('starter')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>

              {/* Pro */}
              <div style={{
                border: '2px solid #667eea',
                borderRadius: '8px',
                padding: '25px',
                textAlign: 'center',
                backgroundColor: '#f0f4ff',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#667eea',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  POPULAR
                </span>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f1419' }}>Pro</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>$29</p>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#657786' }}>20 videos per month</p>
                <button
                  onClick={() => handleBuyCredits('pro')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>

              {/* Studio */}
              <div style={{
                border: '1px solid #e1e8ed',
                borderRadius: '8px',
                padding: '25px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f1419' }}>Studio</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>$79</p>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#657786' }}>Unlimited videos per month</p>
                <button
                  onClick={() => handleBuyCredits('studio')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>

            <p style={{ margin: '0', fontSize: '12px', color: '#657786', textAlign: 'center' }}>
              You'll be redirected to secure Stripe checkout. All subscriptions renew monthly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
