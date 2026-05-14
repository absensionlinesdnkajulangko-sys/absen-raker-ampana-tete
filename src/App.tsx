/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { AttendanceForm } from './components/AttendanceForm';
import { GraduationCap } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-lime-200 selection:text-lime-900">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-lime-400/10 blur-[120px]" />
      </div>

      <main className="relative max-w-4xl mx-auto px-4 py-12 md:py-20 lg:py-24">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl shadow-lime-500/20 flex items-center justify-center text-lime-500 mb-2 border-4 border-lime-50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-lime-400/10 to-yellow-400/10" />
            <img 
              src="/touna.png" 
              alt="Logo Instansi" 
              className="w-16 h-16 object-contain relative z-10" 
            />
          </motion.div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] text-slate-900">
                DAFTAR HADIR <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-lime-600 via-lime-500 to-yellow-500">
                  RAPAT KERJA PENDIDIKAN
                </span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="px-4 py-1.5 bg-lime-500/10 rounded-full border border-lime-200">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-lime-700">
                  WILAYAH KECAMATAN
                </p>
              </div>
              <h2 className="text-2xl md:text-4xl font-serif italic text-slate-800 font-medium">
                Ampana Tete
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          <AttendanceForm />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-4">
          <div className="h-px w-12 bg-slate-200 mx-auto" />
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Dikbud Tojo Una-Una
          </p>
        </footer>
      </main>
    </div>
  );
}
