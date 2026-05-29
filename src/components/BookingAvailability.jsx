import { useState } from "react";
import Navbar from "./Navbar";

const DAYS_HEADER = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const START_YEAR = 2026;
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, index) => START_YEAR + index);
const OPEN_MINUTES = 7 * 60;
const CLOSE_MINUTES = 24 * 60;
const BUFFER_MINUTES = 2 * 60;
const MAX_EVENTS_PER_WINDOW = 3;
const SLOT_STEP_MINUTES = 30;

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  if (minutes === CLOSE_MINUTES) return "00.00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}.${String(mins).padStart(2, "0")}`;
}

function formatRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function getInvoiceCode(id) {
  return id ? `PH-${String(id).slice(-5)}` : "PH-NEW";
}

function getBookingEvents(bookings, year, month, selectedDate) {
  return bookings
    .filter((booking) => {
      const date = booking.date || {};
      return date.year === year && date.month === month && date.day === selectedDate;
    })
    .filter((booking) => booking.form?.waktuMulai && booking.form?.waktuSelesai)
    .map((booking) => ({
      start: booking.form.waktuMulai,
      end: booking.form.waktuSelesai,
      slots: booking.isVerified ? "DP terbayar" : "Menunggu verifikasi",
      status: booking.isVerified ? "booked" : "pending",
      invoiceCode: getInvoiceCode(booking.id),
      clientName: booking.form?.nama || "Client",
      packageName: booking.package?.title || "Paket photobooth",
    }));
}

function getBookedEvents(month, year, selectedDate, bookings = []) {
  return getBookingEvents(bookings, year, month, selectedDate);
}

function getAvailabilityRanges(events) {
  const ranges = [];
  let currentRange = null;

  const blockedRanges = events.map((event) => ({
    start: timeToMinutes(event.start) - BUFFER_MINUTES,
    end: timeToMinutes(event.end) + BUFFER_MINUTES,
  }));

  for (let start = OPEN_MINUTES; start < CLOSE_MINUTES; start += SLOT_STEP_MINUTES) {
    const end = Math.min(start + SLOT_STEP_MINUTES, CLOSE_MINUTES);
    const activeCount = blockedRanges.filter(
      (range) => start < range.end && range.start < end
    ).length;
    const isAvailable = activeCount < MAX_EVENTS_PER_WINDOW;

    if (isAvailable && !currentRange) {
      currentRange = { start, end };
    } else if (isAvailable && currentRange) {
      currentRange.end = end;
    } else if (!isAvailable && currentRange) {
      ranges.push(currentRange);
      currentRange = null;
    }
  }

  if (currentRange) ranges.push(currentRange);
  return ranges;
}

