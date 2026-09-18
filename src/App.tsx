import { useState, useEffect } from 'react';
import { Exam, StudentSession, AuthUser, SchoolInfo } from './types';
import { getStoredExams, getSchoolInfo, getCurrentAuthUser, saveCurrentAuthUser } from './utils/storage';
import { LoginPage } from './components/LoginPage';
import { StudentPortal } from './components/StudentPortal';
import { LockedExamRoom } from './components/LockedExamRoom';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => getSchoolInfo());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentAuthUser());
  const [exams, setExams] = useState<Exam[]>([]);

  // Sesi ujian aktif
  const [activeSession, setActiveSession] = useState<StudentSession | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Sesi ujian selesai
  const [completedSession, setCompletedSession] = useState<StudentSession | null>(null);

  // Admin sub-view (apakah admin sedang meninjau mode guru atau siswa)
  const [adminSubView, setAdminSubView] = useState<'admin_panel' | 'as_teacher' | 'as_student'>('admin_panel');

  useEffect(() => {
    const loaded = getStoredExams();
    setExams(loaded);
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    saveCurrentAuthUser(user);
    setAdminSubView('admin_panel');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentAuthUser(null);
    setActiveExam(null);
    setActiveSession(null);
    setAdminSubView('admin_panel');
  };

  const handleStartExam = (
    exam: Exam,
    studentData: { name: string; classRoom: string; nisn: string }
  ) => {
    const session: StudentSession = {
      studentName: studentData.name,
      nisn: studentData.nisn,
      classRoom: studentData.classRoom,
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      startTime: Date.now(),
      durationMinutes: exam.durationMinutes,
      isCompleted: false,
    };

    setActiveExam(exam);
    setActiveSession(session);
    setCompletedSession(null);
  };

  const handleFinishExam = () => {
    if (activeSession) {
      setCompletedSession({
        ...activeSession,
        isCompleted: true,
      });
    }
    setActiveExam(null);
    setActiveSession(null);
  };

  const handleCancelExam = () => {
    setActiveExam(null);
    setActiveSession(null);
  };

  // 1. JIKA SEDANG UJIAN TERKUNCI (100% LAYAR PENUH)
  if (activeSession && activeExam) {
    return (
      <LockedExamRoom
        exam={activeExam}
        session={activeSession}
        onFinishExam={handleFinishExam}
        onCancelExam={handleCancelExam}
      />
    );
  }

  // 2. JIKA BELUM LOGIN: HALAMAN LOGIN MULTI-ROLE
  if (!currentUser) {
    return (
      <LoginPage
        schoolName={schoolInfo.name}
        schoolLogoUrl={schoolInfo.logoUrl}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. JIKA LOGIN SEBAGAI SISWA: TAMPILAN KARTU SISWA (MURNI UJIAN)
  if (currentUser.role === 'student') {
    return (
      <StudentPortal
        exams={exams}
        schoolName={schoolInfo.name}
        schoolLogoUrl={schoolInfo.logoUrl}
        currentUser={currentUser}
        onStartExam={handleStartExam}
        completedExamSession={completedSession}
        onResetCompletedSession={() => setCompletedSession(null)}
        onLogout={handleLogout}
      />
    );
  }

  // 4. JIKA LOGIN SEBAGAI GURU: TAMPILAN KARTU GURU (PENGAWAS SOAL)
  if (currentUser.role === 'teacher') {
    return (
      <TeacherDashboard
        exams={exams}
        schoolName={schoolInfo.name}
        schoolLogoUrl={schoolInfo.logoUrl}
        currentUser={currentUser}
        onUpdateExams={setExams}
        onPreviewAsStudent={exam => {
          handleStartExam(exam, {
            name: 'GURU (PRATINJAU)',
            classRoom: 'Ruang Pengawas',
            nisn: '0000000000',
          });
        }}
        onLogout={handleLogout}
      />
    );
  }

  // 5. JIKA LOGIN SEBAGAI ADMIN: SUPER ADMIN DENGAN AKSES TINJAU GURU DAN SISWA
  if (currentUser.role === 'admin') {
    if (adminSubView === 'as_teacher') {
      return (
        <div className="min-h-screen bg-[#181b22] text-white flex flex-col font-sans">
          <div className="bg-amber-600 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-950">
            <span>[MODE ADMIN] Meninjau Panel Guru</span>
            <button
              onClick={() => setAdminSubView('admin_panel')}
              className="bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded text-white font-semibold"
            >
              &larr; Kembali ke Panel Admin
            </button>
          </div>
          <TeacherDashboard
            exams={exams}
            schoolName={schoolInfo.name}
            schoolLogoUrl={schoolInfo.logoUrl}
            currentUser={currentUser}
            onUpdateExams={setExams}
            onLogout={() => setAdminSubView('admin_panel')}
          />
        </div>
      );
    }

    if (adminSubView === 'as_student') {
      const simulatedStudent: AuthUser = {
        role: 'student',
        name: 'SIMULASI SISWA (ADMIN)',
        identifier: '0000000000',
        classRoom: 'Kelas 5A',
      };

      return (
        <div className="min-h-screen bg-[#181b22] text-white flex flex-col font-sans">
          <div className="bg-amber-600 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-950">
            <span>[MODE ADMIN] Menguji Tampilan Layar Siswa</span>
            <button
              onClick={() => setAdminSubView('admin_panel')}
              className="bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded text-white font-semibold"
            >
              &larr; Kembali ke Panel Admin
            </button>
          </div>
          <StudentPortal
            exams={exams}
            schoolName={schoolInfo.name}
            schoolLogoUrl={schoolInfo.logoUrl}
            currentUser={simulatedStudent}
            onStartExam={handleStartExam}
            completedExamSession={completedSession}
            onResetCompletedSession={() => setCompletedSession(null)}
            onLogout={() => setAdminSubView('admin_panel')}
          />
        </div>
      );
    }

    return (
      <AdminDashboard
        schoolInfo={schoolInfo}
        currentUser={currentUser}
        onUpdateSchoolInfo={setSchoolInfo}
        onSwitchToStudentView={() => setAdminSubView('as_student')}
        onSwitchToTeacherView={() => setAdminSubView('as_teacher')}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
