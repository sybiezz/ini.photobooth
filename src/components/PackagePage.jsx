import { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";

// ── Data ─────────────────────────────────────────────────────────

const PRINT_SIZES = ["2R", "4R"];
const BASE_PRICE = { "2R": 1500000, "4R": 1700000 };
const HOURS = [2, 3, 4, 5, 6];
const PRICE_PER_EXTRA_HOUR = 300000;

const PACKAGES = PRINT_SIZES.flatMap((size) =>
  HOURS.map((hour) => ({
    id: `${hour}jam-${size}`,
    title: `Photo Print Unlimited ${hour} Jam - ${size}`,
    hours: hour,
    size,
    price: BASE_PRICE[size] + (hour - 2) * PRICE_PER_EXTRA_HOUR,
  }))
);

function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// ── Package Info Descriptions ─────────────────────────────────────

const PACKAGE_INFO = {
  "2R": {
    title: "📸 Paket Photobooth 2R",
    tagline: "Cocok untuk acara ramai & fun ✨",
    description:
      "Photostrip ukuran 2R dengan hasil cetak compact dan estetik.\nIdeal untuk event sekolah, campus event, birthday, gathering, hingga wedding dengan banyak guest.",
    features: [
      "Unlimited photo session",
      "Custom design frame",
      "High quality print",
      "Softcopy realtime langsung dikirim saat acara",
      "Fast printing process",
      "Free ongkir area tertentu",
    ],
    printSize: "2R Photostrip (compact size)",
    highlight: "Pilihan terbaik untuk event dengan jumlah tamu besar.",
  },
  "4R": {
    title: "🖼️ Paket Photobooth 4R",
    tagline: "Bigger print, bigger memories 💫",
    description:
      "Hasil cetak lebih besar dengan kualitas premium dan detail foto lebih maksimal.\nCocok untuk wedding, corporate event, sweet seventeen, dan acara eksklusif lainnya.",
    features: [
      "Unlimited photo session",
      "Premium print quality",
      "Custom design frame",
      "Softcopy realtime langsung dikirim saat acara",
      "Elegant & exclusive result",
      "Free ongkir area tertentu",
    ],
    printSize: "4R Photo Print",
    highlight: "Perfect for guests who want a more premium photobooth experience.",
  },
};

// ── Sub-components ────────────────────────────────────────────────

function PackageInfoPanel({ info, isOpen }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, info]);

  return (
    <div
      className="overflow-hidden transition-all duration-500 ease-in-out"
      style={{ maxHeight: `${height}px`, opacity: isOpen ? 1 : 0 }}
    >
      <div ref={contentRef} className="pb-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 mt-3">
          {/* Title */}
          <h3 className="text-lg font-extrabold text-gray-900 mb-1">{info.title}</h3>
          <p className="text-sm text-gray-500 italic mb-3">{info.tagline}</p>

          {/* Description */}
          {info.description.split("\n").map((line, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed mb-1">
              {line}
            </p>
          ))}

          {/* Features */}
          <div className="mt-3 space-y-1.5">
            {info.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold mt-0.5">✅</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Print size */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">📏 Ukuran hasil cetak:</span>
            </p>
            <p className="text-sm text-gray-700 mt-0.5">{info.printSize}</p>
          </div>

          {/* Highlight */}
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">💡</span> {info.highlight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function PackageCard({ pkg, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all duration-200 active:scale-[0.98] ${
        selected
          ? "bg-black border-black text-white shadow-lg"
          : "bg-white border-gray-200 text-gray-900 hover:border-gray-400 shadow-sm"
      }`}
    >
      {/* Size badge */}
      <span
        className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-2 ${
          selected ? "bg-white text-black" : "bg-gray-100 text-gray-500"
        }`}
      >
        {pkg.size}
      </span>

      {/* Title */}
      <p className={`text-sm font-semibold leading-snug mb-1 ${selected ? "text-white" : "text-gray-800"}`}>
        {pkg.title}
      </p>

      {/* Price */}
      <p className={`text-lg font-extrabold tracking-tight ${selected ? "text-white" : "text-black"}`}>
        {formatRupiah(pkg.price)}
      </p>

      {/* Duration pill */}
      <div className="mt-2 flex items-center gap-1">
        <svg
          className={`w-3.5 h-3.5 ${selected ? "text-gray-300" : "text-gray-400"}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
        <span className={`text-xs ${selected ? "text-gray-300" : "text-gray-400"}`}>
          {pkg.hours} Jam
        </span>
      </div>
    </button>
  );
}

function ExtraSection({ extras, activeExtras, onToggle }) {
  return (
    <div className="mx-4 mb-6 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
      <p className="text-sm font-bold text-gray-800 mb-1">Butuh tambahan ekstra?</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Tambahkan branding khusus, jam tambahan, atau backdrop spesifik ke paket pilihan Anda.
      </p>
      <div className="flex flex-wrap gap-2">
        {extras.map((extra) => {
          const active = activeExtras.includes(extra.id);
          return (
            <button
              key={extra.id}
              onClick={() => onToggle(extra.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-all duration-150 active:scale-95 ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
              }`}
            >
              <span className="text-base leading-none">{active ? "✓" : "+"}</span>
              {extra.label}: {formatRupiah(extra.price)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function PackagePage({ bookingData, setBookingData, onBack, onNavigate: onNavigateProp }) {
  const [selectedId, setSelectedId] = useState(bookingData?.package?.id || null);
  const [activeExtras, setActiveExtras] = useState(bookingData?.package?.extras?.map((extra) => extra.id) || []);
  const [filterSize, setFilterSize] = useState("2R");

  const extras = [
    { id: "jam", label: "Tambah Jam", price: 300000 },
    { id: "props", label: "Props Kustom", price: 500000 },
  ];

  const toggleExtra = (id) => {
    setActiveExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const filteredPackages = PACKAGES.filter((p) => p.size === filterSize);

  const selectedPkg = PACKAGES.find((p) => p.id === selectedId);
  const extraTotal = activeExtras.reduce((sum, id) => {
    const e = extras.find((x) => x.id === id);
    return sum + (e ? e.price : 0);
  }, 0);
  const grandTotal = selectedPkg ? selectedPkg.price + extraTotal : null;

  const handleNavigate = (page) => {
    if (onNavigateProp) onNavigateProp(page);
  };

  const handleContinue = () => {
    if (!selectedPkg) return;

    const selectedExtras = activeExtras
      .map((id) => extras.find((extra) => extra.id === id))
      .filter(Boolean);

    setBookingData((prev) => ({
      ...prev,
      package: {
        ...selectedPkg,
        extras: selectedExtras,
        extrasLabel:
          selectedExtras.length > 0
            ? `Tambahan: ${selectedExtras.map((extra) => extra.label).join(", ")}`
            : "Tanpa tambahan ekstra",
        total: grandTotal,
      },
    }));
    handleNavigate("form");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={handleNavigate} activePage="package" />

      {/* Back */}
      <div className="max-w-md mx-auto px-4">
        <button
          onClick={onBack || (() => handleNavigate("home"))}
          className="mt-5 flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Title */}
      <div className="max-w-md mx-auto px-4 mt-8 mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-black tracking-tight">Pilih Paket Foto</h1>
        <p className="mt-2 text-gray-500 text-sm">Temukan paket yang sesuai untuk acara spesialmu.</p>
      </div>

      {/* Filter Tabs + Info Panel */}
      <div className="max-w-md mx-auto px-4 mb-5">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {["2R", "4R"].map((size) => (
            <button
              key={size}
              onClick={() => setFilterSize(size)}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all duration-200 ${
                filterSize === size
                  ? "bg-black text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Ukuran {size}
            </button>
          ))}
        </div>

        {/* Animated Info Panel */}
        <PackageInfoPanel
          info={PACKAGE_INFO[filterSize]}
          isOpen={true}
        />
      </div>

      {/* Package Grid */}
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selectedId === pkg.id}
              onClick={() => setSelectedId(pkg.id === selectedId ? null : pkg.id)}
            />
          ))}
        </div>
      </div>

      {/* Extra Section */}
      <div className="max-w-md mx-auto mt-4">
        <ExtraSection extras={extras} activeExtras={activeExtras} onToggle={toggleExtra} />
      </div>

      {/* Summary + CTA */}
      <div className="max-w-md mx-auto px-4 pb-10">
        {selectedPkg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Ringkasan</p>
            <div className="flex justify-between items-center text-sm text-gray-700 mb-1">
              <span className="truncate pr-2">{selectedPkg.title}</span>
              <span className="font-semibold whitespace-nowrap">{formatRupiah(selectedPkg.price)}</span>
            </div>
            {activeExtras.map((id) => {
              const e = extras.find((x) => x.id === id);
              return e ? (
                <div key={id} className="flex justify-between items-center text-sm text-gray-500 mb-1">
                  <span>{e.label}</span>
                  <span>+{formatRupiah(e.price)}</span>
                </div>
              ) : null;
            })}
            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-black">Total</span>
              <span className="text-base font-extrabold text-black">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
        )}

        <button
          disabled={!selectedId}
          onClick={handleContinue}
          className={`w-full font-bold text-sm py-4 rounded-2xl transition-all active:scale-95 ${
            selectedId
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selectedId ? "Lanjut ke Pemesanan" : "Pilih Paket Terlebih Dahulu"}
        </button>
      </div>
    </div>
  );
}
