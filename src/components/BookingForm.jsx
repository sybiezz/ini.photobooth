import { useState } from "react";
import Navbar from "./Navbar";
import { supabase } from "../supabaseClient"; // Pastikan path ini benar sesuai struktur folder src kamu[cite: 2]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});
const MAX_EVENTS_PER_WINDOW = 3;
const BUFFER_MINUTES = 2 * 60;

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getEndTimeOptions(startTime, durationHours) {
  if (!startTime || !durationHours) return TIME_OPTIONS;

  const startMinutes = timeToMinutes(startTime);
  const maxEndMinutes = startMinutes + durationHours * 60;

  return TIME_OPTIONS.filter((time) => {
    const minutes = timeToMinutes(time);
    return minutes > startMinutes && minutes <= maxEndMinutes;
  });
}

function rangesOverlap(first, second) {
  return first.start < second.end && second.start < first.end;
}

function isSameBookingDate(booking, date) {
  return (
    booking.date?.day === date?.day &&
    booking.date?.month === date?.month &&
    booking.date?.year === date?.year
  );
}

function getBlockedRange(startTime, endTime) {
  return {
    start: timeToMinutes(startTime) - BUFFER_MINUTES,
    end: timeToMinutes(endTime) + BUFFER_MINUTES,
  };
}

function getConflictInfo({ bookings, bookingData, form }) {
  if (!bookingData?.date || !form.waktuMulai || !form.waktuSelesai) {
    return { isFull: false, count: 0 };
  }

  const requestedRange = getBlockedRange(form.waktuMulai, form.waktuSelesai);
  const overlappingBookings = bookings.filter((booking) => {
    if (booking.id === bookingData.id) return false;
    if (!isSameBookingDate(booking, bookingData.date)) return false;
    if (!booking.form?.waktuMulai || !booking.form?.waktuSelesai) return false;

    return rangesOverlap(
      requestedRange,
      getBlockedRange(booking.form.waktuMulai, booking.form.waktuSelesai)
    );
  });

  return {
    isFull: overlappingBookings.length >= MAX_EVENTS_PER_WINDOW,
    count: overlappingBookings.length,
  };
}

// ── Sub-components ────────────────────────────────────────────────

function DrawerMenu({ open, onClose, onNavigate }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
      ),
    },
    {
      id: "package",
      label: "Package",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
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
          <p className="text-xs text-gray-400">© 2026 ini.photobooth</p>
        </div>
      </div>
    </>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="text-[10px] font-extrabold tracking-widest uppercase text-black mb-2">
      {children}
    </p>
  );
}

function UnderlineInput({ type = "text", placeholder, value, onChange, icon }) {
  return (
    <div className="relative flex items-center border-b border-gray-200 focus-within:border-black transition-colors duration-200 pb-1">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-300 outline-none pr-6 py-1"
      />
      {icon && (
        <span className="absolute right-0 text-gray-300">{icon}</span>
      )}
    </div>
  );
}

