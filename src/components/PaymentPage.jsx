import { useState, useRef } from "react";
import Navbar from "./Navbar";

// ── Sub-components ────────────────────────────────────────────────

function DrawerMenu({ open, onClose, onNavigate }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12
               M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75
               v-4.875c0-.621.504-1.125 1.125-1.125h2.25
               c.621 0 1.125.504 1.125 1.125V21h4.125
               c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
      ),
    },
    {
      id: "package",
      label: "Package",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622
               a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4
               M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5
               c0-.621-.504-1.125-1.125-1.125H3.375
               c-.621 0-1.125.504-1.125 1.125v1.5
               c0 .621.504 1.125 1.125 1.125z" />
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
              onClick={() => { onNavigate(item.id); onClose(); }}
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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
        copied
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Tersalin
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638
                 m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9
                 a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612
                 m7.332 0c.646.049 1.288.11 1.927.184
                 1.1.128 1.907 1.077 1.907 2.185V19.5
                 a2.25 2.25 0 01-2.25 2.25H6.75
                 A2.25 2.25 0 014.5 19.5V6.257
                 c0-1.108.806-2.057 1.907-2.185
                 a48.208 48.208 0 011.927-.184" />
          </svg>
          Salin
        </>
      )}
    </button>
  );
}

function InfoRow({ label, value, copyable }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-gray-800">{value}</p>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
}

