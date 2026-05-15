import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ClipboardList, Building2, Send, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { submitAttendance, AttendanceData } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- PENGATURAN LOKASI (Ganti lat & lng sesuai lokasi acara) ---
const TARGET_COORDS = { lat: -1.2920550000000002, lng: 122.011995 }; 
const MAX_DISTANCE_METERS = 200; 

// --- PENGATURAN TANGGAL DAN WAKTU (WITA - UTC+8) ---
// Format Tanggal: YYYY-MM-DD
const START_DATE = "2026-05-15"; // Contoh Tanggal Mulai Aplikasi Bisa Digunakan
const END_DATE = "2026-05-17";   // Contoh Tanggal Terakhir Aplikasi Bisa Digunakan

const START_HOUR = 8;  // Contoh: Mulai jam 08:00 WITA
const END_HOUR = 18;   // Contoh: Berakhir jam 18:00 WITA

const GAS_URL = "https://script.google.com/macros/s/AKfycbwsaEwCIHCJ2vy8j5FZqNfYRWhfCczdzcQN0gIaVDm8kURcSbL_TMCZe6Y_JEpuTe24/exec";
const SECRET_KEY = "AMPANA_TETE_ACCESS_2024";

export const AttendanceForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<AttendanceData, 'signature'>>({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    namaInstansi: '',
    sheetName: 'Respon Absen',
  });
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Fungsi Cek Validitas Tanggal dan Waktu (WITA)
  const isTimeAndDateValid = () => {
    // Ambil waktu UTC saat ini dan konversi ke WITA (UTC+8)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const witaTime = new Date(utcTime + (3600000 * 8));
    
    // 1. Validasi Rentang Tanggal
    const start = new Date(`${START_DATE}T00:00:00+08:00`);
    const end = new Date(`${END_DATE}T23:59:59+08:00`);
    
    if (witaTime < start || witaTime > end) {
      return { 
        valid: false, 
        reason: `Aplikasi ini hanya dapat digunakan dari tanggal ${formatTanggalIndo(START_DATE)} sampai ${formatTanggalIndo(END_DATE)}.` 
      };
    }

    // 2. Validasi Rentang Jam
    const currentHour = witaTime.getHours();
    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
      return { 
        valid: false, 
        reason: `Maaf, absensi hanya aktif pukul ${START_HOUR.toString().padStart(2, '0')}:00 - ${END_HOUR.toString().padStart(2, '0')}:00 WITA.` 
      };
    }

    return { valid: true, reason: '' };
  };

  // Helper untuk mempercantik format tanggal di pesan error
  const formatTanggalIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  // Fungsi Hitung Jarak
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    // 1. Verifikasi Tanggal & Waktu Pertama
    const timeCheck = isTimeAndDateValid();
    if (!timeCheck.valid) {
      setErrorMsg(timeCheck.reason);
      setStatus('error');
      return;
    }
    
    if (!signature) {
      setErrorMsg('Tanda tangan wajib diisi');
      setStatus('error');
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Browser Anda tidak mendukung fitur lokasi.');
      setStatus('error');
      return;
    }

    // 2. Verifikasi Lokasi
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, TARGET_COORDS.lat, TARGET_COORDS.lng);

        if (distance > MAX_DISTANCE_METERS) {
          setErrorMsg(`Maaf.. Datang Rapat Lea... (${Math.round(distance)}m). Batas maksimal adalah ${MAX_DISTANCE_METERS}m.`);
          setStatus('error');
          return;
        }

        try {
          await submitAttendance(GAS_URL, { ...formData, signature, accessKey: SECRET_KEY } as any);
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setErrorMsg('Terjadi kesalahan saat mengirim data ke server.');
        }
      },
      (error) => {
        setStatus('error');
        setErrorMsg('Harap aktifkan GPS dan izinkan akses lokasi di browser Anda.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white/80 backdrop-blur-md rounded-3xl border border-lime-100 shadow-2xl shadow-lime-500/10"
      >
        <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center text-lime-600">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Absensi Berhasil!</h2>
          <p className="text-slate-600">Terima kasih telah melakukan pengisian daftar hadir.</p>
        </div>
        <button 
          onClick={() => { setStatus('idle'); setSignature(null); setFormData({ ...formData, namaLengkap: '', nip: '', jabatan: '', namaInstansi: '' }); }}
          className="px-8 py-3 bg-lime-500 text-lime-950 rounded-full font-bold shadow-lg shadow-lime-500/20 hover:bg-lime-400 transition-all hover:scale-105 active:scale-95"
        >
          Isi Kembali
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-lime-900/5"
      onSubmit={handleSubmit}
    >
        <div className="flex justify-center w-full mb-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            <MapPin size={12} />
            Area Terverifikasi (Radius {MAX_DISTANCE_METERS}m)
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <User size={14} className="group-focus-within:text-lime-500" />
            Nama Lengkap (Wajib)
          </label>
          <input
            required
            type="text"
            name="namaLengkap"
            value={formData.namaLengkap}
            onChange={handleInputChange}
            placeholder="Ketik nama lengkap dengan gelar"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <ClipboardList size={14} className="group-focus-within:text-lime-500" />
            NIP (Opsional)
          </label>
          <input
            type="text"
            name="nip"
            value={formData.nip}
            onChange={handleInputChange}
            placeholder="Ketik NIP (Jika ada)"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <Building2 size={14} className="group-focus-within:text-lime-500" />
            Jabatan (Wajib)
          </label>
          <input
            required
            type="text"
            name="jabatan"
            value={formData.jabatan}
            onChange={handleInputChange}
            placeholder="Ketik Jabatan Anda"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <Building2 size={14} className="group-focus-within:text-lime-500" />
            Nama Instansi (Wajib)
          </label>
          <input
            required
            type="text"
            name="namaInstansi"
            value={formData.namaInstansi}
            onChange={handleInputChange}
            placeholder="Ketik nama instansi/Sekolah"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>
      </div>

      <SignaturePad 
        onSave={setSignature}
        onClear={() => setSignature(null)}
      />

      <AnimatePresence>
        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
          >
            <AlertCircle size={18} />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lime-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
          status === 'submitting' 
            ? "bg-slate-200 cursor-not-allowed opacity-50" 
            : "bg-linear-to-r from-lime-400 to-yellow-400 hover:from-lime-300 hover:to-yellow-300 shadow-lg shadow-lime-500/20"
        )}
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Sedang Memproses...
          </>
        ) : (
          <>
            <Send size={20} />
            Kirim Daftar Hadir
          </>
        )}
      </button>
    </motion.form>
  );
};