function UnderlineSelect({ value, onChange, children }) {
  return (
    <div className="relative border-b border-gray-200 focus-within:border-black transition-colors duration-200 pb-1">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-sm text-gray-800 outline-none appearance-none pr-6 py-1 cursor-pointer"
      >
        {children}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function BookingForm({ bookingData, bookings = [], setBookingData, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const packageHours = bookingData?.package?.hours || 0;
  const [form, setForm] = useState(bookingData?.form || {
    nama: "",
    telepon: "",
    email: "",
    jenisAcara: "",
    lokasi: "",
    waktuMulai: "",
    waktuSelesai: "",
    catatan: "",
  });

  const endTimeOptions = getEndTimeOptions(form.waktuMulai, packageHours);

  const set = (key) => (e) => {
    let value = e.target.value;

    if (key === "nama") {
      value = value.replace(/[^a-zA-Z\s]/g, ""); 
    }

    if (key === "telepon") {
      value = value.replace(/\D/g, "").slice(0, 13); 
    }

    setForm((prev) => {
      if (key !== "waktuMulai") return { ...prev, [key]: value };

      const nextEndOptions = getEndTimeOptions(value, packageHours);
      const endStillAllowed = nextEndOptions.includes(prev.waktuSelesai);

      return {
        ...prev,
        waktuMulai: value,
        waktuSelesai: endStillAllowed ? prev.waktuSelesai : "",
      };
    });
  };

  const isFormComplete = Boolean(
    form.nama.trim().length >= 3 && 
    form.telepon.trim().length >= 10 && 
    form.email.includes("@") && 
    form.email.includes(".") && 
    form.jenisAcara &&
    form.lokasi.trim() &&
    form.waktuMulai &&
    form.waktuSelesai
  );

  const handleContinue = async () => {
    if (!isFormComplete) return;

    const nextConflictInfo = getConflictInfo({ bookings, bookingData, form });
    if (nextConflictInfo.isFull) {
      setConflictInfo(nextConflictInfo);
      return;
    }

    try {
      // PROSES SIMPAN KE SUPABASE
      const { data, error } = await supabase
        .from('bookings') 
        .insert([
          { 
            nama: form.nama, 
            telepon: form.telepon, 
            email: form.email,
            jenis_acara: form.jenisAcara,
            lokasi: form.lokasi,
            waktu_mulai: form.waktuMulai,
            waktu_selesai: form.waktuSelesai,
            catatan: form.catatan,
            tanggal_booking: `${bookingData.date.year}-${bookingData.date.month + 1}-${bookingData.date.day}`,
            paket: bookingData.package?.title,
            total_harga: bookingData.package?.total || bookingData.package?.price
          }
        ])
        .select(); 

      if (error) throw error;

      // Simpan ID dari Supabase agar bisa di-update nanti di halaman Payment
      const newId = data[0].id;

      setBookingData((prev) => ({
        ...prev,
        id: newId,
        form,
      }));
      onNavigate("summary");
    } catch (error) {
      console.error("Gagal nyangkutin data bray:", error.message);
      // Mode santai: Coba lakuin refresh atau cek internet[cite: 2]
      alert("Gagal simpan ke database " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={onNavigate} activePage="package" />

      {conflictInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
          <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Jam Penuh</p>
            <h2 className="mt-2 text-xl font-extrabold text-black">Slot waktu ini sudah full</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Di tanggal dan jam ini sudah ada {conflictInfo.count} event yang bentrok dengan aturan buffer 2 jam sebelum dan 2 jam setelah event. Maksimal hanya {MAX_EVENTS_PER_WINDOW} event di window waktu yang sama.
            </p>
            <button
              type="button"
              onClick={() => setConflictInfo(null)}
              className="mt-6 w-full rounded-2xl bg-black py-4 text-sm font-bold text-white transition-all active:scale-[0.98]"
            >
              Pilih Jam Lain
            </button>
          </div>
        </div>
      )}

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

      <main className="max-w-md mx-auto px-5 pb-10">
        <div className="mt-10 mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-black tracking-tight leading-tight">
            Bagikan detail acaramu
          </h1>
          <p className="mt-3 text-gray-400 text-sm leading-relaxed">
            Lengkapi detail acara untuk melanjutkan pemesanan.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <FieldLabel>Nama Lengkap</FieldLabel>
            <UnderlineInput
              placeholder="Shahnaz"
              value={form.nama}
              onChange={set("nama")}
            />
          </div>
          <div>
            <FieldLabel>Nomor Telepon</FieldLabel>
            <UnderlineInput
              type="tel"
              placeholder="+62 800 000 0000"
              value={form.telepon}
              onChange={set("telepon")}
            />
          </div>
        </div>

        <div className="mb-8">
          <FieldLabel>Email</FieldLabel>
          <UnderlineInput
            type="email"
            placeholder="shahnaz@gmail.com"
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-6 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-7">
            <div>
              <FieldLabel>Jenis Acara</FieldLabel>
              <UnderlineSelect value={form.jenisAcara} onChange={set("jenisAcara")}>
                <option value="" disabled className="text-gray-300">
                  Pilih jenis acara
                </option>
                <option value="pernikahan">Pernikahan</option>
                <option value="ulang-tahun">Ulang Tahun</option>
                <option value="korporat">Korporat</option>
                <option value="wisuda">Wisuda</option>
                <option value="gathering">Gathering</option>
                <option value="lainnya">Lainnya</option>
              </UnderlineSelect>
            </div>
            <div>
              <FieldLabel>Lokasi Acara</FieldLabel>
              <UnderlineInput
                placeholder="Nama tempat atau kota"
                value={form.lokasi}
                onChange={set("lokasi")}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-7">
            <div>
              <FieldLabel>Waktu Mulai</FieldLabel>
              <UnderlineSelect value={form.waktuMulai} onChange={set("waktuMulai")}>
                <option value="" disabled>
                  00:00
                </option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </UnderlineSelect>
            </div>
            <div>
              <FieldLabel>Waktu Selesai</FieldLabel>
              <UnderlineSelect value={form.waktuSelesai} onChange={set("waktuSelesai")}>
                <option value="" disabled>
                  {form.waktuMulai ? "Pilih jam selesai" : "Pilih jam mulai dulu"}
                </option>
                {endTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </UnderlineSelect>
              {form.waktuMulai && packageHours > 0 && (
                <p className="text-[10px] text-gray-400 mt-2">
                  Maksimal {packageHours} jam dari waktu mulai.
                </p>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Catatan Tambahan</FieldLabel>
            <div className="border-b border-gray-200 focus-within:border-black transition-colors duration-200 pb-1">
              <textarea
                rows={4}
                placeholder="Beri tahu kami tentang tema khusus, permintaan tertentu, atau kendala ruang..."
                value={form.catatan}
                onChange={set("catatan")}
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-300 outline-none resize-none leading-relaxed py-1"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!isFormComplete}
          onClick={handleContinue}
          className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
            isFormComplete
              ? "bg-black text-white hover:bg-gray-900 shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Lanjut Pembayaran
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </main>
    </div>
  );
}