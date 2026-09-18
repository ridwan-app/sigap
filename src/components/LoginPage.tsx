import { useState, FormEvent } from 'react';
import { Shield, GraduationCap, UserCheck, Key, Lock, ArrowRight, School, User } from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { getStoredTeachers, getStoredStudents } from '../utils/storage';
import { FuturisticHeaderOrnament } from './FuturisticHeaderOrnament';

interface LoginPageProps {
  schoolName: string;
  schoolLogoUrl?: string;
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginPage({ schoolName, schoolLogoUrl, onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Input fields
  const [studentNisn, setStudentNisn] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Kelas 1');
  const [showStudentExtraFields, setShowStudentExtraFields] = useState(false);

  const [teacherPin, setTeacherPin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'student') {
      const inputId = studentNisn.trim();
      if (!inputId) {
        setErrorMsg('Masukkan NISN / NIS / No. Peserta!');
        return;
      }

      const storedStudents = getStoredStudents();
      // Cari siswa berdasarkan NISN/NIS atau Nama
      const matchedStudent = storedStudents.find(
        s => (s.nisn && s.nisn.toLowerCase() === inputId.toLowerCase()) ||
             (s.name && s.name.toLowerCase() === inputId.toLowerCase())
      );

      if (matchedStudent) {
        onLoginSuccess({
          role: 'student',
          name: matchedStudent.name.toUpperCase(),
          identifier: matchedStudent.nisn,
          classRoom: matchedStudent.classRoom || 'Kelas 1',
          teacherId: matchedStudent.teacherId,
        });
        return;
      }

      // Jika belum terdaftar di Data Siswa dan belum isi Nama Extra
      if (!showStudentExtraFields && !studentName.trim()) {
        setShowStudentExtraFields(true);
        setErrorMsg('NISN / No. Peserta belum terdaftar di sistem. Silakan lengkapi Nama Lengkap & Kelas Anda di bawah.');
        return;
      }

      if (showStudentExtraFields && !studentName.trim()) {
        setErrorMsg('Nama Lengkap siswa wajib diisi!');
        return;
      }

      onLoginSuccess({
        role: 'student',
        name: (studentName.trim() || 'SISWA ' + inputId).toUpperCase(),
        identifier: inputId,
        classRoom: studentClass.trim() || 'Kelas 1',
      });
    } else if (selectedRole === 'teacher') {
      const teachers = getStoredTeachers();

      // Cek apakah PIN cocok dengan salah satu guru yang terdaftar di Admin (Kelola Guru)
      const matchedTeacher = teachers.find(
        t => t.pin === teacherPin.trim() || (t.nip && t.nip !== '-' && t.nip === teacherPin.trim())
      );

      if (matchedTeacher) {
        onLoginSuccess({
          role: 'teacher',
          name: matchedTeacher.name,
          identifier: matchedTeacher.nip || matchedTeacher.id,
          teacherId: matchedTeacher.id,
          assignedClasses: matchedTeacher.assignedClasses && matchedTeacher.assignedClasses.length > 0 
            ? matchedTeacher.assignedClasses 
            : ['Kelas 1'],
        });
        return;
      }

      setErrorMsg('PIN Guru tidak terdaftar. Masukkan PIN yang terdaftar di Kelola Guru (Admin)!');
      return;
    } else if (selectedRole === 'admin') {
      // Password admin sekolah (default: admin123)
      if (adminPassword !== 'admin123') {
        setErrorMsg('Password Admin salah! (Default: admin123)');
        return;
      }
      onLoginSuccess({
        role: 'admin',
        name: 'ADMINISTRATOR SEKOLAH',
        identifier: 'ADMIN-UTAMA',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#181b22] text-slate-800 flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bersih: Logo & Nama Sekolah (Futuristik Cerah Berornamen SiPERLU-style) */}
        <div className="relative overflow-hidden p-6 text-center rounded-b-[32px] shadow-xl shadow-green-950/40">
          {/* Ornamen Latar Hijau Cerah & Pita Gelombang Futuristik */}
          <FuturisticHeaderOrnament />

          {/* Logo Sekolah: Logo Custom Sekolah atau Default Resmi Tut Wuri Handayani Kemendikdasmen */}
          <div className="relative z-10 w-24 h-24 mx-auto flex items-center justify-center mb-2.5 drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]">
            <img
              src={schoolLogoUrl && schoolLogoUrl.trim() !== '' ? schoolLogoUrl : '/tutwuri-handayani.svg'}
              alt="Logo Sekolah"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="relative z-10 text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] line-clamp-1">
            {schoolName}
          </h1>
          <p className="relative z-10 text-[10px] sm:text-[11px] font-bold text-emerald-100 tracking-wider uppercase mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            SIGAP &bull; SISTEM GEMBOK ASESMEN &amp; PEMBELAJARAN
          </p>
        </div>

        {/* Pemilih Peran (Tab Bersih: Siswa / Guru / Admin) */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => { setSelectedRole('student'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'student'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('teacher'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'teacher'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Guru</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {selectedRole === 'student' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NISN / NO. PESERTA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={studentNisn}
                      onChange={e => {
                        setStudentNisn(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="NISN / No. Peserta"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-hidden uppercase font-mono"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {showStudentExtraFields && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        NAMA LENGKAP SISWA
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Nama Lengkap"
                        className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-hidden uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        KELAS
                      </label>
                      <input
                        type="text"
                        required
                        value={studentClass}
                        onChange={e => setStudentClass(e.target.value)}
                        placeholder="Kelas (contoh: 5A)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedRole === 'teacher' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PIN PENGAWAS (GURU)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={teacherPin}
                    onChange={e => setTeacherPin(e.target.value)}
                    placeholder="PIN Pengawas"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl text-xs text-slate-900 outline-hidden font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            {selectedRole === 'admin' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PASSWORD ADMINISTRATOR
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Password Admin"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-hidden font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 mt-2 rounded-xl text-xs font-black tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all ${
                selectedRole === 'student'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  : selectedRole === 'teacher'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
              }`}
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