function DayCell({ day, status, isOtherMonth = false, isDisabled = false, onClick }) {
  const base = "w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium select-none transition-all duration-150";
  
  let style;
  if (isOtherMonth) {
    style = "text-gray-300 bg-transparent cursor-default";
  } else if (isDisabled) {
    style = "text-gray-200 bg-transparent cursor-not-allowed opacity-40";
  } else if (status === "selected") {
    style = "bg-black text-white cursor-pointer";
  } else if (status === "booked") {
    style = "bg-red-600 text-white cursor-pointer";
  } else if (status === "pending") {
    style = "bg-gray-800 text-white cursor-pointer";
  } else {
    style = "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer";
  }

  return (
    <div className={`${base} ${style}`} onClick={(!isOtherMonth && !isDisabled) ? onClick : undefined}>
      {day}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function BookingAvailability({ bookingData, bookings = [], setBookingData, onBack, onNavigate }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [month, setMonth] = useState(bookingData?.date?.month ?? today.getMonth());
  const [year, setYear] = useState(bookingData?.date?.year ?? today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(bookingData?.date?.day ?? today.getDate());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const checkIfPast = (day) => {
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleMonthChange = (nextMonth) => {
    setMonth(nextMonth);
    setSelectedDate(1);
  };

  const handleYearChange = (nextYear) => {
    setYear(nextYear);
    setSelectedDate(1);
  };

  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
    setSelectedDate(1);
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
    setSelectedDate(1);
  };

  const cells = [];
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let d = startDay - 1; d >= 0; d--) {
    cells.push({ day: prevMonthLastDate - d, isOtherMonth: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, isOtherMonth: false });
  }
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      cells.push({ day: d, isOtherMonth: true });
    }
  }

  const selectedDayName = DAY_NAMES[new Date(year, month, selectedDate).getDay()];
  const bookedEvents = getBookedEvents(month, year, selectedDate, bookings);
  const availabilityRanges = getAvailabilityRanges(bookedEvents);

  const getDayStatus = (day) => {
    if (day === selectedDate) return "selected";
    const dayEvents = getBookedEvents(month, year, day, bookings);
    if (dayEvents.some((event) => event.status === "booked")) return "booked";
    if (dayEvents.some((event) => event.status === "pending")) return "pending";
    return undefined;
  };

  const handleContinue = () => {
    if (checkIfPast(selectedDate)) {
      alert("Maaf, kamu tidak bisa memesan tanggal yang sudah lewat.");
      return;
    }
    setBookingData((prev) => ({
      ...prev,
      date: {
        day: selectedDate,
        month,
        monthName: MONTH_NAMES[month],
        year,
        dayName: selectedDayName,
      },
    }));
    onNavigate("package");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <Navbar onNavigate={onNavigate} activePage="home" />

      <main className="max-w-md mx-auto px-4 pb-10">
        <button onClick={onBack} className="mt-5 flex items-center gap-1 text-sm text-gray-500 hover:text-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="mt-8 mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Cek Ketersediaan</h1>
          <p className="mt-2 text-gray-500 text-sm">Pilih tanggal terbaik untuk mengabadikan momenmu.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <select value={month} onChange={(e) => handleMonthChange(Number(e.target.value))} className="rounded-full bg-gray-100 py-2 pl-4 pr-9 text-sm font-bold text-black outline-none">
                {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
              </select>
              <select value={year} onChange={(e) => handleYearChange(Number(e.target.value))} className="rounded-full bg-gray-100 py-2 pl-4 pr-9 text-sm font-bold text-black outline-none">
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100" onClick={goToPreviousMonth}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100" onClick={goToNextMonth}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS_HEADER.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, i) => {
              const isDisabled = !cell.isOtherMonth && checkIfPast(cell.day);
              return (
                <div key={i} className="flex justify-center">
                  <DayCell
                    day={cell.day}
                    isOtherMonth={cell.isOtherMonth}
                    isDisabled={isDisabled}
                    status={!cell.isOtherMonth ? getDayStatus(cell.day) : undefined}
                    onClick={() => handleDayClick(cell.day)}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
            <LegendItem color="bg-gray-200" label="Tersedia" />
            <LegendItem color="bg-red-600" label="Terisi" />
            <LegendItem color="bg-gray-800" label="Menunggu" />
          </div>
        </div>

        <div className="mt-4 bg-black text-white rounded-2xl px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Tanggal Terpilih</p>
          <h2 className="text-2xl font-bold">{selectedDayName}</h2>
          <p className="text-gray-400 text-sm mb-4">{MONTH_NAMES[month]} {selectedDate}, {year}</p>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-gray-300">Terisi:</p>
              <div className="space-y-1 text-right">
                {bookedEvents.length > 0 ? bookedEvents.map((e, idx) => (
                  <div key={idx} className="rounded-xl bg-white/10 px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${e.status === 'booked' ? 'bg-red-500' : 'bg-gray-600'}`}>{e.invoiceCode}</span>
                      <p className="text-sm font-bold">{e.start} - {e.end}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500">Belum ada</p>}
              </div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-gray-300">Tersedia:</p>
              <div className="space-y-1 text-right">
                {availabilityRanges.length > 0 ? availabilityRanges.map((r, idx) => (
                  <p key={idx} className="text-sm font-semibold text-green-400">{formatRange(r.start, r.end)}</p>
                )) : <p className="text-sm font-semibold text-red-400">Tidak tersedia</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleContinue} className="bg-black text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all">Lanjut</button>
        </div>
      </main>
    </div>
  );
}
