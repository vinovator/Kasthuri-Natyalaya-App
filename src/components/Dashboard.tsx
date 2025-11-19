
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Calendar, Bell, DollarSign, Sparkles, Clock, MapPin } from 'lucide-react';
import { UserRole } from '../types';

export const Dashboard: React.FC = () => {
  const { students, schedule, announcements, currentUser, fees, categories } = useData();

  // Role Checks
  const isSuperUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HEAD_TEACHER;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  // Data Filtering based on Role
  let visibleStudents = students.filter(s => s.active);
  let visibleSchedule = schedule;
  let visibleRevenueFees = fees;

  if (isTeacher) {
      // Teachers only see data related to classes they teach
      // 1. Filter Schedule
      visibleSchedule = schedule.filter(s => s.teacherName === currentUser?.name);
      // 2. Find Categories taught by this teacher (based on their schedule)
      const taughtCategoryIds = Array.from(new Set(visibleSchedule.map(s => s.categoryId)));
      // 3. Filter Students enrolled in those categories
      visibleStudents = students.filter(s => s.active && s.enrolledCategoryIds.some(id => taughtCategoryIds.includes(id)));
      // 4. Revenue - Teachers usually don't see total revenue, or only for their classes. 
      // For safety/privacy, we'll hide revenue stats for normal teachers or show 0.
      visibleRevenueFees = []; 
  }

  // Stats
  const activeStudentsCount = visibleStudents.length;
  const futureClassesCount = visibleSchedule.filter(s => new Date(s.date) >= new Date()).length;
  const recentAnnouncements = announcements.slice(0, 3);

  // Calculate actual revenue collected from fee records
  let totalRevenue = visibleRevenueFees.reduce((acc, fee) => acc + fee.amount, 0);

  // --- Schedule Logic for Overview Panel ---
  const now = new Date();
  
  // Helper to create proper date objects for comparison
  const getClassDateTime = (dateStr: string, timeStr: string) => new Date(`${dateStr}T${timeStr}`);

  // 1. Filter for future classes (or classes currently happening)
  const futureClasses = schedule
    .filter(s => getClassDateTime(s.date, s.endTime) > now)
    .sort((a, b) => getClassDateTime(a.date, a.startTime).getTime() - getClassDateTime(b.date, b.startTime).getTime());

  // 2. Filter based on role for the List View
  let displayedClasses = futureClasses;
  
  if (currentUser?.role === UserRole.STUDENT) {
      // Handle Siblings: Get classes for ALL linked student IDs
      const myStudentIds = currentUser.studentIds || [];
      const myStudents = students.filter(s => myStudentIds.includes(s.id));
      
      if (myStudents.length > 0) {
          // Flatten all enrolled categories from all siblings
          const allEnrolledCategories = myStudents.flatMap(s => s.enrolledCategoryIds);
          displayedClasses = futureClasses.filter(s => allEnrolledCategories.includes(s.categoryId));
      } else {
          displayedClasses = [];
      }
  } else if (isTeacher) {
      // Teacher sees only their classes
      displayedClasses = futureClasses.filter(s => s.teacherName === currentUser?.name);
  }
  // Admin/Head Teacher sees all (default)

  // 3. Take top 4 to display
  const nextClasses = displayedClasses.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-natyalaya-900 rounded-xl p-8 overflow-hidden shadow-xl text-white">
         <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1576613109713-03f3b8df5c48?q=80&w=1000" className="w-full h-full object-cover" alt="Pattern" />
         </div>
         <div className="relative z-10 flex justify-between items-end">
            <div>
                <div className="flex items-center gap-2 text-gold-500 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-xs font-bold">Digital Gurukulam</span>
                </div>
                <h1 className="text-4xl font-heading font-bold mb-2">Namaste, {currentUser?.name}</h1>
                <p className="text-natyalaya-100 max-w-xl">"Where the hands go, the eyes follow; where the eyes go, the mind follows; where the mind goes, the mood follows; where the mood goes, there is flavor (Rasa)."</p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-3xl font-heading font-bold text-gold-500">
                    {new Date().getDate()}
                </div>
                <div className="text-natyalaya-200 uppercase text-sm tracking-wide">
                    {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-natyalaya-300 text-xs">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
            </div>
         </div>
      </div>

      {/* Stats Grid - Visible to Admin, Head Teacher, and Teacher (Restricted) */}
      {(isSuperUser || isTeacher) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-natyalaya-600 flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-natyalaya-50 rounded-full text-natyalaya-700 mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{isTeacher ? 'My Students' : 'Total Students'}</p>
                <p className="text-2xl font-heading font-bold text-natyalaya-900">{activeStudentsCount}</p>
              </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gold-500 flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-700 mr-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{isTeacher ? 'My Classes' : 'Total Classes'}</p>
                <p className="text-2xl font-heading font-bold text-natyalaya-900">{futureClassesCount}</p>
              </div>
          </div>

          {/* Revenue - Only for Super Users */}
          {isSuperUser && (
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600 flex items-center hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-full text-green-700 mr-4">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dakshina (Fees)</p>
                    <p className="text-2xl font-heading font-bold text-natyalaya-900">£{totalRevenue}</p>
                </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600 flex items-center hover:shadow-md transition-shadow">
             <div className="p-3 bg-purple-50 rounded-full text-purple-700 mr-4">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Announcements</p>
                <p className="text-2xl font-heading font-bold text-natyalaya-900">{announcements.length}</p>
              </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow-sm border border-natyalaya-100 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 bg-natyalaya-50 border-b border-natyalaya-100 flex justify-between items-center">
            <h2 className="font-heading font-bold text-lg text-natyalaya-900">Notice Board</h2>
            <Bell className="w-4 h-4 text-natyalaya-500" />
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {recentAnnouncements.length === 0 ? (
                <p className="p-6 text-gray-500 text-center italic">No announcements yet.</p>
            ) : (
                recentAnnouncements.map(ann => (
                <div key={ann.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-natyalaya-800 group-hover:text-natyalaya-600 transition-colors">{ann.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap font-mono">{new Date(ann.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-2">{ann.content}</p>
                    <div className="mt-3 text-[10px] uppercase tracking-wider font-bold text-natyalaya-400">
                        Audience: {ann.targetAudience}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Next Class (Student View) or Upcoming Schedule (Admin/Teacher View) */}
        <div className="bg-white rounded-xl shadow-sm border border-natyalaya-100 overflow-hidden flex flex-col h-full">
           <div className="px-6 py-4 bg-natyalaya-50 border-b border-natyalaya-100 flex justify-between items-center">
            <h2 className="font-heading font-bold text-lg text-natyalaya-900">
                {currentUser?.role === UserRole.STUDENT ? 'Your Next Practice' : 'Schedule Overview'}
            </h2>
            <Calendar className="w-4 h-4 text-natyalaya-500" />
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {nextClasses.length > 0 ? (
                <div className="space-y-4">
                    {nextClasses.map(cls => {
                        const cat = categories.find(c => c.id === cls.categoryId);
                        const isToday = new Date(cls.date).toDateString() === new Date().toDateString();
                        return (
                            <div key={cls.id} className={`flex items-center p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${isToday ? 'bg-gold-50 border-gold-200' : 'bg-white'}`}>
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-4 ${isToday ? 'bg-gold-500 text-natyalaya-900' : 'bg-natyalaya-100 text-natyalaya-700'}`}>
                                    <span className="text-xs font-bold uppercase">{new Date(cls.date).toLocaleDateString(undefined, {weekday: 'short'})}</span>
                                    <span className="text-lg font-bold leading-none">{new Date(cls.date).getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-natyalaya-900 truncate">{cat?.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {cls.startTime} - {cls.endTime}</span>
                                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {cls.location}</span>
                                    </div>
                                </div>
                                {isToday && (
                                    <div className="ml-2 px-2 py-1 bg-gold-100 text-gold-800 text-[10px] font-bold uppercase rounded">Today</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                    <Calendar className="w-12 h-12 mb-2 opacity-20" />
                    <p>No upcoming classes scheduled.</p>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                 <p className="text-xs text-gray-500">
                    {currentUser?.role === UserRole.STUDENT 
                        ? "View your full timetable in the 'Classes' tab." 
                        : "Manage full schedule and attendance in 'Classes'."}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
