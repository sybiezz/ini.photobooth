import { useState } from "react";
import Navbar from "./Navbar";
import jsPDF from "jspdf";
import { getInvoiceLogoDataUrl } from "../utils/pdfLogo";

const INVOICE = {
  invoiceNumber: "PH-94021",
  issueDate: "14 Des 2024",
  status: "MENUNGGU PELUNASAN",
  client: {
    name: "Shahnaz",
    email: "shahnaz@gmail.com",
    phone: "+62 800 000 0000",
  },
  event: {
    date: "Sabtu, 14 Des 2024",
    time: "19:00 - 23:00",
    duration: "4 Jam",
    location: "The Glasshouse Estate",
    address: "Beverly Hills, CA 90210",
  },
  package: {
    name: "Photo Print Unlimited 2 Jam - 2R",
    description: "Termasuk cetak tanpa batas & layanan photobooth",
    qty: 1,
    price: 1500000,
  },
  dpPercent: 50,
  payment: {
    bank: "BCA",
    accountName: "INI PHOTOBOOTH",
    accountNumber: "1234567890",
  },
};

const ADMIN_WHATSAPP_NUMBER = "088290478695";

function formatRp(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function normalizeWhatsAppNumber(phone = "") {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;

  return digits;
}

function DrawerMenu({ open, onClose, onNavigate }) {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
          />
        </svg>
      ),
    },
    {
      id: "package",
      label: "Package",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
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

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 leading-snug">{value}</p>
    </div>
  );
}

