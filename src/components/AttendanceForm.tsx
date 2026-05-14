import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ClipboardList, Building2, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { submitAttendance, AttendanceData } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GAS_URL = "YOUR_GAS_WEB_APP_URL"; // User manual input later
const SECRET_KEY = "AMPANA_TETE_ACCESS_2024"; // Simple pre-shared key for security

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signature) {
      setErrorMsg('Tanda tangan wajib diisi');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      if (GAS_URL === "YOUR_GAS_WEB_APP_URL") {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
      } else {
        // Send with secret key for verification
        await submitAttendance(GAS_URL, { ...formData, signature, accessKey: SECRET_KEY } as any);
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Gagal mengirim absensi. Pastikan URL Google Apps Script sudah benar.');
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name Input */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <User size={14} className="group-focus-within:text-lime-500" />
            Nama Lengkap (wajib di isi)
          </label>
          <input
            required
            type="text"
            name="namaLengkap"
            value={formData.namaLengkap}
            onChange={handleInputChange}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        {/* NIP Input */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <ClipboardList size={14} className="group-focus-within:text-lime-500" />
            NIP (tidak wajib di isi)
          </label>
          <input
            type="text"
            name="nip"
            value={formData.nip}
            onChange={handleInputChange}
            placeholder="Masukkan NIP"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        {/* Jabatan Input */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <Building2 size={14} className="group-focus-within:text-lime-500" />
            Jabatan (wajib di isi)
          </label>
          <input
            required
            type="text"
            name="jabatan"
            value={formData.jabatan}
            onChange={handleInputChange}
            placeholder="Contoh: Kepala Sekolah"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-400/10 transition-all outline-none"
          />
        </div>

        {/* Instansi Input */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-lime-600 transition-colors">
            <Building2 size={14} className="group-focus-within:text-lime-500" />
            Nama Instansi (wajib di isi)
          </label>
          <input
            required
            type="text"
            name="namaInstansi"
            value={formData.namaInstansi}
            onChange={handleInputChange}
            placeholder="Masukkan nama instansi"
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
            Sedang Mengirim...
          </>
        ) : (
          <>
            <Send size={20} />
            Kirim Daftar Hadir
          </>
        )}
      </button>
      
      {GAS_URL === "YOUR_GAS_WEB_APP_URL" && (
        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest px-4">
          Mode Preview: Silakan masukkan URL Google Apps Script untuk integrasi penuh.
        </p>
      )}
    </motion.form>
  );
};
