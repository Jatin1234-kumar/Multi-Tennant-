import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 8, 100);
        return next;
      });
    }, 45);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <main className="hero is-ready">
        <section className="hero-inner fade-up-target">
          <h1 className="headline">BUILD SHARP. SHIP FAST.</h1>
          <p className="subtitle">A multi-tenant SaaS architecture using React + Node.js + Express with Neon PostgreSQL.</p>
          <div className="cta-row">
            <button type="button" onClick={() => navigate('/auth/login')}>ENTER APP</button>
          </div>
        </section>
      </main>
    </>
  );
}
