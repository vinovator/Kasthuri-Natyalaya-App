
export enum UserRole {
  ADMIN = 'ADMIN',
  HEAD_TEACHER = 'HEAD_TEACHER',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  studentIds?: string[]; // Support for multiple students (siblings) per login
}

export interface UserAccount {
    email: string;
    password: string; // In a real app, this would be hashed
    name: string;
    role: UserRole;
}

export interface Student {
  id: string;
  name: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  dob: string; // ISO date string
  enrolledCategoryIds: string[];
  active: boolean;
  joinedDate: string;
  notes: string;
}

export interface ClassCategory {
  id: string;
  name: string; // e.g., "Beginner Adavus", "Senior Varnam"
  level: string;
  feePerHour: number;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface ScheduledClass {
  id: string;
  categoryId: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherName: string;
  location: string; // Storing name for simplicity, or ID if strict relation needed. Using name matches previous implementation.
  completed: boolean;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  present: boolean;
  markedBy: string;
  markedAt: string;
}

export interface PaymentRecord {
  id: string;
  classId: string;
  studentId: string;
  amount: number;
  paidDate: string;
  markedBy: string;
}

export type ReminderChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface Reminder {
  id: string;
  studentIds: string[];
  message: string;
  scheduledDate: string; // ISO Date string
  channels: ReminderChannel[];
  status: 'PENDING' | 'SENT';
  createdAt: string;
  createdBy: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  isPublic: boolean;
  targetAudience?: 'ALL' | 'STUDENTS' | 'TEACHERS' | string; // ID of a category
  sentVia?: ReminderChannel[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | string; // ID of a category
  author: string;
  sentVia?: ReminderChannel[];
}

export interface ProgressReport {
  id: string;
  studentId: string;
  date: string;
  term: string; // e.g., "Term 1 2024"
  skills: {
    talam: number; // 1-10 Rhythm
    bhavam: number; // 1-10 Expression
    angashudhi: number; // 1-10 Posture/Form
    memory: number; // 1-10
  };
  comments: string;
  assessedBy: string;
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export interface AppState {
  currentUser: User | null;
  userAccounts: UserAccount[]; // Storing credentials
  students: Student[];
  categories: ClassCategory[];
  locations: Location[];
  schedule: ScheduledClass[];
  attendance: AttendanceRecord[];
  fees: PaymentRecord[];
  reminders: Reminder[];
  events: Event[];
  announcements: Announcement[];
  progressReports: ProgressReport[];
  firebaseConfig?: FirebaseConfig;
}
