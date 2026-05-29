import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import HomePage           from "./components/HomePage";
import BookingAvailability from "./components/BookingAvailability";
import PackagePage        from "./components/PackagePage";
import BookingForm        from "./components/BookingForm";
import BookingSummary     from "./components/BookingSummary";
import PaymentPage        from "./components/PaymentPage";
import InvoicePage        from "./components/InvoicePage";
import AdminPage          from "./components/AdminPage";

// ── Helpers ───────────────────────────────────────────────────────
function calculateHours(start, end) {
  if (!start || !end) return null;
  try {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hrs = totalMinutes / 60;
    return hrs > 0 ? hrs : null;
  } catch (e) {
    return null;
  }
}

const PAGE_PATHS = {
  home:     "/",
  calendar: "/calendar",
  package:  "/package",
  form:     "/form",
  summary:  "/summary",
  payment:  "/payment",
  invoice:  "/invoice",
  admin:    "/admin",
};

const ACTIVE_BOOKING_STORAGE_KEY = "photobooth_active_booking";

const EMPTY_BOOKING = {
  id:            null,
  date:          null,
  package:       null,
  form:          null,
  paidAmount:    0,
  proofImage:    null,
  proofFileName: "",
  isVerified:    false,
  status:        "MENUNGGU VERIFIKASI",
};

function getPageFromPath(pathname) {
  return (
    Object.entries(PAGE_PATHS).find(([, path]) => path === pathname)?.[0] || "home"
  );
}

