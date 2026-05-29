import { useState, useEffect } from "react";

function DrawerMenu({ open, onClose, onNavigate, activePage }) {
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
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          open ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-100">
          <img src="/logo - Copy.png" alt="ini.photobooth" className="h-9 w-auto object-contain invert" />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? "bg-black text-white hover:bg-black/90"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">© 2026 ini.photobooth</p>
        </div>
      </div>
    </>
  );
}

export default function Navbar({ onNavigate, activePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <DrawerMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} activePage={activePage} />
      <header className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <button 
          onClick={() => onNavigate("home")} 
          className="hover:opacity-70 transition-opacity flex items-center"
        >
          <img src="/logo - Copy.png" alt="ini.photobooth" className="h-11 w-auto object-contain invert" />
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-[5px] p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="Buka menu"
        >
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
        </button>
      </header>
    </>
  );
}
