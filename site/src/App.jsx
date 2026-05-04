import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

// ─── EmailJS Config ──────────────────────────────────────────────────────────
// 1. Sign up free at https://www.emailjs.com
// 2. Add an Email Service (Gmail, Outlook, etc.) → copy the Service ID
// 3. Create an Email Template → set "To Email" to marketing@engineerflow.com → copy Template ID
//    Recommended template variables: {{from_name}}, {{from_email}}, {{phone}}, {{service}}, {{message}}
// 4. Go to Account → API Keys → copy your Public Key
// Then replace the three values below:
const EJ_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_abc123"
const EJ_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xyz789"
const EJ_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // e.g. "abcDEFghiJKL"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --blue: #007BFF;
    --dark: #003A70;
    --darker: #002550;
    --light-blue: #E8F3FF;
    --white: #ffffff;
    --gray: #F4F7FB;
    --text: #1a1a2e;
    --text-soft: #5a6a85;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--white); overflow-x: hidden; }

  /* NAV */
  .ef-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 6%;
    height: 56px;
    background: rgba(0,26,64,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,123,255,0.15);
    transition: all 0.3s;
  }
  .ef-nav.scrolled {
    padding: 8px 6%;
    background: rgba(0,26,64,0.98);
    height: 56px;
  }
  .nav-logo { display: flex; align-items: center; gap: 12px; }
  .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--white); letter-spacing: 0.02em; }
  .nav-logo-text span { color: var(--blue); }
  .nav-logo img { height: 100px; width: auto; display: block; }
  .nav-links { display: flex; gap: 36px; list-style: none; align-items: center; }
  .nav-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; z-index: 1001; }
  .nav-hamburger span { display: block; width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }
  .nav-hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .nav-hamburger.active span:nth-child(2) { opacity: 0; }
  .nav-hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  .nav-links.mobile-open { display: flex !important; position: fixed; top: 56px; left: 0; right: 0; bottom: 0; background: rgba(0,26,64,0.98); backdrop-filter: blur(20px); flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 40px; gap: 0; z-index: 998; animation: slideDown 0.3s ease; }
  .nav-links.mobile-open li { width: 100%; text-align: center; }
  .nav-links.mobile-open a { display: block; padding: 16px 0; font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .nav-links.mobile-open .nav-cta { margin-top: 16px; display: inline-block !important; width: auto; padding: 12px 32px; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .nav-links a { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; font-weight: 500; letter-spacing: 0.04em; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--blue); }
  .nav-cta { background: var(--blue); color: var(--white) !important; padding: 10px 24px; border-radius: 6px; transition: background 0.2s, transform 0.2s !important; }
  .nav-cta:hover { background: #0066dd !important; transform: translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 55%, #004a90 100%);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    position: relative; overflow: hidden;
    padding: 100px 6% 60px;
    gap: 60px;
  }
  .hero-bg-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(0,123,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,123,255,0.06) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .hero-blob {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
    animation: blobPulse 6s ease-in-out infinite alternate;
  }
  .hero-blob-1 { width: 400px; height: 400px; background: rgba(0,123,255,0.15); top: -80px; left: 30%; }
  .hero-blob-2 { width: 300px; height: 300px; background: rgba(0,58,112,0.4); bottom: 0; left: 5%; animation-delay: -3s; }
  @keyframes blobPulse { from { transform: scale(1); } to { transform: scale(1.12) translate(15px, -15px); } }
  .hero-content { position: relative; z-index: 2; animation: fadeUp 0.9s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(0,123,255,0.2); border: 1px solid rgba(0,123,255,0.4);
    color: #7cc8ff; font-size: 0.78rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 6px 16px; border-radius: 100px; margin-bottom: 28px;
  }
  .hero-badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #7cc8ff; animation: ping 1.5s ease-in-out infinite; }
  @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } }
  .hero h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.8rem, 4.5vw, 4.8rem); font-weight: 800; line-height: 1.05; color: var(--white); margin-bottom: 20px; }
  .hero h1 em { font-style: normal; color: var(--blue); }
  .hero p { font-size: 1.05rem; line-height: 1.75; color: rgba(255,255,255,0.7); margin-bottom: 40px; max-width: 480px; }
  .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
  .btn-primary { background: var(--blue); color: var(--white); text-decoration: none; padding: 15px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 10px; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,123,255,0.4); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,123,255,0.5); background: #0069e0; }
  .btn-secondary { background: transparent; color: var(--white); text-decoration: none; padding: 15px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 10px; border: 2px solid rgba(255,255,255,0.3); transition: all 0.25s; }
  .btn-secondary:hover { border-color: var(--blue); color: var(--blue); }
  .hero-stats { display: flex; gap: 40px; margin-top: 52px; padding-top: 36px; border-top: 1px solid rgba(255,255,255,0.1); animation: fadeUp 0.9s 0.3s ease both; }
  .hero-stat strong { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 2.2rem; font-weight: 800; color: var(--white); }
  .hero-stat span { font-size: 0.8rem; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; text-transform: uppercase; }

  /* HERO IMAGE PANEL */
  .hero-img-panel { position: relative; z-index: 2; animation: fadeUp 0.9s 0.2s ease both; height: 580px; }
  .hero-img-main { width: 100%; height: 100%; object-fit: cover; border-radius: 24px; display: block; visibility: visible; opacity: 1; }
  .hero-img-overlay { position: absolute; inset: 0; border-radius: 24px 0 0 24px; background: linear-gradient(to top, rgba(0,37,80,0.6) 0%, transparent 50%); }
  .hero-badge-card {
    position: absolute; bottom: 28px; left: 24px; right: 24px;
    background: rgba(255,255,255,0.12); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .hbc-left { display: flex; align-items: center; gap: 14px; }
  .hbc-dot { width: 44px; height: 44px; border-radius: 50%; background: var(--blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hbc-label { font-size: 0.78rem; color: rgba(255,255,255,0.6); }
  .hbc-value { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; color: white; }
  .hbc-right { text-align: right; }
  .hbc-status { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600; color: #4ADE80; }
  .hbc-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; animation: ping 1.5s infinite; }
  .hero-rating-chip { position: absolute; top: 24px; right: 24px; background: white; border-radius: 12px; padding: 12px 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-align: center; }
  .rating-stars { color: #FFB800; font-size: 0.8rem; letter-spacing: 2px; }
  .rating-num { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--dark); line-height: 1; }
  .rating-label { font-size: 0.7rem; color: var(--text-soft); }

  /* TRUST BAR */
  .trust-bar { background: var(--gray); padding: 22px 6%; display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap; border-bottom: 1px solid #e0e8f4; }
  .trust-item { display: flex; align-items: center; gap: 10px; font-size: 0.87rem; font-weight: 600; color: var(--dark); }
  .trust-icon-wrap { width: 32px; height: 32px; border-radius: 8px; background: var(--light-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* SECTIONS */
  section { padding: 100px 6%; }
  .section-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-bottom: 12px; }
  .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.1; color: var(--text); margin-bottom: 18px; }
  .section-sub { font-size: 1rem; color: var(--text-soft); line-height: 1.7; max-width: 560px; }
  .section-header { margin-bottom: 60px; }
  .section-header.centered { text-align: center; }
  .section-header.centered .section-sub { margin: 0 auto; }

  /* SERVICES */
  .services { background: var(--white); }
  .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .service-card { background: var(--white); border: 1.5px solid #e0eaf8; border-radius: 16px; padding: 36px 30px; transition: all 0.3s; position: relative; overflow: hidden; }
  .service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--blue), var(--dark)); transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
  .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,58,112,0.1); border-color: var(--blue); }
  .service-card:hover::before { transform: scaleX(1); }
  .service-icon-wrap { width: 52px; height: 52px; border-radius: 12px; background: var(--light-blue); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; transition: background 0.3s; }
  .service-card:hover .service-icon-wrap { background: var(--blue); }
  .service-card:hover .service-icon-wrap svg { stroke: white; }
  .service-card h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.35rem; font-weight: 700; margin-bottom: 10px; color: var(--dark); }
  .service-card p { font-size: 0.92rem; color: var(--text-soft); line-height: 1.65; }
  .service-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; font-size: 0.88rem; font-weight: 600; color: var(--blue); text-decoration: none; transition: gap 0.2s; }
  .service-link:hover { gap: 10px; }

  /* HOW IT WORKS */
  .how { background: var(--darker); padding: 100px 6%; position: relative; overflow: hidden; }
  .how::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(0,123,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,123,255,0.04) 1px, transparent 1px); background-size: 50px 50px; }
  .how .section-title { color: var(--white); }
  .how .section-tag { color: #7cc8ff; }
  .how .section-sub { color: rgba(255,255,255,0.6); }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); position: relative; z-index: 2; }
  .step { padding: 40px 32px; border-right: 1px solid rgba(255,255,255,0.07); }
  .step:last-child { border-right: none; }
  .step-num { font-family: 'Barlow Condensed', sans-serif; font-size: 5rem; font-weight: 800; color: rgba(0,123,255,0.12); line-height: 1; margin-bottom: -10px; }
  .step-icon-wrap { width: 52px; height: 52px; border-radius: 12px; background: rgba(0,123,255,0.18); border: 1px solid rgba(0,123,255,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
  .step h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--white); margin-bottom: 10px; }
  .step p { font-size: 0.88rem; color: rgba(255,255,255,0.5); line-height: 1.6; }

  /* WHY US */
  .why { background: var(--gray); }
  .why-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
  .why-images { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-self: center; }
  .why-img-main { grid-column: 1 / -1; border-radius: 18px; overflow: hidden; height: 260px; }
  .why-img-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .why-img-small { border-radius: 14px; overflow: hidden; height: 180px; }
  .why-img-small img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .why-feats { display: flex; flex-direction: column; gap: 16px; }
  .why-feat { display: flex; gap: 16px; align-items: flex-start; padding: 22px; background: var(--white); border-radius: 14px; border: 1px solid #e0eaf8; transition: border-color 0.2s, box-shadow 0.2s; }
  .why-feat:hover { border-color: var(--blue); box-shadow: 0 8px 30px rgba(0,123,255,0.08); }
  .why-feat-icon { width: 44px; height: 44px; flex-shrink: 0; border-radius: 10px; background: var(--light-blue); display: flex; align-items: center; justify-content: center; }
  .why-feat h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
  .why-feat p { font-size: 0.87rem; color: var(--text-soft); line-height: 1.6; }

  /* COVERAGE */
  .coverage { background: var(--white); }
  .coverage-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .coverage-img { border-radius: 20px; overflow: hidden; height: 480px; position: relative; }
  .coverage-img img { width: 100%; height: 100%; object-fit: cover; }
  .coverage-cities { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 28px; }
  .city-tag { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--gray); border-radius: 8px; font-size: 0.87rem; font-weight: 500; color: var(--dark); }
  .city-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }

  /* TESTIMONIALS */
  .testimonials { background: var(--dark); padding: 100px 6%; }
  .testimonials .section-title { color: var(--white); }
  .testimonials .section-tag { color: #7cc8ff; }
  .testimonials .section-sub { color: rgba(255,255,255,0.6); }
  .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
  .review-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; transition: all 0.3s; }
  .review-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(0,123,255,0.3); }
  .stars { color: #FFB800; font-size: 0.9rem; margin-bottom: 16px; letter-spacing: 3px; }
  .review-text { font-size: 0.93rem; color: rgba(255,255,255,0.78); line-height: 1.75; margin-bottom: 24px; font-style: italic; }
  .review-author { display: flex; align-items: center; gap: 12px; }
  .review-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), var(--dark)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 0.88rem; flex-shrink: 0; }
  .review-avatar-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2); }
  .review-avatar-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2); }
  .review-name { font-weight: 600; color: var(--white); font-size: 0.92rem; }
  .review-loc { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

  /* CTA */
  .cta-section { background: linear-gradient(135deg, var(--blue) 0%, var(--darker) 100%); padding: 100px 6%; text-align: center; position: relative; overflow: hidden; }
  .cta-section::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 60% 50%, rgba(255,255,255,0.07) 0%, transparent 60%); }
  .cta-section h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800; color: var(--white); margin-bottom: 16px; position: relative; }
  .cta-section p { font-size: 1.1rem; color: rgba(255,255,255,0.75); margin-bottom: 40px; position: relative; }
  .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
  .btn-white { background: var(--white); color: var(--dark); text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 700; font-size: 1rem; display: inline-flex; align-items: center; gap: 10px; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  .btn-outline-white { background: transparent; color: var(--white); text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 1rem; border: 2px solid rgba(255,255,255,0.5); display: inline-flex; align-items: center; gap: 10px; transition: all 0.25s; }
  .btn-outline-white:hover { border-color: white; background: rgba(255,255,255,0.1); }

  /* FOOTER */
  footer { background: #001530; padding: 70px 6% 32px; color: rgba(255,255,255,0.6); }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
  .footer-brand p { font-size: 0.9rem; line-height: 1.7; margin-top: 16px; max-width: 280px; }
  .footer-logo { display: flex; align-items: center; gap: 10px; }
  .footer-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 700; color: white; }
  .footer-logo-text span { color: var(--blue); }
  .footer-logo img { height: 100px; width: auto; display: block; }
  .footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 700; color: white; margin-bottom: 20px; letter-spacing: 0.08em; text-transform: uppercase; }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.87rem; transition: color 0.2s; }
  .footer-col a:hover { color: var(--blue); }
  .footer-bottom { padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.82rem; text-align: center; }
  .footer-bottom-links { display: flex; gap: 24px; }
  .footer-bottom-links a { color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s; }
  .footer-bottom-links a:hover { color: var(--blue); }
  .gas-safe { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,123,255,0.15); border: 1px solid rgba(0,123,255,0.3); padding: 8px 16px; border-radius: 8px; color: #7cc8ff; font-size: 0.8rem; font-weight: 600; margin-top: 20px; }

  /* PHONE FLOAT */
  .phone-bar { position: fixed; bottom: 28px; right: 28px; z-index: 999; }
  .phone-btn { display: flex; align-items: center; gap: 12px; background: var(--blue); color: white; padding: 14px 24px; border-radius: 50px; text-decoration: none; font-weight: 600; box-shadow: 0 8px 30px rgba(0,123,255,0.45); transition: all 0.25s; animation: slideInRight 0.8s 1s ease both; }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
  .phone-btn:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(0,123,255,0.55); }

  /* CONTACT */
  .contact { background: var(--gray); }
  .contact-inner { display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: start; }

  .contact-info { display: flex; flex-direction: column; gap: 0; align-items: flex-start; }
  .contact-info-card {
    display: flex; gap: 18px; align-items: flex-start;
    padding: 24px 0; border-bottom: 1px solid #e0eaf8;
    text-align: left;
    width: 100%;
  }
  .contact-info-card:last-child { border-bottom: none; }
  .ci-icon { width: 48px; height: 48px; flex-shrink: 0; border-radius: 12px; background: var(--light-blue); display: flex; align-items: center; justify-content: center; }
  .ci-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-soft); margin-bottom: 4px; text-align: left; }
  .ci-value { font-size: 1rem; font-weight: 600; color: var(--dark); text-align: left; }
  .ci-value a { color: var(--dark); text-decoration: none; transition: color 0.2s; }
  .ci-value a:hover { color: var(--blue); }

  /* FORM */
  .contact-form-wrap {
    background: var(--white); border-radius: 20px;
    padding: 44px 40px;
    border: 1.5px solid #e0eaf8;
    box-shadow: 0 8px 40px rgba(0,58,112,0.06);
  }
  .form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.7rem; font-weight: 800; color: var(--dark); margin-bottom: 6px; }
  .form-subtitle { font-size: 0.9rem; color: var(--text-soft); margin-bottom: 28px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
  .form-group label { font-size: 0.82rem; font-weight: 600; color: var(--dark); letter-spacing: 0.03em; }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 12px 16px;
    border: 1.5px solid #d8e4f4;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.93rem;
    color: var(--text);
    background: var(--white);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    width: 100%;
  }
  .form-group input::placeholder,
  .form-group textarea::placeholder { color: #b0bdd0; }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
  .form-group textarea { resize: vertical; min-height: 120px; }
  .form-group select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6a85' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

  .form-submit { width: 100%; padding: 15px; border: none; border-radius: 10px; background: var(--blue); color: white; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.25s; box-shadow: 0 4px 18px rgba(0,123,255,0.35); margin-top: 8px; }
  .form-submit:hover { background: #0069e0; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,123,255,0.45); }
  .form-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .form-success {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; text-align: center; padding: 48px 0;
  }
  .form-success-icon { width: 64px; height: 64px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; }
  .form-success h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--dark); }
  .form-success p { font-size: 0.93rem; color: var(--text-soft); max-width: 300px; }

  @media (max-width: 960px) {
    .contact-inner { grid-template-columns: 1fr; gap: 40px; }
    .form-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .contact-form-wrap { padding: 28px 20px; }
  }

  /* RESPONSIVE */
  @media (max-width: 960px) {
    .hero { grid-template-columns: 1fr; }
    .hero-img-panel { display: block; height: 300px; margin-top: 40px; }
    .why-inner, .coverage-inner { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .ef-nav .nav-links { display: none; }
    .nav-hamburger { display: flex !important; }
  }
  @media (max-width: 600px) {
    section { padding: 60px 5%; }
    .hero { padding: 90px 0 50px 0; }
    .hero-content { padding-left: 5%; padding-right: 5%; }
    .footer-grid { grid-template-columns: 1fr; }
    .hero-stats { gap: 24px; flex-wrap: wrap; }
    .why-images { grid-template-columns: 1fr; }
    .why-img-main { grid-column: 1; }
    .ef-nav { height: 56px; padding: 6px 5%; }
    .nav-logo img { height: 65px !important; }
    .nav-links.mobile-open { top: 56px; }
  }
`;

// ─── SVG Icons (reusable) ───────────────────────────────────────────────────

const IconArrow = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPhone = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.47 2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="2" />
  </svg>
);

const IconShield = ({ color = "#007BFF", size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconStar = ({ color = "#007BFF", size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconClock = ({ color = "#007BFF", size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconCheck = ({ color = "#007BFF", size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCalendar = ({ color = "#007BFF", size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Smooth Scroll Helper ───────────────────────────────────────────────────

function scrollTo(id) {
  const el = document.querySelector(id);
  if (!el) return;
  const navH = document.getElementById("ef-navbar")?.offsetHeight ?? 72;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - navH - 20, behavior: "smooth" });
}

function NavLink({ href, children, className, onClick }) {
  const handleClick = (e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (href !== "#") scrollTo(href);
    }
    if (onClick) onClick();
  };
  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

// ─── SECTIONS ───────────────────────────────────────────────────────────────

function Navbar() {
  const ref = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => ref.current?.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navLinks = [["#services", "Services"], ["#how", "How It Works"], ["#why", "Why Us"], ["#coverage", "Coverage"], ["#reviews", "Reviews"], ["#contact", "Contact"]];

  return (
    <nav className="ef-nav" id="ef-navbar" ref={ref}>
      <div className="nav-logo">
        <img src="logo.png" alt="Engineer Flow" />
      </div>

      <button 
        className={`nav-hamburger ${menuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
        {navLinks.map(([href, label]) => (
          <li key={href}>
            <NavLink href={href} onClick={closeMenu}>{label}</NavLink>
          </li>
        ))}
        <li>
          <NavLink href="#book" className="nav-cta" onClick={closeMenu}>Book Now</NavLink>
        </li>
      </ul>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg-grid" />
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="hero-content">
        <div className="hero-badge">Gas Safe Registered Engineers</div>
        <h1>
          Your Boiler Fixed,<br />
          <em>Fast &amp; Right.</em>
        </h1>
        <p>
          Engineer Flow dispatches certified boiler engineers to your home. Emergency repairs, annual servicing and full installations — across the UK.
        </p>
        <div className="hero-btns">
          <NavLink href="#book" className="btn-primary">
            Book a Repair <IconArrow />
          </NavLink>
          <a href="tel:08001234567" className="btn-secondary">
            <IconPhone /> 0800 123 4567
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>5,000+</strong><span>Repairs Done</span></div>
          <div className="hero-stat"><strong>98%</strong><span>Satisfaction Rate</span></div>
          <div className="hero-stat"><strong>2hr</strong><span>Avg Response</span></div>
        </div>
      </div>

      <div className="hero-img-panel">
        <img
          className="hero-img-main"
          src="hero2.jpeg"
          alt="Gas Safe engineer inspecting a boiler"
          loading="eager"
        />
        <div className="hero-img-overlay" />
        <div className="hero-rating-chip">
          <div className="rating-stars">★★★★★</div>
          <div className="rating-num">4.9</div>
          <div className="rating-label">1,200+ Reviews</div>
        </div>
        <div className="hero-badge-card">
          <div className="hbc-left">
            <div className="hbc-dot">
              <IconShield color="white" size={20} />
            </div>
            <div>
              <div className="hbc-label">Every engineer is</div>
              <div className="hbc-value">Gas Safe Registered</div>
            </div>
          </div>
          <div className="hbc-right">
            <div className="hbc-status">Available Now</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Same-day slots open</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: <IconShield />, label: "Gas Safe Registered" },
    { icon: <IconStar />, label: "4.9/5 Trustpilot" },
    { icon: <IconClock />, label: "Same-Day Emergency" },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="#007BFF" strokeWidth="2" />
          <path d="M12 12h.01" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      label: "Fixed-Price Guarantee",
    },
    { icon: <IconCheck />, label: "12-Month Warranty" },
  ];

  return (
    <div className="trust-bar">
      {items.map(({ icon, label }) => (
        <div className="trust-item" key={label}>
          <div className="trust-icon-wrap">{icon}</div>
          {label}
        </div>
      ))}
    </div>
  );
}

