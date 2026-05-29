import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";

const homePhoto = {
  src: "/FotoHome.jpeg",
  label: "ini.photobooth gallery",
};

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671L17.25 19.5M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM21 8.689c0-.864-.933-1.406-1.683-.977l-7.108 4.061a1.125 1.125 0 000 1.954l7.108 4.061A1.125 1.125 0 0021 16.811V8.69z" />
      </svg>
    ),
    title: "Cetak Tanpa Batas",
    desc: "Semua tamu bisa membawa pulang kenangan.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: "File Digital",
    desc: "Akses semua foto secara instan.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: "Gratis Transportasi",
    desc: "Gratis transportasi untuk area Jabodetabek.",
  },
];

const GALLERY_URL = "https://drive.google.com/drive/folders/1z8yUuMOtE8eK4OLhB7hE96MYqn7PkdUp?usp=sharing";

function DrawerMenu({ open, onClose, onNavigate }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
      ),
    },
    {
      id: "package",
      label: "Package",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-20 transition-opacity duration-300 ${
          open ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-30 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <img src="/logo - Copy.png" alt="ini.photobooth" className="h-9 w-auto object-contain invert" />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Tutup menu"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-left"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">2026 ini.photobooth</p>
        </div>
      </div>
    </>
  );
}

export default function HomePage({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }} className="min-h-screen bg-white">
      <Navbar onNavigate={onNavigate} activePage="home" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .serif     { font-family: 'Instrument Serif', serif; }
        .sans      { font-family: 'Instrument Sans', 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade-in { animation: fadeIn 0.5s ease both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.25s; }
        .d4 { animation-delay: 0.38s; }
        .d5 { animation-delay: 0.52s; }

        .feature-card {
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .feature-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          transform: translateY(-3px);
        }

        .btn-primary {
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .btn-primary:hover { transform: scale(1.03); }
        .btn-primary:active { transform: scale(0.98); }

        .btn-outline {
          transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
        }
        .btn-outline:hover {
          background: #111;
          color: white;
          transform: scale(1.03);
        }
        .btn-outline:active { transform: scale(0.98); }

        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.025;
          z-index: 999;
        }
      `}</style>

      {/*
        <img src="/logo - Copy.png" alt="ini.photobooth" className="h-11 w-auto object-contain invert" />
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-[5px] p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Buka menu"
        >
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
        </button>
      */}

      {/* ── HERO SECTION ── */}
      <section className="min-h-screen flex flex-col" ref={heroRef}>
        <div className="max-w-5xl mx-auto w-full px-5 pt-14 pb-0 flex flex-col">

          {/* Label */}
          <p className={`text-[10px] tracking-[0.22em] text-neutral-500 font-semibold uppercase mb-6 ${heroVisible ? "anim-fade-up d1" : "opacity-0"}`}>
            Photobooth Premium untuk Momen Spesial
          </p>

          {/* Heading */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-950 leading-[1.08] tracking-tight mb-6 max-w-xl ${heroVisible ? "anim-fade-up d2" : "opacity-0"}`}>
            Abadikan Momen Bersama{" "}
            <span className="serif italic font-normal">ini.photobooth</span>
          </h1>

          {/* Subtext */}
          <p className={`text-[15px] sm:text-base text-neutral-500 leading-relaxed max-w-md mb-6 ${heroVisible ? "anim-fade-up d3" : "opacity-0"}`}>
            Pengalaman photobooth berkualitas untuk berbagai acara istimewa. Kami menggabungkan desain minimalis dengan teknologi premium untuk mengabadikan momen terbaikmu.
          </p>

          {/* Buttons */}
          <div className={`flex items-center gap-3 flex-wrap ${heroVisible ? "anim-fade-up d4" : "opacity-0"}`}>
            <button
              onClick={() => onNavigate("calendar")}
              className="btn-primary px-6 py-3 bg-neutral-950 text-white text-sm font-semibold rounded-xl"
            >
              Mulai Pesan
            </button>
            <button
              onClick={() => window.open(GALLERY_URL, "_blank", "noopener,noreferrer")}
              className="btn-outline px-6 py-3 bg-white text-neutral-900 text-sm font-semibold rounded-xl border-2 border-neutral-200"
            >
              Lihat Galeri
            </button>
          </div>
        </div>

        {/* ── POLAROID GALLERY ── */}
        <div className={`relative mt-3 h-[340px] w-full overflow-hidden sm:mt-4 sm:h-[460px] ${heroVisible ? "anim-fade-in d5" : "opacity-0"}`}>
          <img
            src={homePhoto.src}
            alt={homePhoto.label}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-50 via-neutral-50/70 to-transparent" />
        </div>
      </section>

      {/* ── FEATURE SECTION ── */}
      <section id="package" className="bg-neutral-50 px-5 pt-7 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-semibold mb-2 text-center">Yang Kamu Dapatkan</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center mb-10 tracking-tight">
            Semua Sudah Termasuk
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card bg-white rounded-2xl px-6 py-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-neutral-100"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-4">
                  {f.icon}
                </div>
                <p className="text-[15px] font-bold text-neutral-900 mb-1.5">{f.title}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-semibold mb-3">Siap Abadikan Momenmu?</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight mb-4">
            Pesan Sekarang, <br />
            <span className="serif italic font-normal">sebelum tanggalmu habis.</span>
          </h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Slot terbatas setiap bulannya. Hubungi kami sekarang dan pastikan harimu terabadikan dengan sempurna.
          </p>
          <button
            onClick={() => onNavigate("calendar")}
            className="btn-primary w-full sm:w-auto px-10 py-3.5 bg-neutral-950 text-white text-sm font-semibold rounded-xl"
          >
            Mulai Pesan →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.04)] border-t border-neutral-100 px-5 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src="/logo - Copy.png" alt="ini.photobooth" className="h-8 w-auto object-contain invert" />
          <p className="text-xs text-neutral-400">© 2024 ini.photobooth · Elevated Moments. Captured Forever.</p>
        </div>
      </footer>
    </div>
  );
}
