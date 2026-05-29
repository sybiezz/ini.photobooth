import { useState } from "react";
import jsPDF from "jspdf";
import { getInvoiceLogoDataUrl } from "../utils/pdfLogo";

// ── Helpers ───────────────────────────────────────────────────────

function formatRp(amount = 0) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
}

function getInvoiceCode(id) {
  return id ? `PH-${String(id).slice(-5)}` : "PH-NEW";
}

function normalizeWhatsAppNumber(phone = "") {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;

  return digits;
}

function getBookingTotal(booking) {
  return booking.package?.total || booking.package?.price || 0;
}

function getEventDate(booking) {
  const dateInfo = booking.date;
  return dateInfo
    ? `${dateInfo.dayName}, ${dateInfo.day} ${dateInfo.monthName} ${dateInfo.year}`
    : "-";
}

function getStatus(b) {
  if (!b.isVerified) return "MENUNGGU VERIFIKASI";
  const total = b.package?.total || b.package?.price || 0;
  const paid = Number(b.paidAmount) || 0;
  if (paid >= total && total > 0) return "LUNAS";
  return "DP TERBAYAR";
}

const STATUS_STYLE = {
  "MENUNGGU VERIFIKASI": "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  "DP TERBAYAR": "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  "LUNAS": "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
};

async function downloadInvoicePdf(booking) {
  const total = getBookingTotal(booking);
  const paid = booking.paidAmount || 0;
  const remaining = Math.max(total - paid, 0);
  const status = getStatus(booking);
  const invoiceCode = getInvoiceCode(booking.id);
  const eventTime = `${booking.form?.waktuMulai || "-"} - ${booking.form?.waktuSelesai || "-"}`;
  const logoInfo = await getInvoiceLogoDataUrl();
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const right = pageWidth - margin;
  let y = 60;

  const setText = (size, style = "normal", color = [17, 24, 39]) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const roundedRect = (x, top, width, height, fill = [255, 255, 255], stroke = [229, 231, 235]) => {
    pdf.setFillColor(...fill);
    pdf.setDrawColor(...stroke);
    pdf.roundedRect(x, top, width, height, 3, 3, "FD");
  };

  const labelValue = (label, value, x, top, width) => {
    setText(7, "bold", [156, 163, 175]);
    pdf.text(label.toUpperCase(), x, top);
    setText(10, "bold", [17, 24, 39]);
    pdf.text(pdf.splitTextToSize(String(value || "-"), width), x, top + 6);
  };

  pdf.setFillColor(17, 24, 39);
  pdf.rect(0, 0, pageWidth, 50, "F");
  if (logoInfo && logoInfo.dataUrl) {
    const h = 12;
    const w = (logoInfo.width / logoInfo.height) * h;
    const logoY = 25 - h / 2;
    pdf.addImage(logoInfo.dataUrl, "PNG", margin, logoY, w, h);
  } else {
    setText(22, "bold", [255, 255, 255]);
    pdf.text("ini.photobooth", margin, 22);
  }
  setText(9, "normal", [209, 213, 219]);
  pdf.text("Premium photobooth service", margin, 38);
  setText(8, "bold", [209, 213, 219]);
  pdf.text("INVOICE", right, 18, { align: "right" });
  setText(15, "bold", [255, 255, 255]);
  pdf.text(`#${invoiceCode}`, right, 27, { align: "right" });
  pdf.setFillColor(59, 130, 246);
  pdf.roundedRect(right - 36, 33, 36, 8, 4, 4, "F");
  setText(7, "bold", [255, 255, 255]);
  pdf.text(status, right - 18, 38.2, { align: "center" });

  roundedRect(margin, y, contentWidth, 32);
  labelValue("Diterbitkan", new Date().toLocaleDateString("id-ID"), margin + 8, y + 11, 45);
  labelValue("Klien", booking.form?.nama || "-", margin + 64, y + 11, 42);
  labelValue("Telepon", booking.form?.telepon || "-", margin + 118, y + 11, 50);
  y += 42;

  roundedRect(margin, y, contentWidth, 62, [249, 250, 251]);
  setText(11, "bold");
  pdf.text("Detail Acara", margin + 8, y + 11);
  labelValue("Tanggal", getEventDate(booking), margin + 8, y + 23, 52);
  labelValue("Paket", booking.package?.title || "-", margin + 68, y + 23, 50);
  labelValue("Jenis Acara", booking.form?.jenisAcara || "-", margin + 126, y + 23, 46);
  labelValue("Lokasi", booking.form?.lokasi || "-", margin + 8, y + 43, 52);
  labelValue("Durasi", `${eventTime} | ${booking.package?.hours ? booking.package.hours + " Jam" : "-"}`, margin + 68, y + 43, 50);
  labelValue("Catatan", booking.form?.catatan || "-", margin + 126, y + 43, 46);
  y += 72;

  setText(11, "bold");
  pdf.text("Rincian Pesanan", margin, y);
  y += 6;
  pdf.setFillColor(17, 24, 39);
  pdf.roundedRect(margin, y, contentWidth, 10, 3, 3, "F");
  setText(8, "bold", [255, 255, 255]);
  pdf.text("ITEM", margin + 6, y + 6.5);
  pdf.text("QTY", right - 48, y + 6.5, { align: "right" });
  pdf.text("HARGA", right - 6, y + 6.5, { align: "right" });
  y += 10;

  roundedRect(margin, y, contentWidth, 28);
  setText(10, "bold");
  pdf.text(pdf.splitTextToSize(booking.package?.title || "Paket photobooth", 90), margin + 6, y + 8);
  setText(8, "normal", [107, 114, 128]);
  pdf.text(booking.package?.size ? `Ukuran Cetak: ${booking.package.size}` : "-", margin + 6, y + 18);
  setText(10, "bold");
  pdf.text("1", right - 48, y + 14, { align: "right" });
  pdf.text(formatRp(total), right - 6, y + 14, { align: "right" });
  y += 38;

  roundedRect(right - 72, y, 72, 46, [249, 250, 251]);
  const totalRow = (label, value, top, bold = false, color = [17, 24, 39]) => {
    setText(9, bold ? "bold" : "normal", color);
    pdf.text(label, right - 66, top);
    pdf.text(value, right - 6, top, { align: "right" });
  };
  totalRow("Total", formatRp(total), y + 10);
  totalRow("Sudah Dibayar", formatRp(paid), y + 20, true, [22, 163, 74]);
  totalRow("Sisa", formatRp(remaining), y + 30, true, [239, 68, 68]);
  pdf.setDrawColor(229, 231, 235);
  pdf.line(right - 66, y + 35, right - 6, y + 35);
  totalRow("Status", status, y + 42, true);

  pdf.save(`invoice-${invoiceCode}.pdf`);
}