function Services() {
  const cards = [
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Emergency Repairs",
      desc: "No heat or hot water? We dispatch a Gas Safe engineer to your home, often within 2 hours. Available 7 days a week.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Boiler Servicing",
      desc: "Annual service to keep your boiler efficient, safe, and under warranty. Includes full 20-point inspection and report.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        </svg>
      ),
      title: "New Installations",
      desc: "Upgrade to an A-rated energy-efficient boiler. We fit all major brands — Worcester Bosch, Vaillant, Baxi and more.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M12 2a5 5 0 0 1 5 5c0 5.25-5 13-5 13S7 12.25 7 7a5 5 0 0 1 5-5z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="2" />
        </svg>
      ),
      title: "Power Flushing",
      desc: "Sludge and debris blocking your radiators? A power flush restores efficiency and extends your boiler lifespan significantly.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Gas Safety (CP12)",
      desc: "Legally required for landlords. We issue Gas Safety Certificates quickly with full compliance and same-day documentation.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Heating System Checks",
      desc: "Full central heating health check — radiators, thermostats, pipes and controls — to maximise comfort and reduce bills.",
    },
  ];

  return (
    <section className="services" id="services">
      <div className="section-header centered">
        <span className="section-tag">Our Services</span>
        <h2 className="section-title">Everything Your Boiler Needs</h2>
        <p className="section-sub">
          From emergency breakdowns to routine maintenance — our certified engineers handle it all, at your home, at a time that suits you.
        </p>
      </div>
      <div className="services-grid">
        {cards.map(({ icon, title, desc }) => (
          <div className="service-card" key={title}>
            <div className="service-icon-wrap">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <NavLink href="#book" className="service-link">Book Now →</NavLink>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7cc8ff" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.47 2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      title: "Tell Us the Problem",
      desc: "Book online or call us. Describe the issue and your location. Takes under 2 minutes.",
    },
    {
      num: "02",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7cc8ff" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg>,
      title: "Choose Your Slot",
      desc: "Pick a time that suits you — same day, next day, or whenever is most convenient for you.",
    },
    {
      num: "03",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7cc8ff" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1" strokeLinecap="round" /><path d="M16 8h4l3 3v5h-7V8zM5 17v4M19 17v4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" /></svg>,
      title: "Engineer Arrives",
      desc: "A local, Gas Safe registered engineer arrives on time, in uniform, with parts ready to fix the job first time.",
    },
    {
      num: "04",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7cc8ff" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      title: "Problem Solved",
      desc: "We fix it, test it, and you pay only the agreed fixed price upfront. No surprises, ever.",
    },
  ];

  return (
    <section className="how" id="how">
      <div className="section-header centered" style={{ position: "relative", zIndex: 2, marginBottom: 60 }}>
        <span className="section-tag">Simple Process</span>
        <h2 className="section-title">Booked in Minutes,<br />Fixed by an Expert</h2>
        <p className="section-sub">No waiting on hold. No hidden fees. Just fast, reliable boiler repairs.</p>
      </div>
      <div className="steps">
        {steps.map(({ num, icon, title, desc }) => (
          <div className="step" key={num}>
            <div className="step-num">{num}</div>
            <div className="step-icon-wrap">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const feats = [
    {
      icon: <IconClock color="#007BFF" size={22} />,
      title: "Lightning-Fast Response",
      desc: "Average 2-hour dispatch for emergency jobs. Book before 11am, get an engineer the same day.",
    },
    {
      icon: <IconStar color="#007BFF" size={22} />,
      title: "Fixed Pricing — No Surprises",
      desc: "You know the full cost before we start. No hidden call-out fees, no last-minute extras on the bill.",
    },
    {
      icon: <IconShield color="#007BFF" size={22} />,
      title: "Gas Safe Certified Team",
      desc: "Every Engineer Flow engineer is Gas Safe registered and carries ID. Verify on the official Gas Safe register.",
    },
    {
      icon: <IconCheck color="#007BFF" size={22} />,
      title: "12-Month Guarantee",
      desc: "All repairs come with a 12-month workmanship guarantee. If it breaks again, we come back for free.",
    },
  ];

  return (
    <section className="why" id="why">
      <div className="why-inner">
        <div className="why-images">
          <div className="why-img-main">
            <img src="hero.jpg" alt="Engineer inspecting boiler system" loading="lazy" />
          </div>
          <div className="why-img-small">
            <img src="hero3.avif" alt="Engineer working on central heating" loading="lazy" />
          </div>
          <div className="why-img-small">
            <img src="hero4.webp" alt="Gas boiler close up" loading="lazy" />
          </div>
        </div>

        <div>
          <div className="section-header">
            <span className="section-tag">Why Engineer Flow</span>
            <h2 className="section-title">Trusted by Thousands of UK Homeowners</h2>
            <p className="section-sub">We're not a faceless call centre. We're a team of certified engineers built around one goal — getting your home warm, fast.</p>
          </div>
          <div className="why-feats">
            {feats.map(({ icon, title, desc }) => (
              <div className="why-feat" key={title}>
                <div className="why-feat-icon">{icon}</div>
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  const cities = ["London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool", "Bristol", "Edinburgh", "Glasgow", "Cardiff", "Nottingham", "+ 200 more"];

  return (
    <section className="coverage" id="coverage">
      <div className="coverage-inner">
        <div>
          <div className="section-header">
            <span className="section-tag">UK Coverage</span>
            <h2 className="section-title">Engineers Near You,<br />Across the UK</h2>
            <p className="section-sub">We have Gas Safe engineers stationed across England, Scotland and Wales, ready to reach you quickly wherever you are.</p>
          </div>
          <div className="coverage-cities">
            {cities.map((city) => (
              <div className="city-tag" key={city}>
                <div className="city-dot" />
                {city}
              </div>
            ))}
          </div>
        </div>
        <div className="coverage-img">
          <img src="https://wallpapers.com/images/hd/1920-x-1080-night-city-chicago-skyline-gzv0mxxe2yl9ou9f.jpg" alt="UK city skyline" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", name: "Sarah H.", loc: "Manchester", text: "Boiler broke down on a freezing Monday morning. Engineer Flow had someone at my door within 90 minutes. Fixed in under an hour. Absolutely brilliant service." },
    { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", name: "James P.", loc: "London", text: "I'm a landlord with 4 properties. Engineer Flow handles all my annual gas safety checks. Professional, punctual, and the CP12 certificates come through the same day." },
    { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", name: "Aisha M.", loc: "Birmingham", text: "Fair pricing, friendly engineer, and they explained everything they were doing. No nasty surprise on the bill. Will use Engineer Flow for our annual service every year." },
  ];

  return (
    <section className="testimonials" id="reviews">
      <div className="section-header centered" style={{ marginBottom: 56 }}>
        <span className="section-tag">Customer Reviews</span>
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-sub">Rated 4.9/5 on Trustpilot from over 1,200 verified reviews across the UK.</p>
      </div>
      <div className="reviews-grid">
        {reviews.map(({ img, name, loc, text }) => (
          <div className="review-card" key={name}>
            <div className="stars">★★★★★</div>
            <p className="review-text">"{text}"</p>
            <div className="review-author">
              <img src={img} alt={name} className="review-avatar-img" loading="lazy" />
              <div>
                <div className="review-name">{name}</div>
                <div className="review-loc">{loc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta-section" id="book">
      <h2>Ready to Get Your Boiler Fixed?</h2>
      <p>Book in 60 seconds. A Gas Safe engineer will be with you today.</p>
      <div className="cta-btns">
        <a href="#" className="btn-white">
          <IconCalendar color="#003A70" size={18} />
          Book Online Now
        </a>
        <a href="tel:08001234567" className="btn-outline-white">
          <IconPhone color="white" size={18} />
          Call 0800 123 4567
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="logo.png" alt="Engineer Flow" />
          </div>
          <p>Gas Safe registered boiler engineers dispatched to your home across the UK. Fast, reliable and fully guaranteed.</p>
          
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {["Emergency Repair", "Annual Service", "New Installation", "Power Flush", "Gas Safety CP12"].map((s) => (
              <li key={s}><NavLink href="#services">{s}</NavLink></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><NavLink href="#services">Services</NavLink></li>
            <li><NavLink href="#how">How It Works</NavLink></li>
            <li><NavLink href="#why">Why Us</NavLink></li>
            <li><NavLink href="#coverage">Coverage Areas</NavLink></li>
            <li><NavLink href="#reviews">Reviews</NavLink></li>
            <li><NavLink href="#contact">Contact</NavLink></li>
            <li><NavLink href="#book">Book Now</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:08001234567">0800 123 4567</a></li>
            <li><a href="mailto:hello@engineerflow.co.uk">hello@engineerflow.co.uk</a></li>
            <li><a href="#">24/7 Emergency Line</a></li>
            <li><NavLink href="#book">Book Online</NavLink></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Engineer Flow Ltd. All rights reserved.</span>
        
      </div>
    </footer>
  );
}

function PhoneBar() {
  return (
    <div className="phone-bar">
      <a href="tel:08001234567" className="phone-btn">
        <IconPhone color="white" size={18} />
        Emergency Call
      </a>
    </div>
  );
}

// ─── CONTACT US ─────────────────────────────────────────────────────────────

function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const templateParams = {
      from_name:  form.name,
      from_email: form.email,
      phone:      form.phone  || "Not provided",
      service:    form.service || "Not specified",
      message:    form.message,
      to_email:   "marketing@engineerflow.com",
    };

    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, templateParams, EJ_PUBLIC_KEY)
      .then(() => {
        setLoading(false);
        setSubmitted(true);
      })
      .catch((err) => {
        setLoading(false);
        console.error("EmailJS error:", err);
        alert("Sorry, something went wrong. Please try calling us on 0800 123 4567.");
      });
  };

  const infoCards = [
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.47 2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Phone",
      value: <a href="tel:08001234567">0800 123 4567</a>,
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Email",
      value: <a href="mailto:hello@engineerflow.co.uk">hello@engineerflow.co.uk</a>,
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
      ),
      label: "Working Hours",
      value: <span>Mon–Sun, 7am – 10pm<br /><span style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>Emergency line: 24/7</span></span>,
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#007BFF" strokeWidth="1.8">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "Head Office",
      value: <span>14 Boiler Lane, London, EC1A 1BB</span>,
    },
  ];

  return (
    <section className="contact" id="contact">
      <div className="section-header centered">
        <span className="section-tag">Get In Touch</span>
        <h2 className="section-title">Contact Us</h2>
        <p className="section-sub">
          Have a question or need a quote? Fill in the form and one of our team will get back to you within 1 hour.
        </p>
      </div>

      <div className="contact-inner">
        {/* Left — info cards */}
        <div className="contact-info">
          {infoCards.map(({ icon, label, value }) => (
            <div className="contact-info-card" key={label}>
              <div className="ci-icon">{icon}</div>
              <div>
                <div className="ci-label">{label}</div>
                <div className="ci-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — form */}
        <div className="contact-form-wrap">
          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll be in touch within 1 hour.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", service: "", message: "" }); }}
                className="form-submit"
                style={{ marginTop: 8, maxWidth: 200 }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              <div className="form-title">Send Us a Message</div>
              <div className="form-subtitle">We typically reply within 60 minutes during working hours.</div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cf-name">Full Name *</label>
                    <input
                      id="cf-name" name="name" type="text"
                      placeholder="Jane Smith"
                      value={form.name} onChange={handleChange} required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-email">Email Address *</label>
                    <input
                      id="cf-email" name="email" type="email"
                      placeholder="jane@example.com"
                      value={form.email} onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cf-phone">Phone Number</label>
                    <input
                      id="cf-phone" name="phone" type="tel"
                      placeholder="07700 900000"
                      value={form.phone} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-service">Service Needed</label>
                    <select id="cf-service" name="service" value={form.service} onChange={handleChange}>
                      <option value="">Select a service…</option>
                      <option>Emergency Repair</option>
                      <option>Annual Servicing</option>
                      <option>New Installation</option>
                      <option>Power Flushing</option>
                      <option>Gas Safety (CP12)</option>
                      <option>Heating System Check</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cf-message">Message *</label>
                  <textarea
                    id="cf-message" name="message"
                    placeholder="Describe your issue or ask us anything…"
                    value={form.message} onChange={handleChange} required
                  />
                </div>

                <button type="submit" className="form-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Scroll-fade animation observer ────────────────────────────────────────

function useScrollFade() {
  useEffect(() => {
    const targets = document.querySelectorAll(
      ".service-card, .why-feat, .review-card, .step, .city-tag, .why-img-main, .why-img-small"
    );
    targets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.08 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── ROOT COMPONENT ─────────────────────────────────────────────────────────

export default function EngineerFlow() {
  useScrollFade();

  return (
    <>
      <style>{css}</style>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <HowItWorks />
      <WhyUs />
      <Coverage />
      <Testimonials />
      <CTA />
      <ContactUs />
      <Footer />
      <PhoneBar />
    </>
  );
}