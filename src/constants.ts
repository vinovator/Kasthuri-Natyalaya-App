
import { ClassCategory, Student, UserRole, AppState, Location, ScheduledClass, PaymentRecord, AttendanceRecord, Event, Announcement, ProgressReport, Reminder, UserAccount } from './types';

export const APP_NAME = "Kasthuri Natyalaya";
export const ADMIN_EMAIL = "vinovator@gmail.com";
export const TEACHER_EMAIL = "sowbhakyarajabojan@gmail.com";

// Pre-defined categories for initial load
export const INITIAL_CATEGORIES: ClassCategory[] = [
  {
    id: 'cat_1',
    name: 'Beginner Adavus',
    level: 'Level 1',
    feePerHour: 10,
    description: 'Fundamental steps and basic rhythm training.'
  },
  {
    id: 'cat_2',
    name: 'Intermediate Alarippu',
    level: 'Level 2',
    feePerHour: 15,
    description: 'Introduction to items and abhinaya.'
  },
  {
    id: 'cat_3',
    name: 'Senior Varnam',
    level: 'Level 3',
    feePerHour: 20,
    description: 'Advanced intricate footwork and expressions.'
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc_1',
    name: 'Main Hall',
    address: '123 Dance Lane, London'
  },
  {
    id: 'loc_2',
    name: 'Studio 1',
    address: '123 Dance Lane, London'
  },
  {
    id: 'loc_online',
    name: 'Online (Zoom)',
    address: 'Remote'
  }
];

// Helper to get dates relative to today
const getRelativeDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    name: 'Ananya Krishna',
    parentName: 'Krishna Kumar',
    email: 'ananya@example.com',
    phone: '07700900123',
    address: '123 Dance Lane, London',
    dob: '2015-05-20',
    enrolledCategoryIds: ['cat_1'], // Enrolled in Beginner
    active: true,
    joinedDate: '2024-01-10',
    notes: 'Shows good promise with rhythm.'
  },
  {
    id: 'stu_2',
    name: 'Priya Sharma',
    parentName: 'Rohit Sharma',
    email: 'priya@example.com',
    phone: '07700900456',
    address: '45 Temple Rd, London',
    dob: '2014-08-15',
    enrolledCategoryIds: ['cat_2'], // Enrolled in Intermediate
    active: true,
    joinedDate: '2024-02-01',
    notes: 'Excellent expression.'
  },
  {
    id: 'stu_3',
    name: 'Rahul Verma',
    parentName: 'Sanjay Verma',
    email: 'rahul@example.com',
    phone: '07700900789',
    address: '78 High St, London',
    dob: '2013-12-10',
    enrolledCategoryIds: ['cat_1', 'cat_2'], // Enrolled in Both
    active: true,
    joinedDate: '2023-11-20',
    notes: 'Hardworking but needs focus on posture.'
  }
];

// Initial Accounts with passwords
export const INITIAL_ACCOUNTS: UserAccount[] = [
    {
        email: ADMIN_EMAIL,
        password: 'admin',
        name: 'Vinovator',
        role: UserRole.ADMIN
    },
    {
        email: TEACHER_EMAIL,
        password: 'admin',
        name: 'Sowbhakya Rajabojan',
        role: UserRole.HEAD_TEACHER // UPDATED TO HEAD_TEACHER
    },
    {
        email: 'ananya@example.com',
        password: 'password123',
        name: 'Ananya Krishna',
        role: UserRole.STUDENT
    },
    {
        email: 'priya@example.com',
        password: 'password123',
        name: 'Priya Sharma',
        role: UserRole.STUDENT
    },
    {
        email: 'rahul@example.com',
        password: 'password123',
        name: 'Rahul Verma',
        role: UserRole.STUDENT
    }
];

export const INITIAL_SCHEDULE: ScheduledClass[] = [
  // PAST CLASS 1: Beginner Adavus (1 week ago)
  {
    id: 'cls_past_1',
    categoryId: 'cat_1',
    date: getRelativeDate(-7),
    startTime: '17:00',
    endTime: '18:00', // 1hr = £10 fee
    teacherName: 'Sowbhakya Rajabojan',
    location: 'Main Hall',
    completed: true
  },
  // PAST CLASS 2: Intermediate Alarippu (3 days ago)
  {
    id: 'cls_past_2',
    categoryId: 'cat_2',
    date: getRelativeDate(-3),
    startTime: '18:00',
    endTime: '19:30', // 1.5hr = £22.5 fee
    teacherName: 'Sowbhakya Rajabojan',
    location: 'Studio 1',
    completed: true
  },
  // FUTURE CLASS: Beginner Adavus (Tomorrow)
  {
    id: 'cls_future_1',
    categoryId: 'cat_1',
    date: getRelativeDate(1),
    startTime: '17:00',
    endTime: '18:00',
    teacherName: 'Sowbhakya Rajabojan',
    location: 'Main Hall',
    completed: false
  }
];

// Initial Payments
export const INITIAL_FEES: PaymentRecord[] = [
    // Ananya paid for the class 1 week ago
    {
        id: 'pay_1',
        classId: 'cls_past_1',
        studentId: 'stu_1',
        amount: 10,
        paidDate: getRelativeDate(-6),
        markedBy: 'System'
    }
    // Rahul (stu_3) was in cls_past_1 but hasn't paid (Should show as pending)
    // Priya (stu_2) was in cls_past_2 but hasn't paid (Should show as pending)
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt_1',
    title: 'Vijayadasami Celebration',
    date: getRelativeDate(10),
    description: 'Annual Vidyarambam ceremony for new students and performance by seniors.',
    location: 'Main Hall',
    isPublic: true
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Holiday Notice',
    content: 'Classes will be suspended for Diwali break from Oct 30th to Nov 4th.',
    date: getRelativeDate(-2),
    targetAudience: 'ALL',
    author: 'Sowbhakya Rajabojan'
  }
];

export const INITIAL_STATE: AppState = {
  currentUser: null,
  userAccounts: INITIAL_ACCOUNTS,
  students: INITIAL_STUDENTS,
  categories: INITIAL_CATEGORIES,
  locations: INITIAL_LOCATIONS,
  schedule: INITIAL_SCHEDULE,
  attendance: [],
  fees: INITIAL_FEES,
  reminders: [],
  events: INITIAL_EVENTS,
  announcements: INITIAL_ANNOUNCEMENTS,
  progressReports: []
};
