import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { browseBooks } from "../api";
import { BookOpen, Search, ArrowRight, Star, Users, BookMarked, Clock, Shield, Sparkles, ChevronDown, Menu, X } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #f5f0e8;
    --bg2: #ede8de;
    --text: #1a2e1a;
    --text-muted: #5a6b5a;
    --accent: #3a6b3a;
    --accent-light: #4e8f4e;
    --accent-pale: #d4e8d4;
    --border: #e0d8cc;
    --white: #ffffff;
    --shadow: 0 4px 24px rgba(58,107,58,0.10);
    --shadow-lg: 0 12px 48px rgba(58,107,58,0.16);
  }

  .lp * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 72px;
    background: rgba(245,240,232,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow 0.3s;
  }
  .lp-nav.scrolled { box-shadow: var(--shadow); }
  .lp-nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 1.35rem; font-weight: 700; color: var(--accent);
    text-decoration: none;
  }
  .lp-nav-logo-icon {
    width: 36px; height: 36px; background: var(--accent);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
  }
  .lp-nav-links { display: flex; align-items: center; gap: 32px; }
  .lp-nav-link {
    font-size: 0.9rem; font-weight: 500; color: var(--text-muted);
    text-decoration: none; transition: color 0.2s;
  }
  .lp-nav-link:hover { color: var(--accent); }
  .lp-nav-cta { display: flex; gap: 12px; align-items: center; }
  .lp-btn-ghost {
    padding: 8px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
    color: var(--accent); border: 1.5px solid var(--accent);
    background: transparent; cursor: pointer; text-decoration: none;
    transition: all 0.2s;
  }
  .lp-btn-ghost:hover { background: var(--accent-pale); }
  .lp-btn-solid {
    padding: 8px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
    color: var(--white); background: var(--accent); border: none;
    cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .lp-btn-solid:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: var(--shadow); }

  .lp-hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    position: relative;
    overflow: hidden;
  }
  .lp-hero-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 20% 30%, rgba(58,107,58,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 70%, rgba(58,107,58,0.06) 0%, transparent 70%);
  }
  .lp-hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent-pale); color: var(--accent);
    padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 500;
    margin-bottom: 28px; border: 1px solid rgba(58,107,58,0.2);
    animation: fadeUp 0.6s ease both;
  }
  .lp-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 7vw, 6rem);
    font-weight: 900; line-height: 1.05;
    color: var(--text);
    margin-bottom: 24px;
    animation: fadeUp 0.6s 0.1s ease both;
  }
  .lp-hero-title em { font-style: italic; color: var(--accent); }
  .lp-hero-sub {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: var(--text-muted); max-width: 540px;
    line-height: 1.7; margin-bottom: 48px;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .lp-hero-actions {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.6s 0.3s ease both;
    margin-bottom: 80px;
  }
  .lp-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 12px;
    background: var(--accent); color: var(--white);
    font-size: 1rem; font-weight: 500; text-decoration: none;
    border: none; cursor: pointer;
    transition: all 0.25s; box-shadow: 0 4px 16px rgba(58,107,58,0.3);
  }
  .lp-btn-primary:hover { background: var(--accent-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(58,107,58,0.35); }
  .lp-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 12px;
    background: var(--white); color: var(--text);
    font-size: 1rem; font-weight: 500; text-decoration: none;
    border: 1.5px solid var(--border); cursor: pointer;
    transition: all 0.25s;
  }
  .lp-btn-secondary:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
  .lp-hero-stats {
    display: flex; gap: 48px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.6s 0.4s ease both;
  }
  .lp-stat { text-align: center; }
  .lp-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 700; color: var(--accent);
    display: block;
  }
  .lp-stat-label { font-size: 0.85rem; color: var(--text-muted); }
  .lp-scroll-hint {
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: var(--text-muted); font-size: 0.8rem;
    animation: bounce 2s infinite;
  }

  .lp-section {
    padding: 96px 24px;
    max-width: 1200px; margin: 0 auto;
  }
  .lp-section-header { text-align: center; margin-bottom: 56px; }
  .lp-section-label {
    font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
    display: block;
  }
  .lp-section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700;
    color: var(--text); margin-bottom: 16px;
  }
  .lp-section-sub { color: var(--text-muted); font-size: 1rem; line-height: 1.6; }

  .lp-search-wrap {
    max-width: 600px; margin: 0 auto 56px;
    position: relative;
  }
  .lp-search-input {
    width: 100%; padding: 16px 56px 16px 20px;
    border: 2px solid var(--border); border-radius: 14px;
    font-size: 1rem; font-family: 'DM Sans', sans-serif;
    background: var(--white); color: var(--text);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: var(--shadow);
  }
  .lp-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(58,107,58,0.1); }
  .lp-search-icon {
    position: absolute; right: 18px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }

  .lp-books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 28px;
  }
  .lp-book-card {
    background: var(--white); border-radius: 16px;
    border: 1px solid var(--border); overflow: hidden;
    transition: all 0.3s; cursor: pointer;
    box-shadow: var(--shadow);
    display: flex; flex-direction: column;
    animation: fadeUp 0.5s ease both;
  }
  .lp-book-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
  .lp-book-cover {
    height: 200px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    background: var(--bg2);
  }
  .lp-book-cover img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; z-index: 2;
  }
  .lp-book-cover-pattern {
    position: absolute; inset: 0;
  }
  .lp-book-cover-icon { position: relative; z-index: 1; opacity: 0.4; }
  .lp-book-badge {
    position: absolute; top: 12px; right: 12px;
    background: var(--accent); color: var(--white);
    font-size: 0.7rem; font-weight: 600; padding: 3px 8px; border-radius: 6px;
    z-index: 3;
  }
  .lp-book-badge.unavailable { background: #c0392b; }
  .lp-book-info { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .lp-book-title {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem; font-weight: 700; color: var(--text);
    line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .lp-book-author { font-size: 0.8rem; color: var(--text-muted); }
  .lp-book-genre {
    font-size: 0.72rem; font-weight: 600; color: var(--accent);
    background: var(--accent-pale); padding: 2px 8px; border-radius: 4px;
    display: inline-block; margin-top: auto;
  }
  .lp-book-action {
    margin: 0 16px 16px;
    padding: 9px; border-radius: 8px; text-align: center;
    font-size: 0.82rem; font-weight: 500;
    background: var(--accent-pale); color: var(--accent);
    text-decoration: none; display: block;
    transition: all 0.2s;
  }
  .lp-book-action:hover { background: var(--accent); color: var(--white); }

  .lp-empty {
    text-align: center; padding: 64px 24px; color: var(--text-muted);
    grid-column: 1/-1;
  }
  .lp-loading {
    display: flex; justify-content: center; align-items: center; gap: 8px;
    padding: 64px; color: var(--text-muted); grid-column: 1/-1;
  }
  .lp-spinner {
    width: 20px; height: 20px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .lp-features-bg { background: var(--bg2); }
  .lp-features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 28px;
  }
  .lp-feature-card {
    background: var(--white); border-radius: 16px;
    padding: 32px; border: 1px solid var(--border);
    transition: all 0.3s;
  }
  .lp-feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .lp-feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--accent-pale); display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px; color: var(--accent);
  }
  .lp-feature-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 10px;
  }
  .lp-feature-desc { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }

  .lp-cta {
    text-align: center; padding: 96px 24px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
    position: relative; overflow: hidden;
  }
  .lp-cta::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .lp-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900;
    color: var(--white); margin-bottom: 20px; position: relative;
  }
  .lp-cta-sub {
    color: rgba(255,255,255,0.85); font-size: 1.05rem;
    max-width: 480px; margin: 0 auto 40px; line-height: 1.6; position: relative;
  }
  .lp-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
  .lp-btn-white {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 12px;
    background: var(--white); color: var(--accent);
    font-size: 1rem; font-weight: 600; text-decoration: none;
    transition: all 0.25s;
  }
  .lp-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  .lp-btn-outline-white {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 12px;
    background: transparent; color: var(--white);
    font-size: 1rem; font-weight: 500; text-decoration: none;
    border: 2px solid rgba(255,255,255,0.5);
    transition: all 0.25s;
  }
  .lp-btn-outline-white:hover { border-color: white; background: rgba(255,255,255,0.1); transform: translateY(-2px); }

  .lp-footer {
    background: var(--text); color: rgba(255,255,255,0.6);
    padding: 40px 48px; display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .lp-footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; color: var(--white); font-weight: 700;
  }
  .lp-footer-links { display: flex; gap: 24px; }
  .lp-footer-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
  .lp-footer-link:hover { color: var(--white); }

  .lp-hamburger { display: none; background: none; border: none; cursor: pointer; color: var(--text); }
  .lp-mobile-menu {
    display: none; position: fixed; inset: 0; z-index: 99;
    background: var(--bg); flex-direction: column;
    align-items: center; justify-content: center; gap: 32px;
  }
  .lp-mobile-menu.open { display: flex; }
  .lp-mobile-link {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 700; color: var(--text);
    text-decoration: none; transition: color 0.2s; cursor: pointer;
  }
  .lp-mobile-link:hover { color: var(--accent); }
  .lp-mobile-close {
    position: absolute; top: 20px; right: 20px;
    background: none; border: none; cursor: pointer; color: var(--text);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .lp-nav { padding: 0 20px; }
    .lp-nav-links, .lp-nav-cta { display: none; }
    .lp-hamburger { display: block; }
    .lp-hero { padding: 100px 20px 60px; }
    .lp-hero-stats { gap: 24px; }
    .lp-footer { flex-direction: column; text-align: center; padding: 32px 20px; }
  }
