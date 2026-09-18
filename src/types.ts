export type UserRole = 'admin' | 'teacher' | 'student';

export interface SchoolInfo {
  name: string;
  npsn?: string;
  address?: string;
  logoUrl?: string; // Base64 data URL atau link gambar logo sekolah
}

export interface TeacherRecord {
  id: string;
  name: string;
  nip: string;
  subject: string;
  pin: string;
  assignedClasses: string[]; // Contoh: ['Kelas 1'] atau ['Kelas 1', 'Kelas 2', 'Kelas 5']
}

export interface StudentRecord {
  id: string;
  name: string;
  nisn: string;
  classRoom: string;
  teacherId?: string; // ID Guru pembuat/pengampu
}

export interface AuthUser {
  role: UserRole;
  name: string;
  identifier: string; // NISN untuk siswa, NIP/Kode untuk Guru/Admin
  classRoom?: string;
  teacherId?: string;
  assignedClasses?: string[];
}

export type ExamType = 'google_form' | 'pdf_document' | 'material_document';
export type MaterialContentType = 'file' | 'link';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  teacherId?: string; // ID Guru pembuat soal
  examType?: ExamType; // 'google_form', 'pdf_document', atau 'material_document'
  materialContentType?: MaterialContentType; // 'file' atau 'link' untuk materi
  googleFormUrl?: string; // URL Google Form atau Link Materi Web / YouTube / Canva dsb
  pdfDataUrl?: string; // Base64 data URL atau link dokumen soal / materi
  pdfFileName?: string; // Nama file asli (misal: "Materi_IPA_Siklus_Air.pdf", "Presentasi.pptx", dll)
  fileType?: string; // MIME type atau ekstensi file (pdf, docx, pptx, xlsx, image, video, dll)
  durationMinutes: number;
  scheduleDate?: string; // YYYY-MM-DD atau kosong jika fleksibel
  scheduleStartTime?: string; // HH:mm misal '08:00'
  scheduleEndTime?: string; // HH:mm misal '09:30'
  token?: string; // Token opsional
  supervisorPin: string; // PIN Guru pengawas untuk keluar (opsional jika materi)
  targetStudentNisns?: string[]; // Jika kosong: Semua siswa di kelas. Jika diisi: Hanya siswa dengan NISN terdaftar (Remedial/Susulan/Pengayaan)
  isActive: boolean;
  createdAt: string;
}

export interface StudentSession {
  studentName: string;
  nisn: string;
  classRoom: string;
  examId: string;
  examTitle: string;
  subject: string;
  startTime: number; // timestamp ms
  durationMinutes: number;
  isCompleted: boolean;
}

export type AppView = 'student' | 'teacher' | 'admin';
