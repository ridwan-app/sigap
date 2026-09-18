import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { 
  Clock, 
  BookOpen, 
  User, 
  KeyRound,
  RotateCcw,
  FileText,
  BookMarked,
  XCircle
} from 'lucide-react';
import { Exam, StudentSession } from '../types';
import { normalizeGoogleFormUrl, getStoredTeachers } from '../utils/storage';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/wakeLock';
import { UniversalDocumentViewer } from './UniversalDocumentViewer';

interface LockedExamRoomProps {
  exam: Exam;
  session: StudentSession;
  onFinishExam: () => void;
  onCancelExam: () => void;
}

export function LockedExamRoom({ exam, session, onFinishExam }: LockedExamRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMaterial = exam.examType === 'material_document';

  // Dialog Konfirmasi Keluar (Khusus Pengawas)
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [exitPinInput, setExitPinInput] = useState<string>('');
  const [exitPinError, setExitPinError] = useState<string>('');

  // Countdown Sisa Waktu Ujian
  const initialDurationSeconds = exam.durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const remain = initialDurationSeconds - elapsedSeconds;
    return remain > 0 ? remain : 0;
  });

  // Pastikan mode Layar Penuh (Immersive Mode)
  const ensureFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed:', err);
    }
  }, []);

  useEffect(() => {
    ensureFullscreen();
    requestScreenWakeLock();

    const handlePreventNavKeys = (e: KeyboardEvent) => {
      // Blokir F12, F11, Ctrl+U, Ctrl+C, Ctrl+V, Escape
      if (
        e.key === 'F12' ||
        e.key === 'F11' ||
        e.key === 'Escape' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handlePreventNavKeys, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      releaseScreenWakeLock();
      document.removeEventListener('keydown', handlePreventNavKeys, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [ensureFullscreen]);

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Muat ulang iframe jika terjadi gangguan internet
  const handleReloadForm = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Konfirmasi Keluar Ujian oleh Pengawas
  const handleTeacherExitConfirm = (e: FormEvent) => {
    e.preventDefault();
    setExitPinError('');

    const trimmedInput = exitPinInput.trim();
    const teachers = getStoredTeachers();
    const isTeacherPinValid = teachers.some(t => t.pin === trimmedInput);

    if (
      trimmedInput === exam.supervisorPin.trim() ||
      isTeacherPinValid
    ) {
      releaseScreenWakeLock();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onFinishExam();
    } else {
      setExitPinError('PIN Pengawas salah!');
    }
  };

  const cleanGoogleFormUrl = normalizeGoogleFormUrl(exam.googleFormUrl);

  return (
    <div id="locked-exam-container" className="fixed inset-0 z-50 bg-[#181b22] flex flex-col select-none overflow-hidden font-sans">
      
      {/* ============================================================ */}
      {/* TOP BAR RAMPING & BERSIH KIOSK (HIJAU KONSISTEN) */}
      {/* ============================================================ */}
      <header className={`h-11 px-3.5 flex items-center justify-between text-white shrink-0 z-20 shadow-md ${
        isMaterial 
          ? 'bg-gradient-to-r from-[#1b6d49] via-[#208a5d] to-[#1b6d49]' 
          : 'bg-gradient-to-r from-[#3a8b15] via-[#4ea020] to-[#3a8b15]'
      }`}>
        {/* Kiri: Mata Pelajaran & Identitas Siswa */}
        <div className="flex items-center gap-2 truncate">
          <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider truncate">
            {isMaterial ? <BookMarked className="w-4 h-4 shrink-0 text-emerald-100" /> : <BookOpen className="w-4 h-4 shrink-0 text-emerald-100" />}
            <span className="truncate">{exam.subject}</span>
          </div>
          <span className="text-white/40 hidden sm:inline">&bull;</span>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-100">
            <User className="w-3 h-3 text-emerald-200" />
            <span>{session.studentName}</span>
          </div>
        </div>

        {/* Kanan: Muat Ulang, Timer (jika asesmen), dan Tombol Selesai */}
        <div className="flex items-center gap-2">
          {/* Tombol Muat Ulang Form jika koneksi lag */}
          {!isMaterial && (
            <button
              onClick={handleReloadForm}
              title="Muat Ulang Asesmen"
              className="p-1 bg-black/20 hover:bg-black/30 rounded-full text-emerald-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Sisa Waktu Countdown (hanya untuk asesmen) */}
          {!isMaterial && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/25 text-white">
              <Clock className="w-3 h-3 text-emerald-200" />
              <span>{formatTime(secondsLeft)}</span>
            </div>
          )}

          {/* Tombol Keluar: Jika Materi (Bisa langsung keluar), Jika Asesmen (Butuh PIN Pengawas) */}
          {isMaterial ? (
            <button
              onClick={() => {
                releaseScreenWakeLock();
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                onFinishExam();
              }}
              className="px-3 py-1 bg-white text-[#1b6d49] hover:bg-emerald-50 rounded-full text-[11px] font-black uppercase tracking-wider transition-transform active:scale-95 shadow-sm flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Tutup Materi</span>
            </button>
          ) : (
            <button
              id="btn-finish-exam-trigger"
              onClick={() => setIsExitModalOpen(true)}
              className="px-3 py-1 bg-white text-[#2f7011] hover:bg-emerald-50 rounded-full text-[11px] font-black uppercase tracking-wider transition-transform active:scale-95 shadow-sm"
            >
              Selesai
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* AREA ASESMEN / MATERI (GOOGLE FORM, FILE APA PUN, ATAU LINK MATERI) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full h-full relative bg-slate-100">
        {exam.examType === 'material_document' ? (
          exam.materialContentType === 'link' || (!exam.pdfDataUrl && exam.googleFormUrl) ? (
            <UniversalDocumentViewer
              dataUrl={exam.googleFormUrl}
              subjectTitle={exam.subject}
              isLink={true}
            />
          ) : (
            <UniversalDocumentViewer
              dataUrl={exam.pdfDataUrl}
              fileName={exam.pdfFileName}
              fileType={exam.fileType}
              subjectTitle={exam.subject}
            />
          )
        ) : exam.examType === 'pdf_document' ? (
          <UniversalDocumentViewer
            dataUrl={exam.pdfDataUrl}
            fileName={exam.pdfFileName}
            fileType={exam.fileType || 'application/pdf'}
            subjectTitle={exam.subject}
          />
        ) : cleanGoogleFormUrl ? (
          <iframe
            ref={iframeRef}
            src={cleanGoogleFormUrl}
            title="Formulir Asesmen"
            className="w-full h-full border-0"
            allow="fullscreen"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Naskah asesmen / materi belum tersedia.
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* DIALOG KELUAR / BUKA KUNCI PENGAWAS */}
      {/* ============================================================ */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">Konfirmasi Pengawas</h3>
            </div>

            <p className="text-xs text-slate-300">
              Masukkan PIN Pengawas untuk mengakhiri sesi asesmen:
            </p>

            <form onSubmit={handleTeacherExitConfirm} className="space-y-3">
              <div>
                <input
                  type="password"
                  required
                  value={exitPinInput}
                  onChange={e => setExitPinInput(e.target.value)}
                  placeholder="Masukkan PIN Pengawas..."
                  className="w-full px-3.5 py-2.5 bg-[#181b22] border border-white/10 focus:border-emerald-500 rounded-xl text-center text-xs font-mono font-bold text-white tracking-widest outline-hidden"
                  autoFocus
                />
              </div>

              {exitPinError && (
                <p className="text-xs text-rose-400 font-semibold text-center">{exitPinError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsExitModalOpen(false);
                    setExitPinInput('');
                    setExitPinError('');
                  }}
                  className="w-1/2 py-2.5 bg-[#181b22] hover:bg-[#20252e] text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Lanjut Asesmen
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Buka Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
