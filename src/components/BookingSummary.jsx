import { useState } from "react";
import Navbar from "./Navbar";

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
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-4 py-4 gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-left"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2026 ini.photobooth</p>
        </div>
      </div>
    </>
  );
}

export default function BookingSummary({ bookingData, onNavigate, onBack }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Ambil data dari state utama
  const { date, package: pkg, form } = bookingData;

  const formatRp = (amount) => {
    return "Rp " + (amount || 0).toLocaleString("id-ID");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={onNavigate} activePage="package" />

      {/*
        <img src="/logo - Copy.png" alt="ini.photobooth" className="h-11 w-auto object-contain invert" />
        <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1.5 rounded-md hover:bg-gray-100">
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
          <span className="block w-5 h-0.5 bg-black rounded" />
        </button>
      */}

      <main className="max-w-md mx-auto px-5 pb-10">
        <button onClick={onBack} className="mt-5 flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="mt-8 mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-black tracking-tight leading-tight">Ringkasan Pesanan</h1>
          <p className="mt-2 text-gray-400 text-sm">Periksa kembali detail acaramu sebelum membayar.</p>
        </div>

        {/* Info Klien & Waktu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Klien</p>
            <p className="text-sm font-bold text-black">{form?.nama || "–"}</p>
            <p className="text-xs text-gray-500">{form?.email} · {form?.telepon}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Tanggal</p>
              <p className="text-sm font-bold text-black">{date ? `${date.dayName}, ${date.day} ${date.monthName}` : "–"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Waktu</p>
              <p className="text-sm font-bold text-black">{form?.waktuMulai} — {form?.waktuSelesai}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lokasi</p>
            <p className="text-sm font-bold text-black">{form?.lokasi || "–"}</p>
          </div>
        </div>

        {/* Info Paket */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Paket Terpilih</p>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-black leading-snug">{pkg?.title || "Belum ada paket"}</p>
              <p className="text-xs text-gray-500 mt-1">{pkg?.extrasLabel}</p>
            </div>
            <p className="text-sm font-bold text-black">{formatRp(pkg?.price)}</p>
          </div>
        </div>

        {/* Total Harga */}
        <div className="bg-black rounded-2xl p-5 shadow-lg text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">Total Pembayaran</p>
              <p className="text-2xl font-black tracking-tight mt-0.5">{formatRp(pkg?.total)}</p>
            </div>
            <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
        </div>

        <button
          onClick={() => onNavigate("payment")}
          className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold text-sm py-4 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all shadow-xl"
        >
          Lanjut ke Pembayaran
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </main>
    </div>
  );
}