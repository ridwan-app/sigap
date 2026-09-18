import { useState, FormEvent, useEffect, useRef, ChangeEvent } from 'react';
import { 
  School, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Save, 
  CheckCircle, 
  X, 
  Plus, 
  Trash2, 
  UserPlus, 
  Edit,
  Key,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { SchoolInfo, TeacherRecord, AuthUser } from '../types';
import { FuturisticHeaderOrnament } from './FuturisticHeaderOrnament';
import { 
  getSchoolInfo, 
  saveSchoolInfo, 
  getStoredTeachers, 
  saveTeachers
} from '../utils/storage';

interface AdminDashboardProps {
  schoolInfo: SchoolInfo;
  currentUser?: AuthUser;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  onSwitchToStudentView: () => void;
  onSwitchToTeacherView: () => void;
  onLogout: () => void;
}

export function AdminDashboard({
  schoolInfo,
  currentUser,
  onUpdateSchoolInfo,
  onSwitchToStudentView,
  onSwitchToTeacherView,
  onLogout,
}: AdminDashboardProps) {
  // Default null: Hanya tampil menu saja sebelum dipilih
  const [activeTab, setActiveTab] = useState<'profil_sekolah' | 'kelola_guru' | null>(null);

  // State Profil Sekolah
  const [schoolData, setSchoolData] = useState<SchoolInfo>(schoolInfo);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Guru
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherNip, setNewTeacherNip] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Wali Kelas 1');
  const [newTeacherPin, setNewTeacherPin] = useState('123456');
  const [newTeacherAssignedClasses, setNewTeacherAssignedClasses] = useState<string[]>(['Kelas 1']);

  useEffect(() => {
    setTeachers(getStoredTeachers());
  }, []);

  // Upload Logo Handler (Mendukung Klik & Drag & Drop atau File Picker)
  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Baca gambar dan convert ke Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSchoolData(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSchoolData(prev => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simpan Profil Sekolah
  const handleSaveSchool = (e: FormEvent) => {
    e.preventDefault();
    if (!schoolData.name.trim()) return;

    const updated: SchoolInfo = {
      ...schoolData,
      name: schoolData.name.trim().toUpperCase(),
    };
    setSchoolData(updated);
    saveSchoolInfo(updated);
    onUpdateSchoolInfo(updated);
    setSaveSuccessMsg('Profil dan Logo Sekolah tersimpan!');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Buka Modal Tambah Guru Baru
  const handleOpenAddTeacher = () => {
    setEditingTeacherId(null);
    setNewTeacherName('');
    setNewTeacherNip('');
    setNewTeacherSubject('Wali Kelas 1');
    setNewTeacherPin('123456');
    setNewTeacherAssignedClasses(['Kelas 1']);
    setIsTeacherModalOpen(true);
  };

  // Buka Modal Edit Guru (Icon Pensil)
  const handleOpenEditTeacher = (teacher: TeacherRecord) => {
    setEditingTeacherId(teacher.id);
    setNewTeacherName(teacher.name);
    setNewTeacherNip(teacher.nip === '-' ? '' : teacher.nip);
    setNewTeacherSubject(teacher.subject);
    setNewTeacherPin(teacher.pin);
    setNewTeacherAssignedClasses(
      teacher.assignedClasses && teacher.assignedClasses.length > 0
        ? teacher.assignedClasses
        : ['Kelas 1']
    );
    setIsTeacherModalOpen(true);
  };

  // Simpan Guru (Tambah Baru atau Update yang Diedit)
  const handleSaveTeacher = (e: FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    if (editingTeacherId) {
      // Mode Edit
      const updated = teachers.map(t => {
        if (t.id === editingTeacherId) {
          return {
            ...t,
            name: newTeacherName.trim(),
            nip: newTeacherNip.trim() || '-',
            subject: newTeacherSubject.trim() || 'Guru Kelas',
            pin: newTeacherPin.trim() || '123456',
            assignedClasses: newTeacherAssignedClasses.length > 0 ? newTeacherAssignedClasses : ['Kelas 1'],
          };
        }
        return t;
      });
      setTeachers(updated);
      saveTeachers(updated);
    } else {
      // Mode Tambah Baru
      const newTeacher: TeacherRecord = {
        id: 't-' + Date.now(),
        name: newTeacherName.trim(),
        nip: newTeacherNip.trim() || '-',
        subject: newTeacherSubject.trim() || 'Guru Kelas',
        pin: newTeacherPin.trim() || '123456',
        assignedClasses: newTeacherAssignedClasses.length > 0 ? newTeacherAssignedClasses : ['Kelas 1'],
      };
      const updated = [newTeacher, ...teachers];
      setTeachers(updated);
      saveTeachers(updated);
    }

    setEditingTeacherId(null);
    setNewTeacherName('');
    setNewTeacherNip('');
    setNewTeacherSubject('Wali Kelas 1');
    setNewTeacherPin('123456');
    setNewTeacherAssignedClasses(['Kelas 1']);
    setIsTeacherModalOpen(false);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    saveTeachers(updated);
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
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-950 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
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
              src={schoolData.logoUrl && schoolData.logoUrl.trim() !== '' ? schoolData.logoUrl : '/tutwuri-handayani.svg'}
              alt="Logo Sekolah"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="relative z-10 text-base sm:text-lg font-black tracking-wide uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] px-2">
            {schoolData.name}
          </h1>

          <p className="relative z-10 text-[10px] sm:text-[11px] font-bold text-emerald-100 tracking-wider uppercase mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            SIGAP &bull; SISTEM GEMBOK ASESMEN &amp; PEMBELAJARAN
          </p>

          <p className="relative z-10 text-xs font-bold text-white tracking-wider uppercase mt-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {currentUser?.name || 'ADMINISTRATOR SEKOLAH'}
          </p>
        </div>

        {/* ============================================================ */}
        {/* HANYA 2 KARTU MENU ADMIN: PROFIL SEKOLAH & KELOLA GURU */}
        {/* ============================================================ */}
        <div className="px-4 pt-5 pb-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
            PILIH MENU
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* 1. PROFIL SEKOLAH */}
            <button
              onClick={() => setActiveTab(prev => prev === 'profil_sekolah' ? null : 'profil_sekolah')}
              className={`relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group ${
                activeTab === 'profil_sekolah'
                  ? 'bg-gradient-to-b from-[#242b3a] to-[#181c26] border-2 border-amber-500 shadow-xl shadow-amber-950/30 ring-2 ring-amber-500/20'
                  : 'bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-amber-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-amber-950/20'
              }`}
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-500" />
              
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300">
                <School className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className={`relative z-10 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200 ${
                activeTab === 'profil_sekolah' ? 'text-amber-400' : 'text-white group-hover:text-amber-300'
              }`}>
                PROFIL SEKOLAH
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                Logo, Nama &amp; PIN
              </span>
            </button>

            {/* 2. KELOLA GURU */}
            <button
              onClick={() => setActiveTab(prev => prev === 'kelola_guru' ? null : 'kelola_guru')}
              className={`relative overflow-hidden rounded-[26px] p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 hover:-translate-y-1 group ${
                activeTab === 'kelola_guru'
                  ? 'bg-gradient-to-b from-[#242b3a] to-[#181c26] border-2 border-purple-500 shadow-xl shadow-purple-950/30 ring-2 ring-purple-500/20'
                  : 'bg-gradient-to-b from-[#212734] to-[#151922] border border-slate-700/60 hover:border-purple-400/60 shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-purple-950/20'
              }`}
            >
              {/* Subtle ambient light glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-500" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/35 ring-1 ring-white/25 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-300">
                <Users className="w-6 h-6 stroke-[2.2] filter drop-shadow-sm" />
              </div>
              <span className={`relative z-10 text-xs font-black tracking-wide uppercase mt-3 transition-colors duration-200 ${
                activeTab === 'kelola_guru' ? 'text-purple-400' : 'text-white group-hover:text-purple-300'
              }`}>
                KELOLA GURU
              </span>
              <span className="relative z-10 text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5">
                {teachers.length} Guru Terdaftar
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KONTEN MENU AKTIF: HANYA TAMPIL JIKA SALAH SATU MENU DIKLIK */}
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
            {activeTab === 'profil_sekolah' && (
            <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-0.5">
              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Form Profil Sekolah & Upload Logo */}
              <form onSubmit={handleSaveSchool} className="p-4 bg-[#181b22] rounded-2xl border border-white/5 space-y-3.5 text-xs">
                <div className="font-bold text-white text-xs border-b border-white/10 pb-1.5 flex items-center justify-between">
                  <span>Identitas &amp; Logo Sekolah</span>
                  <span className="text-[10px] text-amber-400">Admin</span>
                </div>

                {/* AREA UPLOAD LOGO SEKOLAH */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Logo Sekolah
                  </label>
                  
                  <div className="flex items-center gap-3 p-2.5 bg-[#222731] rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-xl bg-[#141820] border border-emerald-500/20 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
                      <img 
                        src={schoolData.logoUrl && schoolData.logoUrl.trim() !== '' ? schoolData.logoUrl : '/tutwuri-handayani.svg'} 
                        alt="Pratinjau Logo" 
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                        id="school-logo-input"
                      />
                      
                      <div className="flex gap-2">
                        <label
                          htmlFor="school-logo-input"
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 cursor-pointer text-white font-bold rounded-xl text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto Logo</span>
                        </label>

                        {schoolData.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl text-[11px] font-semibold"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {schoolData.logoUrl 
                          ? 'Logo khusus sekolah aktif. Klik "Hapus" untuk kembali ke logo resmi Kemendikdasmen.' 
                          : 'Jika belum upload atau dikosongkan, otomatis menggunakan logo resmi Tut Wuri Handayani Kemendikdasmen.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Instansi / Sekolah</label>
                  <input
                    type="text"
                    required
                    value={schoolData.name}
                    onChange={e => setSchoolData({ ...schoolData, name: e.target.value })}
                    placeholder="Contoh: SD NEGERI CONTOH"
                    className="w-full px-3 py-2 bg-[#222731] border border-white/10 focus:border-amber-500 rounded-xl text-white font-bold uppercase outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">NPSN</label>
                    <input
                      type="text"
                      value={schoolData.npsn || ''}
                      onChange={e => setSchoolData({ ...schoolData, npsn: e.target.value })}
                      placeholder="20202020"
                      className="w-full px-3 py-2 bg-[#222731] border border-white/10 focus:border-amber-500 rounded-xl text-white font-mono outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alamat Singkat</label>
                    <input
                      type="text"
                      value={schoolData.address || ''}
                      onChange={e => setSchoolData({ ...schoolData, address: e.target.value })}
                      placeholder="Nama Kota / Jalan"
                      className="w-full px-3 py-2 bg-[#222731] border border-white/10 focus:border-amber-500 rounded-xl text-white outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Profil &amp; Logo</span>
                </button>
              </form>

              {/* Pintasan Tinjau Guru / Siswa */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onSwitchToTeacherView}
                  className="p-2.5 bg-[#181b22] hover:bg-[#222731] rounded-xl border border-white/5 text-center text-xs font-semibold text-slate-300"
                >
                  &rarr; Tinjau Layar Guru
                </button>
                <button
                  onClick={onSwitchToStudentView}
                  className="p-2.5 bg-[#181b22] hover:bg-[#222731] rounded-xl border border-white/5 text-center text-xs font-semibold text-emerald-300"
                >
                  &rarr; Uji Layar Siswa
                </button>
              </div>
            </div>
            )}

            {activeTab === 'kelola_guru' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200">Daftar Guru Pengawas</span>
                  <button
                    onClick={handleOpenAddTeacher}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Guru</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-0.5">
                  {teachers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Belum ada guru terdaftar.
                    </div>
                  ) : (
                    teachers.map(teacher => {
                      const classes = teacher.assignedClasses && teacher.assignedClasses.length > 0 
                        ? teacher.assignedClasses 
                        : ['Kelas 1'];

                      return (
                        <div
                          key={teacher.id}
                          className="p-3 bg-[#181b22] rounded-2xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span className="truncate">{teacher.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                {classes.length > 1 ? 'Guru Mapel' : 'Wali Kelas'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              NIP: {teacher.nip} &bull; {teacher.subject}
                            </div>
                            <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-400">Kelas diampu:</span>
                              {classes.map(cls => (
                                <span key={cls} className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  {cls}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-amber-400 mt-1">
                              PIN Login / Pengawas: <strong className="font-mono">{teacher.pin}</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditTeacher(teacher)}
                              title="Edit Data Guru"
                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              title="Hapus Data Guru"
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL TAMBAH / EDIT GURU */}
      {/* ============================================================ */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xs">
          <div className="bg-[#222731] rounded-3xl max-w-sm w-full p-5 border border-white/10 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-400">
                {editingTeacherId ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <h3 className="text-sm font-bold text-white">
                  {editingTeacherId ? 'Edit Data Guru' : 'Tambah Data Guru'}
                </h3>
              </div>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="Contoh: Pak Ridwan, S.Pd"
                  className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-purple-500 rounded-xl text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">NIP / NUPTK (Opsional)</label>
                <input
                  type="text"
                  value={newTeacherNip}
                  onChange={e => setNewTeacherNip(e.target.value)}
                  placeholder="19890805..."
                  className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-purple-500 rounded-xl text-white font-mono outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tugas / Mapel</label>
                  <input
                    type="text"
                    required
                    value={newTeacherSubject}
                    onChange={e => setNewTeacherSubject(e.target.value)}
                    placeholder="Wali Kelas 1 / Guru PAI"
                    className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-purple-500 rounded-xl text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PIN Pengawas</label>
                  <input
                    type="text"
                    required
                    value={newTeacherPin}
                    onChange={e => setNewTeacherPin(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 bg-[#181b22] border border-white/10 focus:border-purple-500 rounded-xl text-white font-mono outline-hidden"
                  />
                </div>
              </div>

              {/* PEMILIHAN KELAS YANG DIAMPU */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Penugasan Kelas (Bisa pilih &gt; 1 untuk Guru Mapel)
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map(cls => {
                    const isSelected = newTeacherAssignedClasses.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => {
                          if (isSelected) {
                            if (newTeacherAssignedClasses.length > 1) {
                              setNewTeacherAssignedClasses(newTeacherAssignedClasses.filter(c => c !== cls));
                            }
                          } else {
                            setNewTeacherAssignedClasses([...newTeacherAssignedClasses, cls]);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-white'
                            : 'bg-[#181b22] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cls} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#181b22] text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