function loadStoredValue(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

export default function App() {
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  // Data booking yang sedang berjalan (satu sesi user)
  const [bookingData, setBookingData] = useState(() =>
    loadStoredValue(ACTIVE_BOOKING_STORAGE_KEY, EMPTY_BOOKING)
  );

  // Semua booking yang masuk — diambil dari Supabase
  const [bookings, setBookings] = useState([]);

  // Fungsi untuk mengambil data dari Supabase
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal mengambil data:", error.message);
    } else {
      const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      const formattedData = data.map(b => {
        const [year, monthNum, day] = b.tanggal_booking.split('-').map(Number);
        const jsMonth = monthNum - 1; 
        const dateObj = new Date(year, jsMonth, day);
        const dayName = DAY_NAMES[dateObj.getDay()];
        const monthName = MONTH_NAMES[jsMonth];

        return {
          id: b.id,
          isVerified: b.is_verified,
          paidAmount: Number(b.paid_amount) || 0,
          proofImage: b.proof_image,
          status: b.is_verified ? "VERIFIED" : "PENDING",
          package: {
            title: b.paket,
            total: b.total_harga,
            hours: b.paket?.includes("2 Jam") ? 2 : (b.paket?.includes("4 Jam") ? 4 : calculateHours(b.waktu_mulai, b.waktu_selesai)), 
          },
          date: { 
            day, 
            month: jsMonth, 
            year,
            monthName,
            dayName
          },
          form: {
            nama: b.nama,
            telepon: b.telepon,
            email: b.email,
            jenisAcara: b.jenis_acara,
            lokasi: b.lokasi,
            waktuMulai: b.waktu_mulai,
            waktuSelesai: b.waktu_selesai,
            catatan: b.catatan
          }
        };
      });
      setBookings(formattedData);
    }
  };

  // Setup Realtime & Fetch awal
  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log("🔥 Ada perubahan di database!", payload);
          fetchBookings();
        }
      )
      .subscribe((status) => {
        console.log("📡 Status Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handlePop = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    saveStoredValue(ACTIVE_BOOKING_STORAGE_KEY, bookingData);
  }, [bookingData]);

  // Reset data booking ketika user kembali ke beranda atau memulai booking baru
  // setelah proses pemesanan sebelumnya selesai (id tidak null).
  useEffect(() => {
    if ((page === "home" || page === "calendar") && bookingData.id) {
      setBookingData(EMPTY_BOOKING);
    }
  }, [page, bookingData.id]);

  const navigate = (nextPage) => {
    const path = PAGE_PATHS[nextPage] || PAGE_PATHS.home;
    window.history.pushState({}, "", path);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => window.history.back();

  const handlePaymentSubmit = async (paymentDetail) => {
    if (!bookingData.id) {
      alert("ID Booking tidak ditemukan. Silakan ulangi dari awal.");
      return;
    }

    let proofUrl = paymentDetail.proofImage; // default fallback (base64)

    // Jika ada file hasil kompresi, unggah ke Supabase Storage
    if (paymentDetail.proofFile) {
      const file = paymentDetail.proofFile;

      // Bersihkan data booking untuk nama file yang rapi di Storage
      const customerName = (bookingData.form?.nama || "Customer").trim().replace(/[^a-zA-Z0-9]/g, "_");
      const bookingIdShort = bookingData.id ? String(bookingData.id).slice(-5) : "NEW";
      const bookingDateStr = bookingData.date 
        ? `${bookingData.date.year}-${bookingData.date.month + 1}-${bookingData.date.day}`
        : "NoDate";
      const packageName = (bookingData.package?.title || "Package").trim().replace(/[^a-zA-Z0-9]/g, "_");
      const timestamp = Date.now();

      // Menghasilkan nama seperti: BuktiBayar_CustomerName_ID-abcde_Tgl-2026-5-20_Paket-Basic_1779263.jpg
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `BuktiBayar_${customerName}_ID-${bookingIdShort}_Tgl-${bookingDateStr}_Paket-${packageName}_${timestamp}.${fileExt}`;
      const filePath = `proofs/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Gagal mengunggah bukti ke Storage:", uploadError);
        throw new Error("Gagal mengunggah gambar ke Storage Supabase: " + uploadError.message);
      }

      // Ambil Public URL hasil unggahan
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      proofUrl = urlData.publicUrl;
    }

    const { error: dbError } = await supabase
      .from('bookings')
      .update({
        paid_amount: paymentDetail.paidAmount,
        proof_image: proofUrl
      })
      .eq('id', bookingData.id);

    if (dbError) {
      console.error("Gagal memperbarui database bookings:", dbError);
      throw new Error("Gagal menyimpan data pembayaran ke database: " + dbError.message);
    }

    setBookingData((prev) => ({
      ...prev,
      paidAmount:    paymentDetail.paidAmount,
      proofImage:    proofUrl,
      proofFileName: paymentDetail.proofFileName,
      status:        "MENUNGGU VERIFIKASI",
    }));

    navigate("invoice");
  };

  const handleAdminVerify = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ is_verified: true })
      .eq('id', id);

    if (error) {
      alert("Gagal verifikasi: " + error.message);
    }
  };

  const handleAdminDelete = async (id) => {
    if (!window.confirm("Hapus booking ini?")) return;
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  const formatInvoiceData = () => {
    const current = bookings.find((b) => b.id === bookingData.id) || bookingData;
    const pkg     = current.package || {};
    const form    = current.form    || {};
    const date    = current.date    || {};

    return {
      invoiceNumber: current.id ? `PH-${String(current.id).slice(-5)}` : "PH-NEW",
      issueDate: new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      }),
      status: (() => {
        const total = Number(pkg.total || pkg.price || 0);
        const paid  = Number(current.paidAmount || 0);
        if (current.isVerified && paid >= total && total > 0) return "LUNAS";
        if (current.isVerified) return "DP TERBAYAR";
        return "MENUNGGU VERIFIKASI";
      })(),
      isVerified: Boolean(current.isVerified),
      client: {
        name:  form.nama    || "Guest",
        email: form.email   || "-",
        phone: form.telepon || "-",
      },
      event: {
        date: date.dayName ? `${date.dayName}, ${date.day} ${date.monthName} ${date.year}` : "-",
        time:     `${form.waktuMulai || "-"} - ${form.waktuSelesai || "-"}`,
        duration: pkg.hours ? `${pkg.hours} Jam` : "-",
        location: form.lokasi || "-",
        jenisAcara: form.jenisAcara || "-",
        catatan: form.catatan || "-",
      },
      package: {
        name:        pkg.title || "Paket Belum Dipilih",
        description: pkg.size  ? `Ukuran Cetak: ${pkg.size}` : "-",
        qty:         1,
        price:       pkg.total || pkg.price || 0,
      },
      paidAmount: current.paidAmount || 0,
      payment: {
        bank:          "BCA",
        accountName:   "INI PHOTOBOOTH",
        accountNumber: "6611205519",
      },
    };
  };

  const sharedProps = {
    bookingData,
    bookings,
    setBookingData,
    onNavigate: navigate,
    onBack:     goBack,
  };

  const renderPage = () => {
    switch (page) {
      case "calendar": return <BookingAvailability {...sharedProps} />;
      case "package":  return <PackagePage {...sharedProps} />;
      case "form":     return <BookingForm {...sharedProps} />;
      case "summary":  return <BookingSummary {...sharedProps} />;
      case "payment":
        return (
          <PaymentPage
            {...sharedProps}
            totalAmount={bookingData.package?.total || bookingData.package?.price || 0}
            onSubmitPayment={handlePaymentSubmit}
          />
        );
      case "invoice":
        return <InvoicePage onNavigate={navigate} data={formatInvoiceData()} />;
      case "admin":
        return <AdminPage bookings={bookings} onVerify={handleAdminVerify} onDelete={handleAdminDelete} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderPage()}
    </div>
  );
}
