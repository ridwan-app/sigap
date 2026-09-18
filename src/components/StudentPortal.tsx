import { useState, FormEvent, useCallback } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  LogOut,
  Calendar,
  Smartphone,
  X,
  QrCode,
  Link as LinkIcon,
  ShieldCheck,
  Camera,
  RefreshCw,
  School,
  User,
  Key,
  FileText,
  BookMarked,
  Sparkles,
  GraduationCap,
  Globe,
  FileType,
  ExternalLink,
  PlayCircle
} from 'lucide-react';
import { Exam, StudentSession, AuthUser } from '../types';
import { FuturisticHeaderOrnament } from './FuturisticHeaderOrnament';
import { RealQrScanner } from './RealQrScanner';

interface StudentPortalProps {
  exams: Exam[];
  schoolName: string;
  schoolLogoUrl?: string;
  currentUser: AuthUser;
  onStartExam: (exam: Exam, studentData: { name: string; classRoom: string; nisn: string }) => void;
  completedExamSession: StudentSession | null;
  onResetCompletedSession: () => void;
  onLogout: () => void;
}

export function StudentPortal({
  exams,
  schoolName,
  schoolLogoUrl,
  currentUser,
  onStartExam,
  completedExamSession,
  onResetCompletedSession,
  onLogout,
}: StudentPortalProps) {
  // Hanya tampilkan soal yang aktif, sesuai dengan kelas siswa, DAN memenuhi target penugasan (Semua Siswa atau Siswa Tertentu)
  const studentClassNorm = (currentUser.classRoom || '').toLowerCase().replace(/\s+/g, '');
  const studentNisn = (currentUser.identifier || '').trim();

  // Filter paket yang sesuai kelas dan siswa
  const availableItems = exams.filter(e => {
    if (!e.isActive) return false;

    // 1. Cek Kesesuaian Kelas
    const examClassNorm = (e.classLevel || '').toLowerCase().replace(/\s+/g, '');
    if (studentClassNorm && !examClassNorm.includes(studentClassNorm) && !studentClassNorm.includes(examClassNorm)) {
      return false;
    }

    // 2. Cek Target Siswa Khusus / Remedial
    if (e.targetStudentNisns && e.targetStudentNisns.length > 0) {
      if (!studentNisn || !e.targetStudentNisns.includes(studentNisn)) {
        return false;
      }
    }

    return true;
  });

  // Pisahkan antara Ujian Murni dan E-Learning (Materi Belajar)
  const activeExams = availableItems.filter(e => e.examType !== 'material_document');
  const activeMaterials = availableItems.filter(e => e.examType === 'material_document');

  // Active Modal: Khusus menu siswa
  const [activeModal, setActiveModal] = useState<
    'none' | 'scan_qr' | 'e_learning' | 'e_ujian' | 'schedule' | 'rules' | 'pinning'
  >('none');

  // Direct URL State di dalam Modal QR & Link
  const [customUrl, setCustomUrl] = useState('');

  // Selected Exam for E-Asesmen (Default kosong, tidak ada yang otomatis terpilih)
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const selectedExam = activeExams.find(e => e.id === selectedExamId);
  const [inputToken, setInputToken] = useState('');
  const [examError, setExamError] = useState('');

  // QR Scan State
  const [qrScanStatus, setQrScanStatus] = useState<string>('');

  // Handler Sukses Pindai QR Asli
  const handleQrDetected = useCallback((decodedText: string) => {
    setQrScanStatus('QR Berhasil Terdeteksi!');
    
    // Cek apakah decodedText adalah format JSON paket asesmen SIGAP
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.examId) {
        const found = exams.find(e => e.id === parsed.examId);
        if (found) {
          setActiveModal('none');
          onStartExam(found, {
            name: currentUser.name,
            classRoom: currentUser.classRoom || 'Kelas 5',
            nisn: currentUser.identifier,
          });
          return;
        }
      }
    } catch {
      // Bukan JSON, perlakukan sebagai teks URL
    }

    // Jika berupa tautan URL (Google Form dsb)
    if (decodedText.startsWith('http://') || decodedText.startsWith('https://') || decodedText.includes('docs.google.com')) {
      const customExam: Exam = {
        id: 'qr-' + Date.now(),
        title: 'Asesmen Barcode Guru',
        subject: 'Asesmen Barcode',
        classLevel: currentUser.classRoom || 'Kelas 5',
        googleFormUrl: decodedText.trim(),
        durationMinutes: 90,
        token: '',
        supervisorPin: '1234',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setActiveModal('none');
      onStartExam(customExam, {
        name: currentUser.name,
        classRoom: currentUser.classRoom || 'Kelas 5',
        nisn: currentUser.identifier,
      });
      return;
    }

    // Jika ID Soal langsung
    const matchingExam = exams.find(e => e.id === decodedText.trim());
    if (matchingExam) {
      setActiveModal('none');
      onStartExam(matchingExam, {
        name: currentUser.name,
        classRoom: currentUser.classRoom || 'Kelas 5',
        nisn: currentUser.identifier,
      });
      return;
    }

    setExamError('QR tidak sesuai format asesmen');
  }, [exams, currentUser, onStartExam]);

  // Mulai Asesmen Terpilih (E-Asesmen)
  const handleStartExamConfirm = (e: FormEvent) => {
    e.preventDefault();
    setExamError('');

    if (!selectedExam) {
      setExamError('Pilih salah satu asesmen');
      return;
    }

    if (selectedExam.token && selectedExam.token.trim() !== '') {
      if (inputToken.trim().toUpperCase() !== selectedExam.token.trim().toUpperCase()) {
        setExamError('Token asesmen salah! Minta token kepada Pengawas');
        return;
      }
    }

    setActiveModal('none');
    onStartExam(selectedExam, {
      name: currentUser.name,
      classRoom: currentUser.classRoom || 'Kelas 5',
      nisn: currentUser.identifier,
    });
  };

  // Mulai Asesmen via Link Langsung (Di bagian bawah Modal Scan QR)
  const handleLaunchCustomUrl = (e: FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const customExam: Exam = {
      id: 'custom-' + Date.now(),
      title: 'Asesmen Tautan Google Form',
      subject: 'Asesmen Tautan',
      classLevel: currentUser.classRoom || 'Kelas 5',
      googleFormUrl: customUrl.trim(),
      durationMinutes: 90,
      token: '',
      supervisorPin: '1234',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setActiveModal('none');
    onStartExam(customExam, {
      name: currentUser.name,
      classRoom: currentUser.classRoom || 'Kelas 5',
      nisn: currentUser.identifier,
    });
  };

  // Buka Materi E-Learning
  const handleOpenMaterial = (material: Exam) => {
    setActiveModal('none');
    onStartExam(material, {
      name: currentUser.name,
      classRoom: currentUser.classRoom || 'Kelas 5',
      nisn: currentUser.identifier,
    });
  };

  // Jika baru saja menyelesaikan asesmen
  if (completedExamSession) {
    return (
      <div className="min-h-screen bg-[#181b22] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Asesmen Selesai</h2>
            <p className="text-xs text-slate-600 mt-1">
              Jawaban <strong className="text-emerald-600">{completedExamSession.subject}</strong> telah diserahkan.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 text-left border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Siswa:</span>
              <span className="font-semibold text-slate-800">{completedExamSession.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kelas:</span>
              <span className="font-semibold text-slate-800">{completedExamSession.classRoom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-emerald-600">Layar Dibuka</span>
            </div>
          </div>

          <button
            onClick={onResetCompletedSession}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181b22] text-slate-800 flex flex-col items-center justify-start select-none font-sans">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden pb-6">
        {/* ============================================================ */}
        {/* HEADER KONSISTEN: LOGO & NAMA SEKOLAH (FUTURISTIK CERAH SIPERLU-STYLE) */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden pt-5 pb-7 px-5 rounded-b-[36px] shadow-xl shadow-green-950/40 text-center">
          {/* Ornamen Latar Hijau Cerah & Pita Gelombang Futuristik */}
          <FuturisticHeaderOrnament />

          <div className="relative z-10 flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-emerald-950 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              <GraduationCap className="w-3 h-3 text-emerald-600" />
              <span>Siswa</span>
            </div>
            <button
              onClick={onLogout}
              title="Keluar"
              className="p-1.5 bg-black/25 hover:bg-black/40 border border-white/25 rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Logo Sekolah: Logo Custom Sekolah atau Default Resmi Tut Wuri Handayani Kemendikdasmen */}
          <div className="relative z-10 w-24 h-24 mx-auto flex items-center justify-center mb-2 drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]">
            <img
              src={schoolLogoUrl && schoolLogoUrl.trim() !== '' ? schoolLogoUrl : '/tutwuri-handayani.svg'}
              alt="Logo Sekolah"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Nama Sekolah */}
          <h1 className="relative z-10 text-base sm:text-lg font-black tracking-wide uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] px-2">
            {schoolName}
          </h1>

          <p className="relative z-10 text-[10px] sm:text-[11px] font-bold text-emerald-100 tracking-wider uppercase mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            SIGAP &bull; SISTEM GEMBOK ASESMEN &amp; PEMBELAJARAN
          </p>

          {/* Nama User saja */}
          <p className="relative z-10 text-xs font-bold text-white tracking-wider uppercase mt-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {currentUser.name} {currentUser.classRoom ? `• KELAS ${currentUser.classRoom}` : ''}
          </p>
        </div>

        {/* ============================================================ */}
        {/* MENU KHUSUS SISWA (BERSIH & TO-THE-POINT) */}
        {/* ============================================================ */}
        <div className="flex-1 px-4 py-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Portal Materi &amp; Asesmen
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              {activeExams.length} Asesmen Aktif
            </span>
          </div>

          {/* Grid 4 Menu Siswa */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* 1. SCAN QR CODE & INPUT TAUTAN */}
            <button
              onClick={() => { setActiveModal('scan_qr'); setExamError(''); setQrScanStatus(''); }}
              className="relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-purple-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-purple-950/20"
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#7e22ce] text-white flex items-center justify-center shadow-lg shadow-purple-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300">
                <QrCode className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className="relative z-10 text-white group-hover:text-purple-300 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200">
                SCAN QR &amp; LINK
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                Kamera &amp; Tautan Asesmen
              </span>
            </button>

            {/* 2. E-ASESMEN (PILIH MAPEL & TOKEN) */}
            <button
              onClick={() => { setActiveModal('e_ujian'); setExamError(''); }}
              className="relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-rose-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-rose-950/20"
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f87171] to-[#e11d48] text-white flex items-center justify-center shadow-lg shadow-rose-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-300">
                <BookOpen className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className="relative z-10 text-white group-hover:text-rose-300 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200">
                E-ASESMEN
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                Pilih Asesmen &amp; Token
              </span>
            </button>

            {/* 3. E-LEARNING (MATERI DARI GURU / MODUL) */}
            <button
              onClick={() => setActiveModal('e_learning')}
              className="relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-emerald-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-emerald-950/20"
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#34d399] to-[#059669] text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300">
                <BookMarked className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className="relative z-10 text-white group-hover:text-emerald-300 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200">
                E-LEARNING
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                Materi &amp; Berkas Belajar
              </span>
            </button>

            {/* 4. JADWAL ASESMEN */}
            <button
              onClick={() => setActiveModal('schedule')}
              className="relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-amber-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-amber-950/20"
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#d97706] text-white flex items-center justify-center shadow-lg shadow-amber-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-300">
                <Calendar className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className="relative z-10 text-white group-hover:text-amber-300 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200">
                JADWAL
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                Jadwal Asesmen Mapel
              </span>
            </button>
          </div>

          {/* Banner Singkat Tata Tertib */}
          <div 
            onClick={() => setActiveModal('rules')}
            className="mt-5 p-3.5 bg-[#181b22] hover:bg-[#20252e] cursor-pointer rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3dd583] shrink-0" />
              <span className="font-semibold text-[11px] text-white">Panduan Pelaksanaan Asesmen</span>
            </div>
            <span className="text-[10px] font-bold text-[#3dd583]">Lihat &rarr;</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SCAN QR (KAMERA AKTIF) & INPUT LINK GFORM (1 TEMPAT) */}
      {/* ============================================================ */}
      {activeModal === 'scan_qr' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-5 border border-white/10 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-400">
                <QrCode className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Scan Barcode / Tautan</h3>
                  <p className="text-[10px] text-slate-400">Pindai QR guru atau tempel link form</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error or Success notification */}
            {examError && (
              <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 text-center">
                {examError}
              </div>
            )}
            {qrScanStatus && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{qrScanStatus}</span>
              </div>
            )}

            {/* AREA KAMERA SCANNER ASLI */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Arahkan Kamera ke Barcode Guru:</span>
              </div>
              <RealQrScanner
                onScanSuccess={handleQrDetected}
                onClose={() => setActiveModal('none')}
              />
            </div>

            {/* PEMISAH / ATAU */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink mx-2 text-[10px] text-slate-400 uppercase font-bold">atau tempel link</span>
              <div className="grow border-t border-white/10"></div>
            </div>

            {/* AREA INPUT LINK GFORM MANUAL (DI BAWAH SCANNER) */}
            <form onSubmit={handleLaunchCustomUrl} className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>2. Masukkan Tautan Google Form:</span>
              </div>

              <div>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/..."
                  className="w-full px-3 py-2 text-xs bg-[#181b22] border border-white/10 focus:border-purple-400 rounded-xl font-mono text-white outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Kunci Layar &amp; Buka Tautan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: E-ASESMEN (PILIH PAKET ASESMEN DARI GURU) */}
      {/* ============================================================ */}
      {activeModal === 'e_ujian' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Pilih Asesmen Pembelajaran</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeExams.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada jadwal asesmen aktif untuk kelas Anda.
              </div>
            ) : (
              <form onSubmit={handleStartExamConfirm} className="space-y-3">
                {examError && (
                  <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                    {examError}
                  </div>
                )}

                <div className="space-y-2">
                  {activeExams.map(exam => {
                    const isSelected = exam.id === selectedExamId;
                    return (
                      <div
                        key={exam.id}
                        onClick={() => { setSelectedExamId(exam.id); setExamError(''); }}
                        className={`p-3 rounded-2xl cursor-pointer transition-all border text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#2a303d] border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
                            : 'bg-[#181b22] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-emerald-400">{exam.subject}</span>
                            {exam.examType === 'pdf_document' ? (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                                Asesmen PDF
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                                Asesmen G-Form
                              </span>
                            )}
                            {exam.targetStudentNisns && exam.targetStudentNisns.length > 0 ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px] border border-purple-500/30">
                                Tugas Khusus
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs font-semibold text-white mt-0.5">{exam.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>{exam.classLevel}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {exam.durationMinutes} Menit
                            </span>
                          </div>
                        </div>
                        <div>
                          {exam.token ? (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                              Token
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">
                              Bebas
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedExam && selectedExam.token && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Token Asesmen
                    </label>
                    <input
                      type="text"
                      required
                      value={inputToken}
                      onChange={e => setInputToken(e.target.value.toUpperCase())}
                      placeholder="Masukkan Token dari Pengawas"
                      className="w-full px-3.5 py-2.5 bg-[#181b22] border border-amber-400/50 focus:border-emerald-400 rounded-xl text-xs font-mono font-bold tracking-widest text-amber-300 uppercase outline-hidden"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedExam}
                  className={`w-full py-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    selectedExam ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span>{selectedExam ? 'Kunci Layar & Mulai Asesmen' : 'Pilih Asesmen Terlebih Dahulu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: E-LEARNING (MATERI BELAJAR & MODUL DARI GURU) */}
      {/* ============================================================ */}
      {activeModal === 'e_learning' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookMarked className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">E-Learning &amp; Modul Materi</h3>
                  <p className="text-[10px] text-slate-400">Bahan ajar berkas dan tautan materi dari guru</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMaterials.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <GraduationCap className="w-10 h-10 text-slate-500 mx-auto" />
                <p>Belum ada modul materi atau tautan materi yang dibagikan guru untuk kelas Anda saat ini.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeMaterials.map(material => {
                  const isLinkMaterial = material.materialContentType === 'link' || (!material.pdfDataUrl && material.googleFormUrl);
                  return (
                    <div
                      key={material.id}
                      className="p-3.5 bg-[#181b22] hover:bg-[#20252e] rounded-2xl border border-white/5 space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-emerald-400">{material.subject}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30 flex items-center gap-1">
                              {isLinkMaterial ? (
                                <>
                                  <LinkIcon className="w-2.5 h-2.5" /> Tautan Materi
                                </>
                              ) : (
                                <>
                                  <BookMarked className="w-2.5 h-2.5" /> Berkas Modul
                                </>
                              )}
                            </span>
                            {material.targetStudentNisns && material.targetStudentNisns.length > 0 ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px] border border-purple-500/30">
                                Materi Khusus
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs font-semibold text-white mt-1">{material.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {material.classLevel} &bull; Bebas Dibaca (Tanpa PIN)
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenMaterial(material)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                      >
                        {isLinkMaterial ? (
                          <>
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka &amp; Pelajari Materi</span>
                          </>
                        ) : (
                          <>
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>Buka &amp; Baca Materi</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: JADWAL ASESMEN */}
      {/* ============================================================ */}
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 border border-white/10 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Jadwal Asesmen Pembelajaran</h3>
                  <p className="text-[10px] text-slate-400">Daftar waktu pelaksanaan asesmen kelas Anda</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {activeExams.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <p>Belum ada jadwal asesmen aktif untuk kelas Anda saat ini.</p>
                </div>
              ) : (
                activeExams.map(ex => (
                  <div
                    key={ex.id}
                    className="p-3.5 bg-[#181b22] rounded-2xl border border-white/5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-amber-400">{ex.subject}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                            {ex.classLevel}
                          </span>
                          {ex.examType === 'pdf_document' ? (
                            <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-300 text-[9px]">
                              Dokumen PDF
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px]">
                              Google Form
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-white">{ex.title}</div>
                      </div>

                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Aktif
                      </span>
                    </div>

                    {/* Info Tanggal, Jam, dan Durasi */}
                    <div className="p-2 bg-[#222731] rounded-xl text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-medium">
                          {ex.scheduleDate ? ex.scheduleDate : 'Setiap Hari / Fleksibel'}
                        </span>
                      </div>
                      {ex.scheduleStartTime && (
                        <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {ex.scheduleStartTime} {ex.scheduleEndTime ? `- ${ex.scheduleEndTime}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 ml-auto">
                        Durasi: <strong className="text-white">{ex.durationMinutes} Menit</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        setActiveModal('e_ujian');
                      }}
                      className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Masuk Pengerjakan Asesmen</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PANDUAN ASESMEN */}
      {/* ============================================================ */}
      {activeModal === 'rules' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-5 border border-white/10 shadow-2xl space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Panduan Asesmen</h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p>1. Masuk ke ruang ujian dengan memilih menu <strong>E-UJIAN</strong> atau memindai barcode pengawas di menu <strong>SCAN QR &amp; LINK</strong>.</p>
            <p>2. Kerjakan butir soal asesmen dengan teliti dan jujur.</p>
            <p>3. Jika membuka materi belajar, Anda bisa membukanya melalui menu <strong>E-LEARNING</strong>.</p>
            <p>4. Pastikan sudah menekan tombol <strong>Kirim / Submit</strong> pada form ujian sebelum memanggil Pengawas untuk membuka kunci layar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