export default function InvoicePage({ onNavigate, data = INVOICE }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const total = data.package.price * data.package.qty;
  const paid = data.paidAmount || 0;
  const remaining = data.remainingAmount ?? Math.max(total - paid, 0);
  const isPaid = data.status === "LUNAS";
  const isVerified = Boolean(data.isVerified) || data.status === "DP TERBAYAR" || isPaid;
  const whatsappNumber = normalizeWhatsAppNumber(ADMIN_WHATSAPP_NUMBER);
  const whatsappMessage = encodeURIComponent(
    `Halo admin, saya sudah melakukan pembayaran untuk invoice ${data.invoiceNumber}.\n\nNama: ${data.client.name}\nTelepon: ${data.client.phone}\nPaket: ${data.package.name}\nTanggal: ${data.event.date}\nWaktu: ${data.event.time}\nDP dibayar: ${formatRp(paid)}\nStatus: ${data.status}`
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : "";

  const downloadPDF = async () => {
    if (!isVerified) return;

    const logoInfo = await getInvoiceLogoDataUrl();
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    const right = pageWidth - margin;
    let y;

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
      const lines = pdf.splitTextToSize(String(value || "-"), width);
      pdf.text(lines, x, top + 6);
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
    pdf.text(`#${data.invoiceNumber}`, right, 27, { align: "right" });

    pdf.setFillColor(59, 130, 246);
    pdf.roundedRect(right - 36, 33, 36, 8, 4, 4, "F");
    setText(7, "bold", [255, 255, 255]);
    pdf.text(data.status, right - 18, 38.2, { align: "center" });

    y = 60;
    roundedRect(margin, y, contentWidth, 32, [255, 255, 255]);
    labelValue("Diterbitkan", data.issueDate, margin + 8, y + 11, 45);
    labelValue("Klien", data.client.name, margin + 64, y + 11, 42);
    labelValue("Telepon", data.client.phone, margin + 118, y + 11, 50);
    y += 42;

    roundedRect(margin, y, contentWidth, 62, [249, 250, 251]);
    setText(11, "bold", [17, 24, 39]);
    pdf.text("Detail Acara", margin + 8, y + 11);
    labelValue("Tanggal", data.event.date, margin + 8, y + 23, 52);
    labelValue("Paket", data.package.name, margin + 68, y + 23, 50);
    labelValue("Jenis Acara", data.event.jenisAcara, margin + 126, y + 23, 46);
    labelValue("Lokasi", data.event.location, margin + 8, y + 43, 52);
    labelValue("Durasi", `${data.event.time} | ${data.event.duration}`, margin + 68, y + 43, 50);
    labelValue("Catatan", data.event.catatan, margin + 126, y + 43, 46);
    y += 72;

    setText(11, "bold", [17, 24, 39]);
    pdf.text("Rincian Pesanan", margin, y);
    y += 6;

    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(margin, y, contentWidth, 10, 3, 3, "F");
    setText(8, "bold", [255, 255, 255]);
    pdf.text("ITEM", margin + 6, y + 6.5);
    pdf.text("QTY", right - 48, y + 6.5, { align: "right" });
    pdf.text("HARGA", right - 6, y + 6.5, { align: "right" });
    y += 10;

    roundedRect(margin, y, contentWidth, 28, [255, 255, 255]);
    setText(10, "bold", [17, 24, 39]);
    pdf.text(pdf.splitTextToSize(data.package.name, 90), margin + 6, y + 8);
    setText(8, "normal", [107, 114, 128]);
    pdf.text(pdf.splitTextToSize(data.package.description, 90), margin + 6, y + 18);
    setText(10, "bold", [17, 24, 39]);
    pdf.text(String(data.package.qty), right - 48, y + 14, { align: "right" });
    pdf.text(formatRp(total), right - 6, y + 14, { align: "right" });
    y += 38;

    roundedRect(right - 72, y, 72, 46, [249, 250, 251]);
    const totalRow = (label, value, top, bold = false, color = [17, 24, 39]) => {
      setText(9, bold ? "bold" : "normal", color);
      pdf.text(label, right - 66, top);
      pdf.text(value, right - 6, top, { align: "right" });
    };

    // Catatan pembayaran di sebelah kiri kotak summary (baris yang sama)
    if (isPaid) {
      setText(9, "bold", [22, 163, 74]);
      pdf.text("Pembayaran lunas.", margin, y + 16);
      setText(8, "normal", [22, 163, 74]);
      pdf.text("Terima kasih telah memilih ini.photobooth!", margin, y + 24);
    } else {
      const noteBoxWidth = right - 72 - margin - 8;
      roundedRect(margin, y, noteBoxWidth, 46, [255, 251, 235], [253, 230, 138]);
      setText(9, "bold", [146, 64, 14]);
      pdf.text("Catatan Pembayaran", margin + 8, y + 12);
      setText(8, "normal", [146, 64, 14]);
      const noteLines = pdf.splitTextToSize("DP sudah diverifikasi. Pelunasan maksimal H-1 sebelum acara.", noteBoxWidth - 16);
      pdf.text(noteLines, margin + 8, y + 22);
    }

    totalRow("Total", formatRp(total), y + 10);
    totalRow("Sudah Dibayar", formatRp(paid), y + 20, true, [22, 163, 74]);
    totalRow("Sisa", formatRp(remaining), y + 30, true, [239, 68, 68]);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(right - 66, y + 35, right - 6, y + 35);
    totalRow("Status", data.status, y + 42, true, [17, 24, 39]);
    y += 56;

    setText(8, "normal", [156, 163, 175]);
    pdf.text("Terima kasih telah memilih ini.photobooth.", pageWidth / 2, 282, { align: "center" });

    pdf.save(`invoice-${data.invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={onNavigate} activePage="package" />

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
        <div className="mt-8 mb-7 text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
            Invoice #{data.invoiceNumber}
          </p>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Invoice Pemesanan</h1>
          <p className="mt-2 text-gray-400 text-sm">Detail pembayaran untuk reservasi photobooth kamu.</p>
        </div>

        <div id="invoice" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <img src="/logo - Copy.png" alt="ini.photobooth" className="h-10 w-auto object-contain invert" />
              <p className="text-xs text-gray-400 mt-0.5">Diterbitkan {data.issueDate}</p>
            </div>
            <span
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                isPaid
                  ? "bg-green-50 text-green-600"
                  : isVerified
                    ? "bg-blue-50 text-blue-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              {data.status}
            </span>
          </div>

          <div className="px-5 py-5 grid grid-cols-2 gap-4 border-b border-gray-100">
            <InfoItem label="Klien" value={data.client.name} />
            <InfoItem label="Telepon" value={data.client.phone} />
            <InfoItem label="Email" value={data.client.email} />
            <InfoItem label="Tanggal" value={data.event.date} />
            <InfoItem label="Paket" value={data.package.name} />
            <InfoItem label="Jenis Acara" value={data.event.jenisAcara} />
            <InfoItem label="Lokasi" value={data.event.location} />
            <InfoItem label="Durasi" value={`${data.event.time} | ${data.event.duration}`} />
            <InfoItem label="Catatan" value={data.event.catatan} />
          </div>

          <div className="px-5 py-5 border-b border-gray-100">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
              Detail Pesanan
            </p>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{data.package.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{data.package.description}</p>
                <p className="text-xs text-gray-400 mt-1">Qty: {data.package.qty}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatRp(total)}</p>
            </div>
          </div>

          <div className="px-5 py-5 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-sm font-semibold text-gray-900">{formatRp(total)}</p>
            </div>
            <div className="flex items-center justify-between text-green-600">
              <p className="text-sm">Sudah Dibayar</p>
              <p className="text-sm font-semibold">{formatRp(paid)}</p>
            </div>
            <div className={`flex items-center justify-between ${remaining > 0 ? "text-red-500" : "text-gray-400"}`}>
              <p className="text-sm">Sisa</p>
              <p className="text-sm font-semibold">{formatRp(remaining)}</p>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex items-end justify-between">
              <div>
                <p className="text-base font-bold text-black">Status</p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-0.5">
                  {isPaid
                    ? "Sudah Lunas"
                    : isVerified
                      ? "DP sudah diverifikasi"
                      : "Menunggu verifikasi admin"}
                </p>
              </div>
              <p className={`text-lg font-extrabold tracking-tight ${isPaid ? "text-green-600" : "text-black"}`}>
                {data.status}
              </p>
            </div>
          </div>

          {!isPaid && (
          <div className="px-5 py-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
              Instruksi Pembayaran
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Bank</p>
                <p className="text-xs font-bold text-gray-800">{data.payment.bank}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Nama Rekening</p>
                <p className="text-xs font-bold text-gray-800">{data.payment.accountName}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">No Rekening</p>
                <p className="text-xs font-bold text-gray-800">{data.payment.accountNumber}</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-amber-600 font-semibold leading-relaxed">
                  DP minimal 30% untuk mengamankan tanggal.
                </p>
                <p className="text-xs text-amber-600 font-semibold leading-relaxed mt-1">
                  Pelunasan maksimal H-1 sebelum acara.
                </p>
              </div>
            </div>
          </div>
          )}

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Terima kasih telah memilih <span className="font-semibold text-gray-600">ini.photobooth</span>.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={downloadPDF}
            disabled={!isVerified}
            className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border font-bold text-sm transition-colors ${
              isVerified
                ? "bg-white border-gray-200 text-gray-800 hover:border-black"
                : "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isVerified ? "Download PDF" : "Menunggu Verifikasi"}
          </button>
          <a
            href={whatsappUrl || undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              if (!whatsappUrl) event.preventDefault();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all ${
              whatsappUrl
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