function getClientWhatsappUrl(booking) {
  const phone = normalizeWhatsAppNumber(booking.form?.telepon || "");
  if (!phone) return "";

  const total = getBookingTotal(booking);
  const paid = booking.paidAmount || 0;
  const remaining = Math.max(total - paid, 0);
  const message = encodeURIComponent(
    `Halo ${booking.form?.nama || ""}, invoice ${getInvoiceCode(booking.id)} untuk booking photobooth kamu sudah tersedia.\n\nPaket: ${booking.package?.title || "-"}\nTanggal: ${getEventDate(booking)}\nWaktu: ${booking.form?.waktuMulai || "-"} - ${booking.form?.waktuSelesai || "-"}\nDP dibayar: ${formatRp(paid)}\nSisa pelunasan: ${formatRp(remaining)}\nStatus: ${getStatus(booking)}\n\nTerima kasih.`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

// ── Section / Row helpers ─────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.18em] uppercase text-neutral-400 font-semibold mb-2">
        {title}
      </p>
      <div className="bg-neutral-50 rounded-2xl px-4 py-1 border border-neutral-100 divide-y divide-neutral-100">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "text-neutral-900 font-semibold" }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

// ── Booking Detail Drawer ─────────────────────────────────────────

function BookingDrawer({ booking, onClose, onVerify, onDelete }) {
  if (!booking) return null;

  const total = booking.package?.total || booking.package?.price || 0;
  const paid = booking.paidAmount || 0;
  const sisa = Math.max(total - paid, 0);
  const status = getStatus(booking);
  const eventDate = getEventDate(booking);
  const clientWhatsappUrl = getClientWhatsappUrl(booking);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header (Sticky / Tetap di atas) */}
        <div className="bg-white rounded-t-3xl border-b border-neutral-100 shrink-0">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-neutral-400 font-semibold">
                Detail Pesanan
              </p>
              <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                {booking.form?.nama || "–"}
              </h2>
            </div>
            <span className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase ${STATUS_STYLE[status]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Konten Scrollable */}
        <div className="px-6 pb-8 pt-4 space-y-5 overflow-y-auto flex-1">

          {/* Info client */}
          <Section title="Informasi Client">
            <Row label="Nama" value={booking.form?.nama || "–"} />
            <Row label="Email" value={booking.form?.email || "–"} />
            <Row label="Telp" value={booking.form?.telepon || "–"} />
          </Section>

          {/* Info event */}
          <Section title="Detail Acara">
            <Row label="Tanggal" value={eventDate} />
            <Row label="Paket" value={booking.package?.title || "–"} />
            <Row label="Jenis Acara" value={booking.form?.jenisAcara || "–"} />
            <Row label="Lokasi" value={booking.form?.lokasi || "–"} />
            <Row
              label="Durasi"
              value={
                booking.form?.waktuMulai && booking.form?.waktuSelesai
                  ? `${booking.form.waktuMulai} - ${booking.form.waktuSelesai} | ${booking.package?.hours ? booking.package.hours + " Jam" : "–"}`
                  : booking.package?.hours ? `${booking.package.hours} Jam` : "–"
              }
            />
            <Row label="Catatan" value={booking.form?.catatan || "–"} />
          </Section>

          {/* Rincian pembayaran */}
          <Section title="Rincian Pembayaran">
            <Row label="Total Harga" value={formatRp(total)} />
            <Row
              label="DP Dibayar"
              value={formatRp(paid)}
              valueClass="text-emerald-600 font-bold"
            />
            <div className="pt-2 border-t border-dashed border-neutral-200">
              <Row
                label="Sisa Pelunasan"
                value={formatRp(sisa)}
                valueClass={
                  sisa > 0
                    ? "text-rose-500 font-bold text-base"
                    : "text-neutral-400 line-through"
                }
              />
            </div>
          </Section>

          {/* ✅ Bukti pembayaran — data dari PaymentPage via App.jsx */}
          {booking.proofImage ? (
            <Section title="Bukti Pembayaran">
              <div className="py-2">
                <div className="rounded-2xl overflow-hidden border border-neutral-200">
                  <img
                    src={booking.proofImage}
                    alt="Bukti transfer"
                    className="w-full object-contain max-h-[500px] bg-neutral-50/50"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  {booking.proofFileName || "bukti.jpg"}
                </p>
              </div>
            </Section>
          ) : (
            <div className="bg-neutral-50 rounded-2xl px-4 py-4 flex items-center gap-3 border border-neutral-100">
              <svg className="w-5 h-5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159
                     m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909
                     m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6
                     a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12
                     a1.5 1.5 0 001.5 1.5z
                     m10.5-11.25h.008v.008h-.008V8.25z
                     m.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-sm text-neutral-500">Belum ada bukti pembayaran diunggah</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => downloadInvoicePdf(booking)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-neutral-200 text-neutral-800 font-bold text-xs hover:border-neutral-900 active:scale-[0.98] transition-all"
            >
              Download Invoice
            </button>
            <a
              href={clientWhatsappUrl || undefined}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (!clientWhatsappUrl) event.preventDefault();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs active:scale-[0.98] transition-all ${clientWhatsappUrl
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
            >
              Kirim WhatsApp
            </a>
          </div>

          {/* Action */}
          {!booking.isVerified ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onVerify(booking.id)}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-700 active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verifikasi — Tandai DP Terbayar
              </button>
              <p className="text-center text-xs text-neutral-400">
                Pastikan bukti transfer sudah sesuai sebelum verifikasi
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-4 border border-emerald-100">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-emerald-700">Sudah Diverifikasi</p>
                <p className="text-xs text-emerald-500 mt-0.5">Status booking diperbarui ke DP Terbayar</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm("Hapus pesanan ini dari admin?");
              if (!confirmed) return;
              onDelete(booking.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-bold text-sm hover:bg-rose-100 active:scale-[0.98] transition-all"
          >
            Hapus Pesanan
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function AdminPage({ bookings = [], onVerify, onDelete }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "RJ24D") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Username atau password salah!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Admin Login</h1>
            <p className="text-sm text-neutral-500 mt-1">Gunakan username dan password yang benar untuk masuk</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-5 py-4 text-sm focus:outline-none border-b border-neutral-100"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-5 py-4 pr-12 text-sm focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none flex items-center justify-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-xs font-bold text-rose-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg"
            >
              Masuk
            </button>
          </form>

          <p className="text-center text-[10px] text-neutral-400 mt-8 tracking-widest uppercase font-bold">
            ini.photobooth admin system
          </p>
        </div>
      </div>
    );
  }

  // ✅ Satu handleVerify yang memanggil prop onVerify dari App.jsx
  const handleVerify = (id) => {
    if (onVerify) onVerify(id);
  };

  const handleDelete = (id) => {
    if (onDelete) onDelete(id);
  };

  const counts = {
    ALL: bookings.length,
    "MENUNGGU VERIFIKASI": bookings.filter((b) => getStatus(b) === "MENUNGGU VERIFIKASI").length,
    "DP TERBAYAR": bookings.filter((b) => getStatus(b) !== "MENUNGGU VERIFIKASI").length,
  };

  const FILTERS = [
    { key: "ALL", label: "Semua" },
    { key: "MENUNGGU VERIFIKASI", label: "Menunggu" },
    { key: "DP TERBAYAR", label: "DP Terbayar" },
  ];

  const filtered =
    filter === "ALL"
      ? bookings
      : filter === "DP TERBAYAR"
        ? bookings.filter((b) => getStatus(b) === "DP TERBAYAR" || getStatus(b) === "LUNAS")
        : bookings.filter((b) => getStatus(b) === filter);

  return (
    <div className="min-h-screen bg-neutral-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-30 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <img src="/logo - Copy.png" alt="ini.photobooth" className="h-11 w-auto object-contain invert" />
          <span className="text-[10px] tracking-widest uppercase font-bold text-white bg-black px-3 py-1.5 rounded-full">
            Admin
          </span>
        </div>
      </nav>

      <div className="pt-20 max-w-2xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="pt-7 mb-6">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Verifikasi Pembayaran
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Order", value: bookings.length, color: "bg-neutral-900 text-white" },
            { label: "Perlu Verif.", value: bookings.filter((b) => !b.isVerified).length, color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
            { label: "DP Terbayar", value: bookings.filter((b) => b.isVerified).length, color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-4 py-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] font-semibold tracking-wide mt-1 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === f.key
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f.key
                ? "bg-white/20 text-white"
                : "bg-neutral-100 text-neutral-500"
                }`}>
                {counts[f.key] ?? bookings.length}
              </span>
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl px-6 py-14 text-center border border-neutral-100">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25
                     V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08
                     m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5
                     a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664
                     m-5.8 0A2.251 2.251 0 0113.5 2.25H15
                     c1.012 0 1.867.668 2.15 1.586
                     m-5.8 0c-.376.023-.75.05-1.124.08
                     C9.095 4.01 8.25 4.973 8.25 6.108V8.25
                     m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25
                     c0 .621.504 1.125 1.125 1.125h9.75
                     c.621 0 1.125-.504 1.125-1.125V9.375
                     c0-.621-.504-1.125-1.125-1.125H8.25z
                     M6.75 12h.008v.008H6.75V12z
                     m0 3h.008v.008H6.75V15z
                     m0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-500">Belum ada pesanan</p>
            <p className="text-xs text-neutral-400 mt-1">Pesanan baru akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const status = getStatus(b);
              const paid = b.paidAmount || 0;
              const eventDate = b.date
                ? `${b.date.day} ${b.date.monthName} ${b.date.year}`
                : "–";

              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="w-full text-left bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {/* Status strip */}
                  <div className={`h-1 w-full ${b.isVerified ? "bg-emerald-400" : "bg-amber-400"}`} />

                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 text-[15px] leading-tight truncate">
                          {b.form?.nama || "–"}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {b.package?.title || "–"}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase ${STATUS_STYLE[status]}`}>
                        {status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5
                               a2.25 2.25 0 012.25-2.25h13.5
                               A2.25 2.25 0 0121 7.5v11.25
                               m-18 0A2.25 2.25 0 005.25 21h13.5
                               A2.25 2.25 0 0021 18.75
                               m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5
                               A2.25 2.25 0 0121 9v7.5" />
                        </svg>
                        {eventDate}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-400">DP Dibayar</p>
                        <p className="text-sm font-bold text-neutral-900">{formatRp(paid)}</p>
                      </div>
                    </div>

                    {/* Proof indicator */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${b.proofImage ? "bg-emerald-400" : "bg-neutral-300"}`} />
                        <p className="text-[11px] text-neutral-500">
                          {b.proofImage ? "Bukti tersedia" : "Belum ada bukti"}
                        </p>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        Lihat detail
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onVerify={(id) => {
            handleVerify(id);
            setSelected((prev) => prev ? { ...prev, isVerified: true } : null);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