`;

const FEATURES = [
  { icon: <Search size={24} />, title: "Smart Search", desc: "Find any book instantly by title, author, or genre with our powerful search." },
  { icon: <BookMarked size={24} />, title: "Reserve Books", desc: "Reserve books in advance and get notified when they're ready for pickup." },
  { icon: <Clock size={24} />, title: "Track Borrowings", desc: "See all your active loans, due dates, and renewal options in one place." },
  { icon: <Shield size={24} />, title: "Secure Account", desc: "Your data is safe. Manage your profile and membership with confidence." },
  { icon: <Users size={24} />, title: "Community", desc: "Join thousands of readers exploring our growing collection every day." },
  { icon: <Star size={24} />, title: "Curated Collection", desc: "Librarians handpick and manage the collection to ensure quality reading." },
];

function bookColor(title = "") {
  const palettes = [
    ["#d4e8d4", "#3a6b3a"],
    ["#e8d4d4", "#6b3a3a"],
    ["#d4d4e8", "#3a3a6b"],
    ["#e8e4d4", "#6b5a3a"],
    ["#d4e8e8", "#3a6b6b"],
    ["#e8d4e8", "#6b3a6b"],
  ];
  const idx = title.charCodeAt(0) % palettes.length;
  return palettes[idx];
}

export default function LandingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const booksRef = useRef(null);

  useEffect(() => {
    browseBooks().then(data => {
      setBooks(Array.isArray(data) ? data : (data.results || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const filtered = books.filter(b =>
    !search ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.genre?.toLowerCase().includes(search.toLowerCase())
  );

  const scrollToBooks = () => booksRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
          <Link to="/" className="lp-nav-logo">
            <div className="lp-nav-logo-icon"><BookOpen size={18} color="white" /></div>
            LibraryMS
          </Link>
          <div className="lp-nav-links">
            <a href="#books" className="lp-nav-link" onClick={e => { e.preventDefault(); scrollToBooks(); }}>Browse</a>
            <a href="#features" className="lp-nav-link">Features</a>
          </div>
          <div className="lp-nav-cta">
            <Link to="/login" className="lp-btn-ghost">Sign In</Link>
            <Link to="/register" className="lp-btn-solid">Join Free</Link>
          </div>
          <button className="lp-hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
        </nav>

        <div className={`lp-mobile-menu ${mobileOpen ? "open" : ""}`}>
          <button className="lp-mobile-close" onClick={() => setMobileOpen(false)}><X size={28} /></button>
          <span className="lp-mobile-link" onClick={() => { scrollToBooks(); setMobileOpen(false); }}>Browse Books</span>
          <a href="#features" className="lp-mobile-link" onClick={() => setMobileOpen(false)}>Features</a>
          <Link to="/login" className="lp-mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link to="/register" className="lp-mobile-link" onClick={() => setMobileOpen(false)}>Join Free</Link>
        </div>

        <section className="lp-hero">
          <div className="lp-hero-bg" />
          <div className="lp-hero-badge">
            <Sparkles size={19} /> Your community library, reimagined
          </div>
          <h1 className="lp-hero-title">
            Discover Your<br /><em>Next Great Read</em>
          </h1>
          <p className="lp-hero-sub">
            Browse thousands of books, reserve your favourites, and manage your loans - all in one beautiful place.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={scrollToBooks}>
              Browse Books <ArrowRight size={18} />
            </button>
            <Link to="/register" className="lp-btn-secondary">
              Create Account
            </Link>
          </div>
          <div className="lp-hero-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">{books.length > 0 ? `${books.length}+` : "—"}</span>
              <span className="lp-stat-label">Books Available</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">24/7</span>
              <span className="lp-stat-label">Online Access</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">Free</span>
              <span className="lp-stat-label">Membership</span>
            </div>
          </div>
          <div className="lp-scroll-hint" onClick={scrollToBooks} style={{ cursor: "pointer" }}>
            <span>Scroll to explore</span>
            <ChevronDown size={18} />
          </div>
        </section>

        <div ref={booksRef} id="books">
          <div className="lp-section">
            <div className="lp-section-header">
              <span className="lp-section-label">Our Collection</span>
              <h2 className="lp-section-title">Browse Available Books</h2>
              <p className="lp-section-sub">Explore our curated collection. Sign in to borrow or reserve.</p>
            </div>

            <div className="lp-search-wrap">
              <input
                className="lp-search-input"
                placeholder="Search by title, author or genre…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="lp-search-icon"><Search size={18} /></span>
            </div>

            <div className="lp-books-grid">
              {loading ? (
                <div className="lp-loading">
                  <div className="lp-spinner" /> Loading books…
                </div>
              ) : filtered.length === 0 ? (
                <div className="lp-empty">
                  <BookOpen size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                  <p>{search ? "No books match your search." : "No books available yet."}</p>
                </div>
              ) : filtered.map((book, i) => {
                const [bg, fg] = bookColor(book.title);
                const available = book.available_copies > 0;
                return (
                  <div className="lp-book-card" key={book.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="lp-book-cover">
                      <div
                        className="lp-book-cover-pattern"
                        style={{ background: `linear-gradient(135deg, ${bg} 0%, #f0ebe0 100%)` }}
                      />
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <BookOpen size={48} color={fg} className="lp-book-cover-icon" />
                      )}
                      <span className={`lp-book-badge ${!available ? "unavailable" : ""}`}>
                        {available ? `${book.available_copies} left` : "Unavailable"}
                      </span>
                    </div>
                    <div className="lp-book-info">
                      <div className="lp-book-title">{book.title}</div>
                      <div className="lp-book-author">{book.author}</div>
                      {book.genre && <span className="lp-book-genre">{book.genre}</span>}
                    </div>
                    <Link to="/login" className="lp-book-action">
                      {available ? "Borrow / Reserve →" : "Join Waitlist →"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="features" className="lp-features-bg">
          <div className="lp-section">
            <div className="lp-section-header">
              <span className="lp-section-label">Why LibraryMS</span>
              <h2 className="lp-section-title">Everything You Need</h2>
              <p className="lp-section-sub">A complete library experience built for modern readers.</p>
            </div>
            <div className="lp-features-grid">
              {FEATURES.map((f, i) => (
                <div className="lp-feature-card" key={i}>
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div className="lp-feature-title">{f.title}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="lp-cta">
          <h2 className="lp-cta-title">Ready to Start Reading?</h2>
          <p className="lp-cta-sub">Join LibraryMS for free and get instant access to our entire collection today.</p>
          <div className="lp-cta-actions">
            <Link to="/register" className="lp-btn-white">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="lp-btn-outline-white">
              Sign In
            </Link>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="lp-footer-logo">LibraryMS</div>
          <div className="lp-footer-links">
            <Link to="/login" className="lp-footer-link">Login</Link>
            <Link to="/register" className="lp-footer-link">Register</Link>
          </div>
          <div style={{ fontSize: "0.8rem" }}>© {new Date().getFullYear()} LibraryMS. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}