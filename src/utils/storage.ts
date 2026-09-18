import { Exam, SchoolInfo, TeacherRecord, StudentRecord } from '../types';

const EXAMS_STORAGE_KEY = 'kiosk_exam_list_v3';
const SCHOOL_INFO_KEY = 'kiosk_school_info_v3';
const TEACHERS_STORAGE_KEY = 'kiosk_teachers_list_v3';
const STUDENTS_STORAGE_KEY = 'kiosk_students_list_v3';
const AUTH_USER_KEY = 'kiosk_current_auth_user_v3';

export const DEFAULT_TUT_WURI_LOGO = '/tutwuri-handayani.svg';

export const DEFAULT_SCHOOL: SchoolInfo = {
  name: 'SD NEGERI CONTOH',
  npsn: '20202020',
  address: 'Jl. Pendidikan No. 123',
  logoUrl: DEFAULT_TUT_WURI_LOGO,
};

export const DEFAULT_TEACHERS: TeacherRecord[] = [
  { 
    id: 't-1', 
    name: 'Pak Ridwan, S.Pd', 
    nip: '198908052019031013', 
    subject: 'Wali Kelas 1', 
    pin: '123456',
    assignedClasses: ['Kelas 1'] 
  },
  { 
    id: 't-2', 
    name: 'Ibu Siti Aminah, S.Pd', 
    nip: '199104122020122008', 
    subject: 'Guru Mapel PAI', 
    pin: '123456',
    assignedClasses: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'] 
  },
  { 
    id: 't-3', 
    name: 'Pak Budi Santoso, S.Pd', 
    nip: '198502152014021005', 
    subject: 'Wali Kelas 5', 
    pin: '123456',
    assignedClasses: ['Kelas 5'] 
  },
];

export const DEFAULT_STUDENTS: StudentRecord[] = [
  { id: 's-1', name: 'Ahmad Fauzi', nisn: '0123456781', classRoom: 'Kelas 1', teacherId: 't-1' },
  { id: 's-2', name: 'Nurul Hidayah', nisn: '0123456782', classRoom: 'Kelas 1', teacherId: 't-1' },
  { id: 's-3', name: 'Farhan Pratama', nisn: '0123456783', classRoom: 'Kelas 5', teacherId: 't-3' },
];

const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam-demo-1',
    title: 'Penilaian Sumatif Harian - Membaca & Menulis',
    subject: 'Bahasa Indonesia',
    classLevel: 'Kelas 1',
    teacherId: 't-1',
    examType: 'google_form',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeU7k-tW4x05G_N-n8h9dK_k8eP9t0s6k6Ym_example/viewform?embedded=true',
    durationMinutes: 60,
    token: 'BIN1',
    supervisorPin: '1234',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-demo-pai-pdf',
    title: 'Asesmen Sumatif PAI & Budi Pekerti (Kelas 1)',
    subject: 'Pendidikan Agama Islam',
    classLevel: 'Kelas 1',
    teacherId: 't-2',
    examType: 'pdf_document',
    pdfFileName: 'Naskah_Soal_PAI_Kelas_1.pdf',
    // Minimal valid base64 PDF sample dengan teks Arab dan soal pilihan ganda
    pdfDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqIDw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqCjMgMCBvYmogPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pj4+ZW5kb2JqCjUgMCBvYmogPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5lbmRvYmoKNCAwIG9iaiA8PC9MZW5ndGggMzEwPj5zdHJlYW0KQlQKL0YxIDE2IFRmCjcwIDgwMCBUZAooQVNFU01FTiBTVU1BVElGIC0gUEVORElESUtBTiBBR0FNQSBJU0xBTSkgVGoKL0YxIDEwIFRmCjAgLTI1IFRkCihQZXR1bmp1azogQmFjYSBzb2FsIGRpIGJhd2FoIGluaSBkZW5nYW4gdGVsaXRpLCBzaWxhbmcgamF3YWJhbiBwYWRhIExKSyBLRVJUQVMhKSBUagovRjEgMTIgVGYKMCAtNDAgVGQKKDEuIFN1cmFoIEFsLUZhdGloYWggZGlzZWJ1dCBqdWdhIFVtbXVsIFF1ciZhcG9zO2FuLCB5YW5nIGFydGlueWEuLi4pIFRqCjIwIC0yMCBUZAooQS4gSW5kdWsgQWwtUXVyJmFwb3M7YW4pIFRqCjAgLTE1IFRkCihCLiBQZW51dHVwIEFsLVF1ciZhcG9zO2FuKSBUagowIC0xNSBUZAooQy4gQmFjYWFuIEFsLVF1ciZhcG9zO2FuKSBUagowIC0xNSBUZAooRC4gS2VtdWxpYWFuIEFsLVF1ciZhcG9zO2FuKSBUagotMjAgLTM1IFRkCigyLiBIdXJ1ZiB0YWptYXQgUGVuZ2hpZHVwIGRhbiBNYXRpIGFkYWxhaCBzaWZhdCBBbGxhaC4uLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE3IDAwMDAwIG4gCjAwMDAwMDAyOTUgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyIDw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjY1OQolJUVPRg==',
    durationMinutes: 60,
    token: 'PAI1',
    supervisorPin: '1234',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-demo-2',
    title: 'Ujian Harian IPAS - Rantai Makanan & Ekosistem',
    subject: 'IPAS',
    classLevel: 'Kelas 5',
    teacherId: 't-3',
    examType: 'google_form',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScX_sample_ipas_form/viewform?embedded=true',
    durationMinutes: 45,
    token: '',
    supervisorPin: '1234',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getStoredExams(): Exam[] {
  try {
    const data = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(DEFAULT_EXAMS));
      return DEFAULT_EXAMS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load exams', err);
    return DEFAULT_EXAMS;
  }
}

export function saveExams(exams: Exam[]): void {
  try {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error('Failed to save exams', err);
  }
}

export function getStoredTeachers(): TeacherRecord[] {
  try {
    const data = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(DEFAULT_TEACHERS));
      return DEFAULT_TEACHERS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_TEACHERS;
  }
}

export function saveTeachers(teachers: TeacherRecord[]): void {
  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  } catch (err) {
    console.error('Failed to save teachers', err);
  }
}

export function getStoredStudents(): StudentRecord[] {
  try {
    const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_STUDENTS;
  }
}

export function saveStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students', err);
  }
}

export function normalizeGoogleFormUrl(url: string): string {
  if (!url) return '';
  let cleanUrl = url.trim();
  
  if (cleanUrl.includes('docs.google.com/forms')) {
    if (cleanUrl.includes('/edit')) {
      cleanUrl = cleanUrl.replace(/\/edit.*$/, '/viewform?embedded=true');
    } else if (!cleanUrl.includes('embedded=true')) {
      const separator = cleanUrl.includes('?') ? '&' : '?';
      cleanUrl = `${cleanUrl}${separator}embedded=true`;
    }
  }
  return cleanUrl;
}

export function getSchoolInfo(): SchoolInfo {
  try {
    const data = localStorage.getItem(SCHOOL_INFO_KEY);
    return data ? JSON.parse(data) : DEFAULT_SCHOOL;
  } catch {
    return DEFAULT_SCHOOL;
  }
}

export function saveSchoolInfo(info: SchoolInfo): void {
  try {
    localStorage.setItem(SCHOOL_INFO_KEY, JSON.stringify(info));
  } catch (err) {
    console.error('Failed to save school info', err);
  }
}

export function getCurrentAuthUser(): any | null {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveCurrentAuthUser(user: any | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to save auth user', err);
  }
}
