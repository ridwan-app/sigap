import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { 
  School, 
  BookOpen, 
  Users, 
  Key, 
  LogOut, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  X,
  UserCheck,
  UserPlus,
  FileText,
  Upload,
  AlertCircle,
  FileCheck,
  BookMarked,
  QrCode,
  Link as LinkIcon,
  Globe,
  FileType,
  Calendar,
  Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Exam, StudentRecord, ExamType, AuthUser, MaterialContentType } from '../types';
import { FuturisticHeaderOrnament } from './FuturisticHeaderOrnament';
import { 
  saveExams, 
  normalizeGoogleFormUrl, 
  getStoredStudents, 
  saveStudents 
} from '../utils/storage';

interface TeacherDashboardProps {
  exams: Exam[];
  schoolName: string;
  schoolLogoUrl?: string;
  currentUser?: AuthUser;
  onUpdateExams: (newExams: Exam[]) => void;
  onPreviewAsStudent?: (exam: Exam) => void;
  onLogout: () => void;
}

export function TeacherDashboard({
  exams,
  schoolName,
  schoolLogoUrl,
  currentUser,
  onUpdateExams,
  onPreviewAsStudent,
  onLogout,
}: TeacherDashboardProps) {
  // Default null: Hanya tampil menu saja sebelum dipilih
  const [activeTab, setActiveTab] = useState<'soal' | 'siswa' | null>(null);

  // Kelas yang diampu oleh Guru ini (bisa multiple untuk guru mapel)
  const assignedClasses = currentUser?.assignedClasses && currentUser.assignedClasses.length > 0
    ? currentUser.assignedClasses
    : ['Kelas 1'];

  // Pilihan kelas aktif untuk filter/input (default kelas pertama)
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(assignedClasses[0] || 'Kelas 1');

  // Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [qrExamModal, setQrExamModal] = useState<Exam | null>(null);
  const [filterExamKind, setFilterExamKind] = useState<'all' | 'assessment' | 'material'>('all');

  // Form State: Asesmen / Materi
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [formExamType, setFormExamType] = useState<ExamType>('google_form');
  const [formMaterialType, setFormMaterialType] = useState<MaterialContentType>('file');
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formClassLevel, setFormClassLevel] = useState(selectedClassFilter);
  const [formGoogleFormUrl, setFormGoogleFormUrl] = useState('');
  const [formPdfDataUrl, setFormPdfDataUrl] = useState('');
  const [formPdfFileName, setFormPdfFileName] = useState('');
  const [formFileType, setFormFileType] = useState('');
  const [formDurationMinutes, setFormDurationMinutes] = useState(60);
  const [formScheduleDate, setFormScheduleDate] = useState('');
  const [formScheduleStartTime, setFormScheduleStartTime] = useState('');
  const [formScheduleEndTime, setFormScheduleEndTime] = useState('');
  const [formToken, setFormToken] = useState('');
  const [formSupervisorPin, setFormSupervisorPin] = useState('1234');
  const [formTargetMode, setFormTargetMode] = useState<'all' | 'specific'>('all');
  const [formTargetStudentNisns, setFormTargetStudentNisns] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');

  // Siswa State
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(selectedClassFilter);

  useEffect(() => {
    setStudents(getStoredStudents());
  }, []);

  // Handler Upload Berkas (PDF, Dokumen Word, PPT, Gambar, Video, Audio, dll)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Batas aman ukuran file browser base64 ~25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 25 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setFormPdfDataUrl(result);
        setFormPdfFileName(file.name);
        setFormFileType(file.type || file.name.split('.').pop() || '');
        // Otomatis isi judul jika masih kosong
        if (!formTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setFormTitle(cleanName);
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  // Handler Buka Modal Tambah Asesmen
  const handleOpenCreateExam = () => {
    setEditingExamId(null);
    setFormExamType('google_form');
    setFormMaterialType('file');
    setFormTitle('');
    setFormSubject('');
    setFormClassLevel(assignedClasses[0] || 'Kelas 1');
    setFormGoogleFormUrl('');
    setFormPdfDataUrl('');
    setFormPdfFileName('');
    setFormFileType('');
    setFormDurationMinutes(60);
    setFormScheduleDate('');
    setFormScheduleStartTime('');
    setFormScheduleEndTime('');
    setFormToken('');
    setFormSupervisorPin('1234');
    setFormTargetMode('all');
    setFormTargetStudentNisns([]);
    setUploadError('');
    setIsExamModalOpen(true);
  };

  // Handler Buka Modal Tambah Materi Pembelajaran
  const handleOpenCreateMaterial = () => {
    setEditingExamId(null);
    setFormExamType('material_document');
    setFormMaterialType('file');
    setFormTitle('');
    setFormSubject('');
    setFormClassLevel(assignedClasses[0] || 'Kelas 1');
    setFormGoogleFormUrl('');
    setFormPdfDataUrl('');
    setFormPdfFileName('');
    setFormFileType('');
    setFormDurationMinutes(0);
    setFormScheduleDate('');
    setFormScheduleStartTime('');
    setFormScheduleEndTime('');
    setFormToken('');
    setFormSupervisorPin('');
    setFormTargetMode('all');
    setFormTargetStudentNisns([]);
    setUploadError('');
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setFormExamType(exam.examType || 'google_form');
    setFormMaterialType(exam.materialContentType || (exam.googleFormUrl ? 'link' : 'file'));
    setFormTitle(exam.title);
    setFormSubject(exam.subject);
    setFormClassLevel(exam.classLevel);
    setFormGoogleFormUrl(exam.googleFormUrl || '');
    setFormPdfDataUrl(exam.pdfDataUrl || '');
    setFormPdfFileName(exam.pdfFileName || '');
    setFormFileType(exam.fileType || '');
    setFormDurationMinutes(exam.durationMinutes || 60);
    setFormScheduleDate(exam.scheduleDate || '');
    setFormScheduleStartTime(exam.scheduleStartTime || '');
    setFormScheduleEndTime(exam.scheduleEndTime || '');
    setFormToken(exam.token || '');
    setFormSupervisorPin(exam.supervisorPin || '1234');
    if (exam.targetStudentNisns && exam.targetStudentNisns.length > 0) {
      setFormTargetMode('specific');
      setFormTargetStudentNisns(exam.targetStudentNisns);
    } else {
      setFormTargetMode('all');
      setFormTargetStudentNisns([]);
    }
    setUploadError('');
    setIsExamModalOpen(true);
  };

  const handleToggleTargetStudentNisn = (nisn: string) => {
    setFormTargetStudentNisns(prev => 
      prev.includes(nisn) ? prev.filter(n => n !== nisn) : [...prev, nisn]
    );
  };

  const handleSaveExam = (e: FormEvent) => {
    e.preventDefault();

    if (formExamType === 'pdf_document' && !formPdfDataUrl) {
      setUploadError('Silakan pilih berkas dokumen soal.');
      return;
    }

    if (formExamType === 'material_document') {
      if (formMaterialType === 'file' && !formPdfDataUrl) {
        setUploadError('Silakan unggah berkas materi (PDF, DOCX, PPTX, gambar, video, dll).');
        return;
      }
      if (formMaterialType === 'link' && !formGoogleFormUrl.trim()) {
        setUploadError('Silakan masukkan tautan / link materi.');
        return;
      }
    }

    if (formTargetMode === 'specific' && formTargetStudentNisns.length === 0) {
      setUploadError('Pilih minimal 1 siswa untuk penugasan khusus/remedial.');
      return;
    }

    const cleanUrl = formGoogleFormUrl ? (formExamType === 'google_form' ? normalizeGoogleFormUrl(formGoogleFormUrl) : formGoogleFormUrl.trim()) : '';
    const finalTargetNisns = formTargetMode === 'specific' ? formTargetStudentNisns : undefined;

    if (editingExamId) {
      const updated = exams.map(e => {
        if (e.id === editingExamId) {
          return {
            ...e,
            title: formTitle.trim(),
            subject: formSubject.trim(),
            classLevel: formClassLevel.trim(),
            examType: formExamType,
            materialContentType: formExamType === 'material_document' ? formMaterialType : undefined,
            googleFormUrl: cleanUrl,
            pdfDataUrl: formPdfDataUrl,
            pdfFileName: formPdfFileName,
            fileType: formFileType,
            durationMinutes: Number(formDurationMinutes) || 60,
            scheduleDate: formScheduleDate || undefined,
            scheduleStartTime: formScheduleStartTime || undefined,
            scheduleEndTime: formScheduleEndTime || undefined,
            token: formToken.trim().toUpperCase(),
            supervisorPin: formSupervisorPin.trim() || '1234',
            targetStudentNisns: finalTargetNisns,
          };
        }
        return e;
      });
      onUpdateExams(updated);
      saveExams(updated);
    } else {
      const newExam: Exam = {
        id: 'exam-' + Date.now(),
        title: formTitle.trim(),
        subject: formSubject.trim(),
        classLevel: formClassLevel.trim(),
        teacherId: currentUser?.teacherId || currentUser?.identifier,
        examType: formExamType,
        materialContentType: formExamType === 'material_document' ? formMaterialType : undefined,
        googleFormUrl: cleanUrl,
        pdfDataUrl: formPdfDataUrl,
        pdfFileName: formPdfFileName,
        fileType: formFileType,
        durationMinutes: Number(formDurationMinutes) || 60,
        scheduleDate: formScheduleDate || undefined,
        scheduleStartTime: formScheduleStartTime || undefined,
        scheduleEndTime: formScheduleEndTime || undefined,
        token: formToken.trim().toUpperCase(),
        supervisorPin: formSupervisorPin.trim() || '1234',
        targetStudentNisns: finalTargetNisns,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [newExam, ...exams];
      onUpdateExams(updated);
      saveExams(updated);
    }

    setIsExamModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    const updated = exams.map(e => (e.id === id ? { ...e, isActive: !e.isActive } : e));
    onUpdateExams(updated);
    saveExams(updated);
  };

  const handleDeleteExam = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    onUpdateExams(updated);
    saveExams(updated);
  };

  // Handler Siswa
  const handleAddStudent = (e: FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentNisn.trim()) return;

    const newStudent: StudentRecord = {
      id: 's-' + Date.now(),
      name: newStudentName.trim(),
      nisn: newStudentNisn.trim(),
      classRoom: newStudentClass.trim(),
      teacherId: currentUser?.teacherId || currentUser?.identifier,
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStudents(updated);
    setNewStudentName('');
    setNewStudentNisn('');
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveStudents(updated);
  };

  return (
    <div className="min-h-screen bg-[#181b22] text-white flex flex-col items-center justify-start select-none font-sans">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden pb-6">
        
        {/* ============================================================ */}
        {/* HEADER KONSISTEN: LOGO & NAMA SEKOLAH (FUTURISTIK CERAH SIPERLU-STYLE) */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden pt-5 pb-7 px-5 rounded-b-[36px] shadow-xl shadow-green-950/40 text-center">
          {/* Ornamen Latar Hijau Cerah & Pita Gelombang Futuristik */}
          <FuturisticHeaderOrnament />

          <div className="relative z-10 flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-blue-950 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              <UserCheck className="w-3 h-3 text-blue-600" />
              <span>Guru</span>
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

          <h1 className="relative z-10 text-base sm:text-lg font-black tracking-wide uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] px-2">
            {schoolName}
          </h1>

          <p className="relative z-10 text-[10px] sm:text-[11px] font-bold text-emerald-100 tracking-wider uppercase mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            SIGAP &bull; SISTEM GEMBOK ASESMEN &amp; PEMBELAJARAN
          </p>

          <p className="relative z-10 text-xs font-bold text-white tracking-wider uppercase mt-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {currentUser.name}
          </p>
        </div>

        {/* ============================================================ */}
        {/* HANYA 2 KARTU MENU GURU: MATERI & ASESMEN & KELOLA SISWA */}
        {/* ============================================================ */}
        <div className="px-4 pt-5 pb-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
            PILIH MENU
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* 1. MATERI & ASESMEN */}
            <button
              onClick={() => setActiveTab(prev => prev === 'soal' ? null : 'soal')}
              className={`relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group ${
                activeTab === 'soal'
                  ? 'bg-gradient-to-b from-[#242b3a] to-[#181c26] border-2 border-blue-500 shadow-xl shadow-blue-950/30 ring-2 ring-blue-500/20'
                  : 'bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-blue-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-blue-950/20'
              }`}
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300">
                <BookOpen className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className={`relative z-10 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200 ${
                activeTab === 'soal' ? 'text-blue-400' : 'text-white group-hover:text-blue-300'
              }`}>
                MATERI &amp; ASESMEN
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                {exams.filter(e => e.examType !== 'material_document').length} Asesmen &bull; {exams.filter(e => e.examType === 'material_document').length} Materi
              </span>
            </button>

            {/* 2. KELOLA SISWA */}
            <button
              onClick={() => setActiveTab(prev => prev === 'siswa' ? null : 'siswa')}
              className={`relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group ${
                activeTab === 'siswa'
                  ? 'bg-gradient-to-b from-[#242b3a] to-[#181c26] border-2 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-2 ring-emerald-500/20'
                  : 'bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-emerald-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-emerald-950/20'
              }`}
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-300">
                <Users className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className={`relative z-10 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200 ${
                activeTab === 'siswa' ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'
              }`}>
                KELOLA SISWA
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                {students.length} Siswa Terdaftar
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KONTEN AKTIF: HANYA TAMPIL JIKA MENU DIKLIK */}
        {/* ============================================================ */}
        {activeTab && (
          <div className="flex-1 px-4 py-3">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setActiveTab(null)}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors shadow-xs"
              >
                <span>Tutup Menu</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {activeTab === 'soal' && (
            <div className="space-y-3">
              {/* TOMBOL AKSI: TAMBAH ASESMEN & TAMBAH MATERI TERPISAH */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">Materi &amp; Asesmen Pembelajaran</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleOpenCreateExam}
                    className="py-2 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Asesmen</span>
                  </button>
                  <button
                    onClick={handleOpenCreateMaterial}
                    className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>+ Tambah Materi</span>
                  </button>
                </div>

                {/* Sub Filter: Semua, Asesmen, Materi */}
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setFilterExamKind('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      filterExamKind === 'all'
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-[#181b22] text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua ({exams.length})
                  </button>
                  <button
                    onClick={() => setFilterExamKind('assessment')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      filterExamKind === 'assessment'
                        ? 'bg-blue-600/40 text-blue-300 border border-blue-500/40 font-bold'
                        : 'bg-[#181b22] text-slate-400 hover:text-white'
                    }`}
                  >
                    Asesmen ({exams.filter(e => e.examType !== 'material_document').length})
                  </button>
                  <button
                    onClick={() => setFilterExamKind('material')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      filterExamKind === 'material'
                        ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-[#181b22] text-slate-400 hover:text-white'
                    }`}
                  >
                    Materi ({exams.filter(e => e.examType === 'material_document').length})
                  </button>
                </div>
              </div>

              {/* LIST ITEMS */}
              <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-0.5">
                {(() => {
                  const filteredList = exams.filter(e => {
                    if (filterExamKind === 'assessment') return e.examType !== 'material_document';
                    if (filterExamKind === 'material') return e.examType === 'material_document';
                    return true;
                  });

                  if (filteredList.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-500 bg-[#181b22]/50 rounded-2xl border border-white/5">
                        Belum ada data {filterExamKind === 'assessment' ? 'asesmen' : filterExamKind === 'material' ? 'materi' : 'materi atau asesmen'}. Klik tombol di atas untuk menambahkan.
                      </div>
                    );
                  }

                  return filteredList.map(exam => (
                    <div
                      key={exam.id}
                      className="p-3 bg-[#181b22] rounded-2xl border border-white/5 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">{exam.subject} ({exam.classLevel})</span>
                            {exam.examType === 'material_document' ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30 flex items-center gap-1">
                                {exam.materialContentType === 'link' || (!exam.pdfDataUrl && exam.googleFormUrl) ? (
                                  <>
                                    <LinkIcon className="w-2.5 h-2.5" /> Link Materi
                                  </>
                                ) : (
                                  <>
                                    <BookMarked className="w-2.5 h-2.5" /> Berkas Materi
                                  </>
                                )}
                              </span>
                            ) : exam.examType === 'pdf_document' ? (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 flex items-center gap-0.5">
                                <FileText className="w-2.5 h-2.5" /> Asesmen PDF
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                                Asesmen G-Form
                              </span>
                            )}
                            {exam.targetStudentNisns && exam.targetStudentNisns.length > 0 ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px] border border-purple-500/30">
                                Khusus ({exam.targetStudentNisns.length} Siswa)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-300 font-bold text-[9px] border border-slate-500/30">
                                Semua Siswa
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{exam.title}</div>
                          {(exam.scheduleDate || exam.scheduleStartTime) && (
                            <div className="text-[10px] text-blue-300 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-blue-400 shrink-0" />
                              <span>
                                {exam.scheduleDate ? exam.scheduleDate : 'Setiap Hari'}
                                {exam.scheduleStartTime ? ` (${exam.scheduleStartTime}${exam.scheduleEndTime ? ' - ' + exam.scheduleEndTime : ''})` : ''}
                              </span>
                            </div>
                          )}
                          {exam.examType === 'material_document' ? (
                            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                              <span>Bebas Dibaca Siswa</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-2">
                              <span>Token: <strong className="text-amber-300 font-mono">{exam.token || 'BEBAS'}</strong></span>
                              <span>&bull;</span>
                              <span>PIN: {exam.supervisorPin}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleActive(exam.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            exam.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {exam.isActive ? 'Aktif' : 'Tutup'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <div className="flex gap-1.5">
                          {exam.examType !== 'material_document' && (
                            <button
                              onClick={() => setQrExamModal(exam)}
                              className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold rounded-lg flex items-center gap-1 border border-purple-500/30"
                              title="Tampilkan Barcode QR Asesmen untuk Siswa"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>QR Code</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditExam(exam)}
                            className="px-2 py-1 bg-[#222731] hover:bg-[#2c323f] text-slate-300 text-[10px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>

                        {onPreviewAsStudent && (
                          <button
                            onClick={() => onPreviewAsStudent(exam)}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{exam.examType === 'material_document' ? 'Lihat Materi' : 'Uji Layar'} &rarr;</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
            )}

            {activeTab === 'siswa' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">Daftar Data Siswa</span>
                  <button
                    onClick={() => setIsStudentModalOpen(true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-0.5">
                  {students.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Belum ada data siswa terdaftar. Klik "Tambah Siswa" untuk menambahkan.
                    </div>
                  ) : (
                    students.map(student => (
                      <div
                        key={student.id}
                        className="p-3 bg-[#181b22] rounded-2xl border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{student.name}</div>
                          <div className="text-[11px] text-slate-400">
                            NISN: <span className="font-mono text-emerald-300">{student.nisn}</span> &bull; {student.classRoom}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL INPUT MATERI ATAU ASESMEN */}
      {/* ============================================================ */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 border border-white/10 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className={`flex items-center gap-2 ${formExamType === 'material_document' ? 'text-emerald-400' : 'text-blue-400'}`}>
                {formExamType === 'material_document' ? (
                  <BookMarked className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
                <h3 className="text-sm font-bold text-white">
                  {formExamType === 'material_document'
                    ? (editingExamId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran')
                    : (editingExamId ? 'Edit Paket Asesmen' : 'Tambah Asesmen Baru')}
                </h3>
              </div>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              {/* Pilihan Format Khusus Asesmen */}
              {formExamType !== 'material_document' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Format Asesmen</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setFormExamType('google_form'); setUploadError(''); }}
                      className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                        formExamType === 'google_form'
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                          : 'bg-[#181b22] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Google Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFormExamType('pdf_document'); setUploadError(''); }}
                      className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                        formExamType === 'pdf_document'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                          : 'bg-[#181b22] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Asesmen Dokumen (PDF)</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="Contoh: Pendidikan Agama Islam / Matematika"
                  className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {formExamType === 'material_document' ? 'Judul / Topik Materi' : 'Keterangan Asesmen'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder={
                    formExamType === 'material_document'
                      ? 'Contoh: Modul Rangkuman Siklus Air Bab 4'
                      : 'Contoh: Asesmen Sumatif Lingkup Materi / PTS'
                  }
                  className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white outline-hidden"
                />
              </div>

              {/* TAMPILAN INPUT SESUAI TIPE KONTEN */}
              {formExamType === 'google_form' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tautan Google Form</label>
                  <textarea
                    required
                    rows={2}
                    value={formGoogleFormUrl}
                    onChange={e => setFormGoogleFormUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/..."
                    className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white font-mono outline-hidden resize-none"
                  />
                </div>
              ) : formExamType === 'material_document' ? (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Sumber Materi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMaterialType('file')}
                        className={`py-1.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                          formMaterialType === 'file'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                            : 'bg-[#181b22] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMaterialType('link')}
                        className={`py-1.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                          formMaterialType === 'link'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                            : 'bg-[#181b22] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Tautan / Link</span>
                      </button>
                    </div>
                  </div>

                  {formMaterialType === 'file' ? (
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-semibold">
                        Berkas Materi (PDF, Word, Excel, PPT, Gambar, Video, Audio)
                      </label>
                      <div className="relative border border-dashed border-white/20 hover:border-emerald-400/60 rounded-xl p-3 text-center transition-colors bg-[#181b22]">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {formPdfFileName ? (
                          <div className="flex items-center justify-center gap-2 text-emerald-300 font-semibold text-xs">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[220px]">{formPdfFileName}</span>
                            <span className="text-[10px] text-slate-400 underline ml-1">Ganti</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-slate-400 py-1">
                            <div className="flex items-center gap-1.5">
                              <Upload className="w-4 h-4 text-emerald-400" />
                              <span className="font-semibold text-slate-300 text-xs">
                                Pilih Berkas Materi dari Perangkat
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">Mendukung PDF, Word, PowerPoint, Gambar, Video, dll (Maks 25MB)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-semibold">Tautan Materi (YouTube, Canva, Website, Google Drive)</label>
                      <input
                        type="url"
                        required
                        value={formGoogleFormUrl}
                        onChange={e => setFormGoogleFormUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... atau https://canva.com/..."
                        className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-emerald-500 rounded-xl text-white font-mono outline-hidden text-xs"
                      />
                      <p className="text-[10px] text-slate-400">Tautan materi akan otomatis dibuka di dalam aplikasi saat siswa belajar.</p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">
                    File PDF / Dokumen Soal Ujian
                  </label>
                  <div className="relative border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl p-3 text-center transition-colors bg-[#181b22]">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formPdfFileName ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-300 font-semibold text-xs">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="truncate max-w-[240px]">{formPdfFileName}</span>
                        <span className="text-[10px] text-slate-400 underline ml-1">Ganti</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-slate-400 py-1">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-slate-300 text-xs">
                          Pilih File PDF Soal Ujian
                        </span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Kelas</label>
                  <select
                    value={formClassLevel}
                    onChange={e => {
                      setFormClassLevel(e.target.value);
                      // Reset checklist siswa jika ganti kelas
                      setFormTargetStudentNisns([]);
                    }}
                    className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white outline-hidden"
                  >
                    {assignedClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']
                      .filter(c => !assignedClasses.includes(c))
                      .map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={240}
                    value={formDurationMinutes}
                    onChange={e => setFormDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Pilihan Target Penerima Soal (Semua Siswa vs Siswa Khusus / Remedial) */}
              <div className="p-3 bg-[#181b22] rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200">Target Siswa:</label>
                  <span className="text-[10px] text-slate-400">
                    {formTargetMode === 'all' ? 'Seluruh Siswa di Kelas' : `${formTargetStudentNisns.length} Siswa Terpilih`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTargetMode('all');
                      setFormTargetStudentNisns([]);
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formTargetMode === 'all'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-[#222731] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Semua Siswa (Reguler)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTargetMode('specific')}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formTargetMode === 'specific'
                        ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                        : 'bg-[#222731] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Siswa Tertentu (Remedial)
                  </button>
                </div>

                {formTargetMode === 'specific' && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="text-[10px] text-purple-300 font-semibold">
                      Centang nama siswa ({formClassLevel}) yang diberikan tugas ini:
                    </div>
                    {(() => {
                      const classStudents = students.filter(s => {
                        const normS = (s.classRoom || '').toLowerCase().replace(/\s+/g, '');
                        const normForm = formClassLevel.toLowerCase().replace(/\s+/g, '');
                        return normS.includes(normForm) || normForm.includes(normS);
                      });

                      if (classStudents.length === 0) {
                        return (
                          <div className="p-2 bg-[#222731] rounded-xl text-[10px] text-amber-300 text-center">
                            Belum ada siswa terdaftar di {formClassLevel}. Silakan tambah siswa di menu Kelola Siswa.
                          </div>
                        );
                      }

                      return (
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1 bg-[#222731] p-2 rounded-xl border border-white/5">
                          {classStudents.map(student => {
                            const isChecked = formTargetStudentNisns.includes(student.nisn);
                            return (
                              <label
                                key={student.id}
                                className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-[11px] transition-colors ${
                                  isChecked ? 'bg-purple-500/20 text-purple-200 font-semibold' : 'text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleTargetStudentNisn(student.nisn)}
                                    className="w-3.5 h-3.5 rounded text-purple-600 accent-purple-500 focus:ring-0"
                                  />
                                  <span>{student.name}</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">{student.nisn}</span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Schedule / Tanggal & Jam Pelaksanaan (Opsional) */}
              <div className="space-y-1.5 p-2.5 bg-[#181b22] border border-white/10 rounded-xl">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Jadwal Pelaksanaan (Opsional)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Tanggal</label>
                    <input
                      type="date"
                      value={formScheduleDate}
                      onChange={e => setFormScheduleDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#222731] border border-white/10 focus:border-blue-500 rounded-lg text-white text-[11px] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Jam Mulai</label>
                    <input
                      type="time"
                      value={formScheduleStartTime}
                      onChange={e => setFormScheduleStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#222731] border border-white/10 focus:border-blue-500 rounded-lg text-white text-[11px] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Jam Selesai</label>
                    <input
                      type="time"
                      value={formScheduleEndTime}
                      onChange={e => setFormScheduleEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#222731] border border-white/10 focus:border-blue-500 rounded-lg text-white text-[11px] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Token & PIN hanya jika bertipe Ujian (bukan Materi Bacaan) */}
              {formExamType !== 'material_document' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Token Masuk</label>
                    <input
                      type="text"
                      value={formToken}
                      onChange={e => setFormToken(e.target.value.toUpperCase())}
                      placeholder="Misal: MAT5"
                      className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white font-mono font-bold uppercase outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PIN Buka Kunci</label>
                    <input
                      type="text"
                      required
                      value={formSupervisorPin}
                      onChange={e => setFormSupervisorPin(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3 py-2 bg-[#181b22] border border-white/10 focus:border-blue-500 rounded-xl text-white font-mono outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Materi bacaan bebas dibaca siswa tanpa perlu Token &amp; PIN Pengawas.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#181b22] text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`w-1/2 py-2.5 font-bold rounded-xl shadow-lg transition-all text-white ${
                    formExamType === 'material_document'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {formExamType === 'material_document' ? 'Simpan Materi' : 'Simpan Asesmen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL INPUT SISWA */}
      {/* ============================================================ */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-5 border border-white/10 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Tambah Data Siswa</h3>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-emerald-500 rounded-xl text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">NISN / Nomor Peserta</label>
                <input
                  type="text"
                  required
                  value={newStudentNisn}
                  onChange={e => setNewStudentNisn(e.target.value)}
                  placeholder="Contoh: 0123456789"
                  className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-emerald-500 rounded-xl text-white font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kelas Siswa</label>
                <select
                  value={newStudentClass}
                  onChange={e => setNewStudentClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-emerald-500 rounded-xl text-white outline-hidden"
                >
                  {assignedClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                  {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']
                    .filter(c => !assignedClasses.includes(c))
                    .map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#181b22] text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL TAMPILKAN QR ASESMEN UNTUK SISWA */}
      {/* ============================================================ */}
      {qrExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-6 border border-white/10 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-400 text-left">
                <QrCode className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">QR Code Asesmen</h3>
                  <p className="text-[10px] text-slate-400">Tampilkan di proyektor atau layar HP guru</p>
                </div>
              </div>
              <button
                onClick={() => setQrExamModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-flex flex-col items-center justify-center mx-auto shadow-lg">
              <QRCodeSVG
                value={JSON.stringify({
                  examId: qrExamModal.id,
                  type: 'sigap_exam',
                  url: qrExamModal.googleFormUrl || ''
                })}
                size={180}
                level="M"
              />
              <span className="text-[10px] font-mono font-bold text-slate-800 mt-2 uppercase tracking-wider">
                {qrExamModal.subject} &bull; {qrExamModal.classLevel}
              </span>
            </div>

            <div className="space-y-1 bg-[#181b22] p-3 rounded-2xl border border-white/5 text-left text-[11px]">
              <div className="font-bold text-white">{qrExamModal.title}</div>
              <div className="text-slate-400 flex items-center justify-between pt-1">
                <span>Token: <strong className="text-amber-300 font-mono">{qrExamModal.token || 'BEBAS'}</strong></span>
                <span>PIN: <strong className="text-emerald-300 font-mono">{qrExamModal.supervisorPin}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setQrExamModal(null)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
            >
              Tutup QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
