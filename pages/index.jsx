import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleChoosePlan = () => {
    if (isLoggedIn) {
      router.push('/create-video');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dream2Motion.ai</h1>
        <p>Turn your story into motion</p>
      </header>

      <nav className={styles.nav}>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </nav>

      <section className={styles.hero}>
        <h2>Create AI Videos in Minutes</h2>
        <p>Generate professional videos for your YouTube channel with AI</p>
        <Link href={isLoggedIn ? "/create-video" : "/signup"} className={styles.cta}>Get Started Free</Link>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>AI Video Generation</h3>
          <p>Generate short video clips using advanced AI (Replicate)</p>
        </div>
        <div className={styles.feature}>
          <h3>Auto Music & Effects</h3>
          <p>Add AI-generated music and sound effects automatically</p>
        </div>
        <div className={styles.feature}>
          <h3>YouTube Auto-Post</h3>
          <p>Post finished videos directly to your YouTube channel</p>
        </div>
        <div className={styles.feature}>
          <h3>Multiple Channels</h3>
          <p>Support for realistic, cartoon, and custom video styles</p>
        </div>
      </section>

      <section className={styles.pricing}>
        <h2>Pricing</h2>

        <div className={styles.plans}>
          <div className={styles.plan}>
            <h3>Starter</h3>
            <p className={styles.price}>$9/month</p>
            <ul>
              <li>5 videos/month</li>
              <li>Up to 2 minutes each</li>
              <li>Auto-post to YouTube</li>
            </ul>
            <button onClick={handleChoosePlan} style={{ cursor: 'pointer', padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>Choose Plan</button>
          </div>

          <div className={styles.plan}>
            <h3>Pro</h3>
            <p className={styles.price}>$29/month</p>
            <ul>
              <li>20 videos/month</li>
              <li>Up to 5 minutes each</li>
              <li>Auto-post to YouTube</li>
              <li>Priority support</li>
            </ul>
            <button onClick={handleChoosePlan} style={{ cursor: 'pointer', padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>Choose Plan</button>
          </div>

          <div className={styles.plan}>
            <h3>Studio</h3>
            <p className={styles.price}>$79/month</p>
            <ul>
              <li>Unlimited videos</li>
              <li>Up to 30 minutes each</li>
              <li>Auto-post to YouTube</li>
              <li>Priority support</li>
              <li>Custom branding</li>
            </ul>
            <button onClick={handleChoosePlan} style={{ cursor: 'pointer', padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>Choose Plan</button>
          </div>
        </div>

        <p className={styles.payAsYouGo}>Or pay per video: $3 (short) · $7 (medium) · $15 (long)</p>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 Dream2Motion.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
