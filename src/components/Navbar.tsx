import { Lock, GraduationCap, UserCheck } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  isInExamRoom?: boolean;
}

export function Navbar({ currentView, onSelectView, isInExamRoom }: NavbarProps) {
  if (isInExamRoom) return null;

  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand SIGAP */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs font-black text-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight">SIGAP</h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">Kiosk</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Sistem Gembok Aplikasi &amp; Penilaian</p>
          </div>
        </div>

        {/* Mode Switcher Simpel: Siswa / Guru */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
          <button
            id="view-switch-student"
            onClick={() => onSelectView('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentView === 'student'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Siswa</span>
          </button>

          <button
            id="view-switch-teacher"
            onClick={() => onSelectView('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentView === 'teacher'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
}