// Helper untuk kompres gambar di browser
const compressImage = (file, maxDimension = 1600, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Skala ulang jika melebihi dimensi maksimal
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert ke DataURL (JPEG) dan Blob
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error("Gagal mengonversi gambar ke Blob"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// ── Main Component ────────────────────────────────────────────────

export default function PaymentPage({
  onBack,
  onNavigate,
  totalAmount = 0,
  onSubmitPayment,   // ← dari App.jsx
}) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const formattedTotal = "Rp " + Number(totalAmount).toLocaleString("id-ID");
  const minimumDpAmount = Math.ceil(Number(totalAmount) * 0.3);
  const formattedMinimumDp = "Rp " + minimumDpAmount.toLocaleString("id-ID");
  const numericPaidAmount = Number(String(paidAmount).replace(/\D/g, ""));
  const formattedPaidAmount = numericPaidAmount
    ? "Rp " + numericPaidAmount.toLocaleString("id-ID")
    : "";

  const handlePaidAmountChange = (e) => {
    setPaidAmount(e.target.value.replace(/\D/g, ""));
  };

  // Baca file → kompres dan simpan sebagai base64 & Blob
  const handleFile = async (f) => {
    if (!f) return;
    setIsCompressing(true);
    try {
      const { blob, dataUrl } = await compressImage(f);
      const compressedFile = new File([blob], f.name, { type: "image/jpeg" });
      setFile(compressedFile);
      setPreview(dataUrl);
    } catch (err) {
      console.error("Gagal mengompres gambar:", err);
      // Fallback ke file asli jika kompresi gagal
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) handleFile(dropped);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Kirim data pembayaran ke App.jsx
  const handleSubmit = async () => {
    if (!file || !preview || numericPaidAmount < minimumDpAmount || isUploading) return;

    setIsUploading(true);
    try {
      if (onSubmitPayment) {
        await onSubmitPayment({
          paidAmount:    numericPaidAmount,
          proofFile:     file,         // File hasil kompresi untuk diunggah ke storage
          proofImage:    preview,      // fallback preview base64
          proofFileName: file.name,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Gagal mengirim pembayaran:", err);
      alert(err.message || "Gagal mengunggah bukti pembayaran. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={onNavigate || (() => {})} activePage="package" />

      {/* Header */}
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

      <main className="max-w-md mx-auto px-4 pb-10">
        {/* Back */}
        <button
          onClick={onBack}
          className="mt-5 flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        {/* Title */}
        <div className="mt-8 mb-7 text-center">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Pembayaran</h1>
          <p className="mt-2 text-gray-400 text-sm">Lakukan transfer sesuai detail berikut</p>
        </div>

        {/* ── Sebelum submit ── */}
        {!submitted ? (
          <>
            {/* Section 1: Info rekening */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2 mb-4">
              <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-extrabold tracking-tight">BCA</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Bank Central Asia</p>
                  <p className="text-xs text-gray-400">Transfer Bank</p>
                </div>
              </div>

              <InfoRow label="No. Rekening" value="1234567890" copyable />
              <InfoRow label="Atas Nama"    value="INI PHOTOBOOTH" />

              {/* Nominal highlight */}
              <div className="mt-2 mb-3 bg-gray-950 rounded-xl px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                    Total Pembayaran
                  </p>
                  <p className="text-2xl font-extrabold text-white tracking-tight mt-1">
                    {formattedTotal}
                  </p>
                </div>
                <CopyButton text={String(totalAmount)} />
              </div>

              <div className="flex items-start gap-2 pb-4">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5
                       H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003z
                       M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75z
                       m0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Transfer sesuai nominal untuk mempermudah verifikasi
                </p>
              </div>
            </div>

            {/* Section 2: Upload bukti */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 mb-5">
              <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600">
                  DP Minimal 30%
                </p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-2xl font-extrabold text-black">{formattedMinimumDp}</p>
                  <p className="text-xs font-semibold text-amber-700 text-right">
                    dari total {formattedTotal}
                  </p>
                </div>
              </div>

              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                Nominal DP Dibayar
              </p>
              <div className="mb-5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formattedPaidAmount}
                  onChange={handlePaidAmountChange}
                  placeholder="Rp 0"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-extrabold text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black focus:bg-white"
                />
                <p className={`mt-2 text-xs ${numericPaidAmount > 0 && numericPaidAmount < minimumDpAmount ? "text-rose-500" : "text-gray-400"}`}>
                  Isi nominal DP yang sudah ditransfer, minimal {formattedMinimumDp}.
                </p>
              </div>

              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                Upload Bukti Pembayaran
              </p>

              {isCompressing ? (
                <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-4 border-gray-200 bg-gray-50">
                  <svg className="animate-spin h-8 w-8 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Mengompres gambar...</p>
                    <p className="text-xs text-gray-400 mt-1">Mengoptimalkan ukuran di bawah 1MB</p>
                  </div>
                </div>
              ) : !preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-4 cursor-pointer transition-all duration-200 ${
                    dragging
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5
                           m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Pilih atau seret foto di sini</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG hingga 10MB</p>
                  </div>
                  <span className="text-xs font-semibold text-black border border-black px-4 py-1.5 rounded-full hover:bg-black hover:text-white transition-colors">
                    Pilih File
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                  <img src={preview} alt="Bukti pembayaran" className="w-full object-contain max-h-[500px] bg-gray-100/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <p className="text-xs font-semibold text-white truncate max-w-[160px]">{file?.name}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!file || !preview || numericPaidAmount < minimumDpAmount || isUploading}
              className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                file && preview && numericPaidAmount >= minimumDpAmount && !isUploading
                  ? "bg-black text-white hover:bg-gray-900 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengunggah...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6
                         m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25
                         V6.75A2.25 2.25 0 0019.5 4.5h-15
                         a2.25 2.25 0 00-2.25 2.25v10.5
                         A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  Saya Sudah Bayar
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
              <p className="text-xs text-gray-400 text-center">
                Pembayaran akan diverifikasi dalam 1×24 jam
              </p>
            </div>
          </>
        ) : (
          /* ── Setelah submit: success screen ── */
          <div className="flex flex-col items-center text-center px-4 py-12">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-black mb-2">Bukti Diterima!</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              Terima kasih! Bukti pembayaran kamu sudah kami terima.
              Tim kami akan memverifikasi dalam 1×24 jam.
            </p>

            {preview && (
              <div className="w-full rounded-2xl overflow-hidden border border-gray-200 mb-6">
                <img src={preview} alt="Bukti" className="w-full object-contain max-h-[500px] bg-gray-50" />
              </div>
            )}

            <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 flex items-center gap-3 mb-6">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75
                       m-3-7.036A11.959 11.959 0 013.598 6
                       11.99 11.99 0 003 9.749
                       c0 5.592 3.824 10.29 9 11.623
                       5.176-1.332 9-6.03 9-11.622
                       0-1.31-.21-2.571-.598-3.751
                       h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-700">Sedang Diverifikasi</p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                  Estimasi 1×24 Jam
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.("home")}
              className="w-full bg-black text-white font-bold text-sm py-4 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
