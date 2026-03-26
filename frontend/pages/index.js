import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>SecureClaw — Deploy AI Agents in 60 Seconds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <meta name="description" content="Deploy Secure AI Agents in 60 Seconds. OpenClaw + SecureClaw - managed, private, and production-ready." />
      </Head>

      <style jsx>{`
        :root {
          --white: #ffffff;
          --off-white: #f8f7ff;
          --blue-deep: #2251cc;
          --blue-mid: #3b6ff0;
          --blue-light: #dde8ff;
          --blue-pale: #eef3ff;
          --pink-light: #fde8f0;
          --pink-mid: #f9c8dc;
          --pink-accent: #e8679a;
          --text-dark: #12132a;
          --text-mid: #4a4d72;
          --text-light: #8589b0;
          --radius: 20px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--white);
          color: var(--text-dark);
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 60px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(221,232,255,0.6);
        }

        .logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--blue-deep);
          letter-spacing: -0.5px;
        }

        .logo span { color: var(--pink-accent); }

        .nav-links { display: flex; gap: 36px; list-style: none; }

        .nav-links a {
          text-decoration: none;
          color: var(--text-mid);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--blue-deep); }

        .nav-cta {
          background: var(--blue-deep);
          color: white !important;
          padding: 10px 22px;
          border-radius: 50px;
          font-weight: 600 !important;
          font-size: 13px !important;
          transition: background 0.2s, transform 0.15s !important;
        }

        .nav-cta:hover {
          background: var(--blue-mid) !important;
          transform: translateY(-1px);
          color: white !important;
        }

        /* HERO */
        .hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px 60px;
          position: relative;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(59,111,240,0.10) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 90%, rgba(249,200,220,0.35) 0%, transparent 60%),
                      radial-gradient(ellipse 40% 40% at 10% 80%, rgba(221,232,255,0.5) 0%, transparent 60%);
          z-index: 0;
        }

        .hero > * { position: relative; z-index: 1; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--pink-light);
          border: 1px solid var(--pink-mid);
          color: var(--pink-accent);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 50px;
          margin-bottom: 28px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          animation: fadeUp 0.6s ease both;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--pink-accent);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(42px, 7vw, 82px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -2px;
          max-width: 800px;
          margin-bottom: 24px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        h1 em { font-style: italic; color: var(--blue-mid); }

        h1 .highlight {
          position: relative;
          display: inline-block;
        }

        h1 .highlight::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--pink-mid), var(--pink-accent));
          border-radius: 4px;
          z-index: -1;
          opacity: 0.6;
        }

        .hero-sub {
          font-size: 18px;
          color: var(--text-mid);
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 44px;
          font-weight: 400;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-primary {
          background: var(--blue-deep);
          color: white;
          padding: 15px 34px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 8px 32px rgba(34,81,204,0.30);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(34,81,204,0.38);
          background: var(--blue-mid);
        }

        .btn-secondary {
          background: var(--white);
          color: var(--text-dark);
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1.5px solid rgba(34,81,204,0.2);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          border-color: var(--blue-mid);
          color: var(--blue-deep);
          transform: translateY(-2px);
        }

        /* POWERED BY */
        .powered-by {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 28px;
          animation: fadeUp 0.6s 0.4s ease both;
          flex-wrap: wrap;
          justify-content: center;
        }

        .powered-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-light);
          letter-spacing: 0.3px;
        }

        .powered-logos {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .power-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 50px;
          padding: 7px 14px 7px 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          box-shadow: 0 2px 12px rgba(34,81,204,0.07);
          transition: all 0.2s;
        }

        .power-badge:hover {
          border-color: var(--blue-mid);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34,81,204,0.13);
        }

        .power-badge-nvidia {
          border-color: rgba(118,185,0,0.3);
        }

        .power-badge-nvidia:hover {
          border-color: #76b900;
          box-shadow: 0 6px 20px rgba(118,185,0,0.15);
        }

        .powered-sep {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-light);
        }

        /* HERO CARD (TERMINAL) */
        .hero-card {
          margin-top: 64px;
          width: 100%;
          max-width: 680px;
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 24px;
          padding: 28px 32px;
          box-shadow: 0 20px 70px rgba(59,111,240,0.12), 0 4px 16px rgba(0,0,0,0.04);
          animation: fadeUp 0.7s 0.4s ease both;
          text-align: left;
        }

        .terminal-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.red { background: #ff6159; }
        .dot.yellow { background: #febc2e; }
        .dot.green { background: #28c840; }

        .terminal-title {
          flex: 1;
          text-align: center;
          font-size: 12px;
          color: var(--text-light);
          font-weight: 500;
        }

        .terminal-body {
          background: #0e1117;
          border-radius: 12px;
          padding: 20px 24px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.8;
        }

        .cmd { color: #7ee787; }
        .comment { color: #6e7681; }
        .output { color: #cdd9e5; }
        .success { color: #56d364; font-weight: 600; }
        .pink-text { color: #f9c8dc; }
        .typing-cursor {
          display: inline-block;
          width: 8px;
          height: 14px;
          background: #7ee787;
          vertical-align: middle;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,100% { opacity:1; }
          50% { opacity:0; }
        }

        /* STATS */
        .stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          padding: 60px 24px;
          background: var(--blue-pale);
          flex-wrap: wrap;
        }

        .stat { text-align: center; }

        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: 44px;
          font-weight: 700;
          color: var(--blue-deep);
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label { font-size: 13px; color: var(--text-mid); font-weight: 500; }

        /* PROBLEMS */
        .section {
          padding: 100px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-tag {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--blue-mid);
          margin-bottom: 14px;
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 18px;
        }

        .section-sub {
          color: var(--text-mid);
          font-size: 16px;
          line-height: 1.7;
          max-width: 480px;
          margin-bottom: 56px;
        }

        .problems-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .problem-card {
          background: var(--pink-light);
          border: 1px solid var(--pink-mid);
          border-radius: var(--radius);
          padding: 28px 30px;
        }

        .problem-icon { font-size: 28px; margin-bottom: 14px; }

        .problem-card h3 {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .problem-card p {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.6;
        }

        /* FEATURES */
        .features-section { padding: 100px 24px; background: var(--off-white); }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }

        .feature-card {
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: var(--radius);
          padding: 32px 28px;
          transition: all 0.25s;
        }

        .feature-card:hover {
          border-color: var(--blue-mid);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(59,111,240,0.12);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 18px;
        }

        .icon-blue { background: var(--blue-pale); }
        .icon-pink { background: var(--pink-light); }

        .feature-card h3 {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--text-dark);
        }

        .feature-card p {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* PRICING */
        .pricing-section {
          padding: 100px 24px;
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
        }

        .price-card {
          background: var(--white);
          border: 1.5px solid var(--blue-light);
          border-radius: 24px;
          padding: 36px 28px;
          transition: all 0.25s;
          text-align: left;
          position: relative;
        }

        .price-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(59,111,240,0.14);
        }

        .price-card.featured {
          background: var(--blue-deep);
          border-color: var(--blue-deep);
          color: white;
        }

        .price-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--pink-accent);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 50px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .plan-name {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 10px;
        }

        .price-card.featured .plan-name {
          color: rgba(255,255,255,0.6);
        }

        .plan-price {
          font-family: 'Fraunces', serif;
          font-size: 46px;
          font-weight: 700;
          letter-spacing: -2px;
          color: var(--text-dark);
          line-height: 1;
          margin-bottom: 4px;
        }

        .price-card.featured .plan-price { color: white; }

        .plan-period {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 24px;
        }

        .price-card.featured .plan-period {
          color: rgba(255,255,255,0.55);
        }

        .plan-features {
          list-style: none;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .plan-features li {
          font-size: 14px;
          color: var(--text-mid);
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .price-card.featured .plan-features li {
          color: rgba(255,255,255,0.8);
        }

        .plan-features li::before {
          content: '✓';
          color: var(--blue-mid);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .price-card.featured .plan-features li::before { color: var(--pink-mid); }

        .btn-plan {
          width: 100%;
          padding: 13px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-align: center;
          text-decoration: none;
          display: block;
        }

        .btn-plan-outline {
          background: transparent;
          border: 1.5px solid var(--blue-light);
          color: var(--blue-deep);
        }

        .btn-plan-outline:hover {
          border-color: var(--blue-mid);
          background: var(--blue-pale);
        }

        .btn-plan-white {
          background: white;
          color: var(--blue-deep);
        }

        .btn-plan-white:hover {
          background: var(--pink-light);
          transform: translateY(-1px);
        }

        /* CTA */
        .cta-section {
          margin: 0 24px 100px;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          background: linear-gradient(135deg, var(--blue-deep) 0%, #1a3fa8 100%);
          border-radius: 32px;
          padding: 80px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 70% at 80% 50%, rgba(249,200,220,0.15) 0%, transparent 60%),
                      radial-gradient(ellipse 40% 50% at 10% 80%, rgba(59,111,240,0.3) 0%, transparent 50%);
        }

        .cta-section > * { position: relative; z-index: 1; }

        .cta-section h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 700;
          color: white;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .cta-section p {
          color: rgba(255,255,255,0.7);
          font-size: 16px;
          margin-bottom: 38px;
          line-height: 1.6;
        }

        .email-form {
          display: flex;
          gap: 12px;
          max-width: 460px;
          margin: 0 auto;
          flex-wrap: wrap;
          justify-content: center;
        }

        .email-input {
          flex: 1;
          min-width: 240px;
          padding: 14px 20px;
          border-radius: 50px;
          border: none;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          background: rgba(255,255,255,0.95);
          color: var(--text-dark);
        }

        .email-input::placeholder { color: var(--text-light); }

        .btn-cta {
          background: var(--pink-accent);
          color: white;
          padding: 14px 28px;
          border-radius: 50px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-cta:hover {
          background: #d5528a;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232,103,154,0.4);
        }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--blue-light);
          padding: 40px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-logo {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--blue-deep);
        }

        .footer-logo span { color: var(--pink-accent); }
        footer p { font-size: 13px; color: var(--text-light); }
        .footer-links { display: flex; gap: 28px; list-style: none; }
        .footer-links a { font-size: 13px; color: var(--text-light); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--blue-deep); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .problems-grid, .features-grid, .pricing-grid { grid-template-columns: 1fr; }
          .stats { gap: 32px; }
          .cta-section { padding: 50px 28px; margin: 0 16px 60px; }
          footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <script jsx>{`
        // Scroll reveal - will run on client
        if (typeof window !== 'undefined') {
          window.addEventListener('load', () => {
            const reveals = document.querySelectorAll('.reveal');
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(e => {
                if (e.isIntersecting) {
                  e.target.classList.add('visible');
                }
              });
            }, { threshold: 0.12 });
            reveals.forEach(r => observer.observe(r));
          });
        }
      `}</script>

      {/* NAV */}
      <nav>
        <div className="logo">Secure<span>Claw</span></div>
        <ul className="nav-links">
          <li><Link href="#features">Features</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="#docs">Docs</Link></li>
          <li><Link href="#blog">Blog</Link></li>
          <li><Link href="/pricing" className="nav-cta">Purchase Now</Link></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="badge">
          <span className="badge-dot"></span>
          Now in Beta — Join 500+ builders
        </div>
        <h1>Deploy <em>Secure</em> AI Agents<br/>in <span className="highlight">60 Seconds</span></h1>
        <p className="hero-sub">
          OpenClaw + SecureClaw — managed, private, and production-ready.
          No server config. No privacy leaks. Just deploy.
        </p>
        <div className="hero-actions">
          <Link href="/pricing" className="btn-primary">🚀 Purchase Now</Link>
          <a href="#" className="btn-secondary">▶ Watch Demo</a>
        </div>

        {/* POWERED BY LOGOS */}
        <div className="powered-by">
          <span className="powered-label">Powered by</span>
          <div className="powered-logos">
            {/* OpenClaw Logo */}
            <div className="power-badge">
              <span>🦞</span>
              <span>OpenClaw</span>
            </div>
            <div className="powered-sep">+</div>
            {/* NVIDIA Logo styled */}
            <div className="power-badge power-badge-nvidia">
              <span>NVIDIA NemoClaw</span>
            </div>
          </div>
        </div>

        {/* TERMINAL DEMO */}
        <div className="hero-card">
          <div className="terminal-bar">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="terminal-title">secureclaw — deploy agent</span>
          </div>
          <div className="terminal-body">
            <div><span className="comment"># Without SecureClaw: 4 hours of setup hell</span></div>
            <div style={{marginTop: '10px'}}><span className="cmd">$</span> <span className="output">git clone openclaw && cd openclaw && pip install...</span></div>
            <div><span className="output" style={{color: '#e05252'}}>ERROR: dependency conflict in nvidia-cuda-toolkit...</span></div>
            <div style={{marginTop: '14px'}}><span className="comment"># With SecureClaw: 60 seconds ✨</span></div>
            <div style={{marginTop: '8px'}}><span className="cmd">$</span> <span className="output"> curl -s deploy.secureclaw.com | bash</span></div>
            <div><span className="pink-text">▸ Pulling SecureClaw image... <span style={{color: '#56d364'}}>done</span></span></div>
            <div><span className="pink-text">▸ Configuring privacy layer... <span style={{color: '#56d364'}}>done</span></span></div>
            <div><span className="pink-text">▸ Launching your agent... <span style={{color: '#56d364'}}>done</span></span></div>
            <div style={{marginTop: '8px'}}><span className="success">✓ Agent live at agent-x7k2.secureclaw.com</span> <span className="typing-cursor"></span></div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats">
        <div className="stat reveal">
          <div className="stat-num">60s</div>
          <div className="stat-label">Average deploy time</div>
        </div>
        <div className="stat reveal">
          <div className="stat-num">100%</div>
          <div className="stat-label">Data privacy guaranteed</div>
        </div>
        <div className="stat reveal">
          <div className="stat-num">500+</div>
          <div className="stat-label">Agents deployed</div>
        </div>
        <div className="stat reveal">
          <div className="stat-num">99.9%</div>
          <div className="stat-label">Uptime SLA</div>
        </div>
      </div>

      {/* PROBLEMS */}
      <section className="section">
        <div className="section-tag reveal">The Problem</div>
        <h2 className="section-title reveal">OpenClaw is powerful.<br/>But also painful.</h2>
        <p className="section-sub reveal">50% of users never get past installation. The other 50% worry about data leaks. We fix both.</p>
        <div className="problems-grid">
          <div className="problem-card reveal">
            <div className="problem-icon">😤</div>
            <h3>Installation Nightmare</h3>
            <p>Dependency conflicts, CUDA errors, Python versioning — most users give up within the first hour of setup.</p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-icon">🔓</div>
            <h3>Privacy Leaks</h3>
            <p>Default OpenClaw sends data to external APIs without consent. Your business data, your users' data — exposed.</p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-icon">🔧</div>
            <h3>No Monitoring</h3>
            <p>Once deployed, agents run blind. No logs, no alerts, no way to know if your agent is failing silently.</p>
          </div>
          <div className="problem-card reveal">
            <div className="problem-icon">💸</div>
            <h3>DevOps Cost</h3>
            <p>You need a full DevOps engineer just to maintain infrastructure. That's ₹60,000/month you don't need to spend.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-inner">
          <div className="section-tag reveal">The Solution</div>
          <h2 className="section-title reveal">Everything you need.<br/>Nothing you don't.</h2>
          <p className="section-sub reveal">SecureClaw wraps OpenClaw's power with NVIDIA's NemoClaw security layer — delivered as a fully managed cloud.</p>
          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon icon-blue">⚡</div>
              <h3>1-Minute Deploy</h3>
              <p>Click a button. Your agent is live on a custom subdomain. No server knowledge required whatsoever.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon icon-pink">🛡️</div>
              <h3>NemoClaw Security</h3>
              <p>NVIDIA's governance layer runs between your agent and the internet. Full data isolation.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon icon-blue">🔒</div>
              <h3>Zero Data Leaks</h3>
              <p>Privacy router controls what goes where. Local Nemotron models available for 100% on-premise inference.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon icon-pink">📊</div>
              <h3>Live Dashboard</h3>
              <p>Monitor agents, view logs, track usage, manage API keys — all from a clean, intuitive interface.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon icon-blue">🇮🇳</div>
              <h3>₹999 for 24 Hours</h3>
              <p>Pay once. Get 24 hours access. 1 agent included. No monthly commitment. Restart anytime.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon icon-pink">🔄</div>
              <h3>Auto Scaling</h3>
              <p>Your agent scales with your traffic. No manual intervention. Handles 10 or 10,000 requests equally well.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - SINGLE ₹999 PLAN */}
      <section className="pricing-section">
        <div className="section-tag reveal">Pricing</div>
        <h2 className="section-title reveal">One simple price.</h2>
        <p className="section-sub reveal" style={{margin: '0 auto 0', textAlign: 'center'}}>Purchase once. Activate for 24 hours. Deploy up to 1 AI agent. No monthly commitment.</p>
        <div className="pricing-grid" style={{gridTemplateColumns: '1fr', maxWidth: '600px', margin: '60px auto 0'}}>
          <div className="price-card featured reveal">
            <div className="plan-name">1-Day Trial</div>
            <div className="plan-price">₹999</div>
            <div className="plan-period">for 1 day (24 hours)</div>
            <ul className="plan-features">
              <li>1 AI Agent deployment</li>
              <li>All AI models (Claude 3.5, GPT-4o, Gemini)</li>
              <li>Custom subdomain</li>
              <li>512MB memory per agent</li>
              <li>Full privacy protection</li>
              <li>No monthly commitment</li>
              <li>Pay via UPI, Card, Netbanking</li>
            </ul>
            <Link href="/pricing" className="btn-plan btn-plan-white">
              Purchase Now - ₹999
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <div className="cta-bg"></div>
        <h2>Your AI agent deserves<br/>a better home.</h2>
        <p>Join 500+ builders already deploying with SecureClaw.<br/>Purchase once, activate for 24 hours.</p>
        <div className="email-form">
          <input type="email" className="email-input" placeholder="Enter your email address" />
          <button className="btn-cta">Purchase Now →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Secure<span>Claw</span></div>
        <p>© 2026 SecureClaw. Built by WorkChain.</p>
        <ul className="footer-links">
          <li><a href="#privacy">Privacy</a></li>
          <li><a href="#terms">Terms</a></li>
          <li><a href="#docs">Docs</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </footer>
    </>
  )
}