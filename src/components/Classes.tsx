
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ScheduledClass, AttendanceRecord, UserRole } from '../types';
import { Calendar, Clock, CheckCircle, XCircle, Settings, Plus, CheckSquare, History, PieChart, Filter } from 'lucide-react';

export const Classes: React.FC = () => {
  const { categories, locations, schedule, students, attendance, scheduleClass, markAttendance, markBulkAttendance, currentUser } = useData();
  
  const [view, setView] = useState<'SCHEDULE' | 'ATTENDANCE'>('SCHEDULE');
  const [studentView, setStudentView] = useState<'SCHEDULE' | 'HISTORY'>('SCHEDULE');
  
  // Schedule Form
  const [schedForm, setSchedForm] = useState<Partial<ScheduledClass>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00', endTime: '19:00', location: 'Studio 1'
  });

  // Attendance Selection
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

  // Role Logic
  const isSuperUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HEAD_TEACHER;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedForm.categoryId) return;
    
    if (schedForm.startTime && schedForm.endTime && schedForm.startTime >= schedForm.endTime) {
        alert("End time must be after start time.");
        return;
    }

    scheduleClass({
        id: `class_${Date.now()}`,
        completed: false,
        teacherName: currentUser?.name || 'Teacher', // Auto-assign creator
        ...schedForm as any
    });
    // Reset
    setSchedForm({ ...schedForm, date: new Date().toISOString().split('T')[0] });
  };

  const toggleAttendance = (studentId: string, present: boolean) => {
    if(!selectedClassId || !currentUser) return;
    markAttendance({
        id: `${selectedClassId}_${studentId}`,
        classId: selectedClassId,
        studentId: studentId,
        present: present,
        markedBy: currentUser.email,
        markedAt: new Date().toISOString()
    });
  };

  const markAllPresent = () => {
      if (!selectedClassId || !currentUser) return;
      
      const cls = schedule.find(c => c.id === selectedClassId);
      if (!cls) return;

      const studentsInClass = students.filter(s => s.active && s.enrolledCategoryIds.includes(cls.categoryId));
      
      const bulkRecords: AttendanceRecord[] = studentsInClass.map(s => ({
          id: `${selectedClassId}_${s.id}`,
          classId: selectedClassId,
          studentId: s.id,
          present: true,
          markedBy: currentUser.email,
          markedAt: new Date().toISOString()
      }));

      markBulkAttendance(bulkRecords);
  };

  const getAttendanceStatus = (classId: string, studentId: string) => {
      const record = attendance.find(a => a.classId === classId && a.studentId === studentId);
      if (!record) return null;
      return record.present;
  };

  // Filter Schedule based on Role
  let filteredSchedule = schedule;
  if (isTeacher) {
      filteredSchedule = schedule.filter(s => s.teacherName === currentUser?.name);
  }

  // Sort schedule by date desc
  const sortedSchedule = [...filteredSchedule].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (currentUser?.role === UserRole.STUDENT) {
      // Student View (Supports Siblings)
      const myStudentIds = currentUser.studentIds || [];
      const myStudents = students.filter(s => myStudentIds.includes(s.id));

      if (myStudents.length === 0) return <div className="p-8 text-center text-gray-500">No student profile linked to this account.</div>;

      // Gather enrolled category IDs from all siblings
      const allEnrolledIds = myStudents.flatMap(s => s.enrolledCategoryIds);
      const mySchedule = [...schedule].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(s => allEnrolledIds.includes(s.categoryId));
      
      // History for all siblings
      const pastClasses = mySchedule.filter(s => new Date(s.date) <= new Date());
      
      const myHistory = pastClasses.map(cls => {
            const cat = categories.find(c => c.id === cls.categoryId);
            // Find which student this class belongs to
            const studentForClass = myStudents.find(s => s.enrolledCategoryIds.includes(cls.categoryId));
            const record = attendance.find(a => a.classId === cls.id && a.studentId === studentForClass?.id);
            
            return { 
                classId: cls.id,
                classDate: cls.date, 
                className: cat?.name, 
                startTime: cls.startTime,
                studentName: studentForClass?.name || 'Unknown',
                present: record ? record.present : null, // Null means not marked yet
                isMarked: !!record
            };
      });

      // Correction: Only count classes where attendance was actually marked to get accurate %
      const markedClasses = myHistory.filter(h => h.present !== null);
      const totalMarked = markedClasses.length;
      const totalPresent = markedClasses.filter(h => h.present === true).length;
      const attendanceRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

      return (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-heading font-bold text-natyalaya-900">My Classes</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setStudentView('SCHEDULE')} className={`px-3 py-1 rounded-md flex items-center ${studentView === 'SCHEDULE' ? 'bg-natyalaya-700 text-white shadow' : 'bg-white border text-gray-600'}`}>
                        <Calendar className="w-4 h-4 mr-2"/> Schedule
                    </button>
                    <button onClick={() => setStudentView('HISTORY')} className={`px-3 py-1 rounded-md flex items-center ${studentView === 'HISTORY' ? 'bg-natyalaya-700 text-white shadow' : 'bg-white border text-gray-600'}`}>
                        <History className="w-4 h-4 mr-2"/> Attendance
                    </button>
                </div>
            </div>

            {studentView === 'SCHEDULE' && (
                <div className="grid gap-4">
                    {mySchedule.filter(s => new Date(s.date) >= new Date()).length === 0 && <p className="text-gray-500 italic">No upcoming classes.</p>}
                    {mySchedule.filter(s => new Date(s.date) >= new Date()).map(cls => {
                        const cat = categories.find(c => c.id === cls.categoryId);
                        // Identify which sibling is attending
                        const attendee = myStudents.find(s => s.enrolledCategoryIds.includes(cls.categoryId));
                        
                        return (
                            <div key={cls.id} className="bg-white p-5 rounded-lg shadow border-l-4 border-natyalaya-600 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-natyalaya-900">{cat?.name}</h3>
                                    {myStudents.length > 1 && <p className="text-xs font-bold text-natyalaya-600 uppercase tracking-wider mb-1">For: {attendee?.name}</p>}
                                    <p className="text-gray-600 text-sm flex items-center mt-1">
                                        <Calendar className="w-4 h-4 inline mr-2 text-gold-600"/> {new Date(cls.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500 text-sm flex items-center mt-1 ml-6">
                                        <Clock className="w-3 h-3 inline mr-1"/> {cls.startTime} - {cls.endTime}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    <p className="font-bold text-natyalaya-700">{cls.location}</p>
                                    <p>Teacher: {cls.teacherName.split(' ')[0]}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {studentView === 'HISTORY' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded shadow border-t-4 border-blue-500 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Classes Recorded</p>
                            <p className="text-2xl font-bold text-gray-800">{totalMarked}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-t-4 border-green-500 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Days Present</p>
                            <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-t-4 border-purple-500 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Attendance %</p>
                            <p className="text-2xl font-bold text-purple-700">{attendanceRate}%</p>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-natyalaya-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class & Student</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {myHistory.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.classDate} <span className="text-gray-400 text-xs ml-1">{record.startTime}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                            <div>{record.className}</div>
                                            {myStudents.length > 1 && <div className="text-xs text-gray-500">{record.studentName}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {record.present === true && 
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-bold">Present</span>
                                            }
                                            {record.present === false && 
                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-bold">Absent</span>
                                            }
                                            {record.present === null && 
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500 italic">Not Marked</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {myHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No past classes found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </div>
      )
  }

  // Admin / Head Teacher / Teacher View
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-3xl font-heading font-bold text-natyalaya-900">Class Management</h1>
            <div className="flex space-x-2">
                <button onClick={() => setView('SCHEDULE')} className={`px-4 py-2 rounded-lg flex items-center transition-colors ${view === 'SCHEDULE' ? 'bg-natyalaya-700 text-white' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}>
                    <Calendar className="w-4 h-4 mr-2"/> Schedule
                </button>
                <button onClick={() => setView('ATTENDANCE')} className={`px-4 py-2 rounded-lg flex items-center transition-colors ${view === 'ATTENDANCE' ? 'bg-natyalaya-700 text-white' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}>
                    <CheckSquare className="w-4 h-4 mr-2"/> Attendance
                </button>
            </div>
        </div>

        {view === 'SCHEDULE' && (
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white p-6 rounded shadow h-fit">
                    <h3 className="font-bold mb-4 flex items-center text-natyalaya-900"><Plus className="w-4 h-4 mr-2"/> Schedule New Class</h3>
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select required className="w-full p-2 border rounded mt-1" value={schedForm.categoryId} onChange={e => setSchedForm({...schedForm, categoryId: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <input type="date" required className="w-full p-2 border rounded mt-1" value={schedForm.date} onChange={e => setSchedForm({...schedForm, date: e.target.value})} />
                        </div>
                        <div className="flex gap-2">
                             <div className="w-1/2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start</label>
                                <input type="time" required className="w-full p-2 border rounded mt-1" value={schedForm.startTime} onChange={e => setSchedForm({...schedForm, startTime: e.target.value})} />
                             </div>
                             <div className="w-1/2">
                                <label className="text-xs font-bold text-gray-500 uppercase">End</label>
                                <input type="time" required className="w-full p-2 border rounded mt-1" value={schedForm.endTime} onChange={e => setSchedForm({...schedForm, endTime: e.target.value})} />
                             </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                            <select className="w-full p-2 border rounded mt-1" value={schedForm.location} onChange={e => setSchedForm({...schedForm, location: e.target.value})}>
                                {locations.length === 0 && <option value="">No locations configured</option>}
                                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                            </select>
                        </div>
                        {/* Only Super Users can assign other teachers, standard teachers assign themselves automatically */}
                        {isSuperUser && (
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Teacher Name</label>
                                <input className="w-full p-2 border rounded mt-1" value={schedForm.teacherName} onChange={e => setSchedForm({...schedForm, teacherName: e.target.value})} placeholder="Default: Sowbhakya" />
                            </div>
                        )}
                        <button type="submit" className="w-full bg-natyalaya-700 text-white py-2 rounded hover:bg-natyalaya-800 font-bold">Add to Schedule</button>
                    </form>
                </div>
                <div className="md:col-span-2 space-y-4">
                     <h3 className="font-bold text-natyalaya-900">{isTeacher ? 'My Upcoming Classes' : 'Upcoming Schedule'}</h3>
                     {sortedSchedule.length === 0 ? <p className="text-gray-500 italic">No classes scheduled.</p> : 
                        sortedSchedule.map(cls => {
                            const cat = categories.find(c => c.id === cls.categoryId);
                            return (
                                <div key={cls.id} className="bg-white p-4 border-l-4 border-natyalaya-400 rounded shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-natyalaya-900">{cat?.name}</h4>
                                            <div className="text-sm text-gray-600 flex gap-4 mt-1">
                                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-gold-600"/> {cls.date}</span>
                                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-gold-600"/> {cls.startTime} - {cls.endTime}</span>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <p className="font-medium text-natyalaya-700">{cls.location}</p>
                                            <p>Teacher: {cls.teacherName}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                     }
                </div>
            </div>
        )}

        {view === 'ATTENDANCE' && (
            <div className="bg-white rounded shadow p-6 min-h-[500px]">
                <div className="flex justify-between items-end mb-6 border-b pb-6">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-bold text-natyalaya-900 mb-2">Select Class Session:</label>
                        <select className="w-full p-2 border rounded focus:ring-natyalaya-500 focus:border-natyalaya-500" onChange={(e) => setSelectedClassId(e.target.value)} value={selectedClassId || ''}>
                            <option value="">-- Choose a scheduled class --</option>
                            {sortedSchedule.map(cls => {
                                const cat = categories.find(c => c.id === cls.categoryId);
                                return <option key={cls.id} value={cls.id}>{cls.date} @ {cls.startTime} - {cat?.name}</option>
                            })}
                        </select>
                    </div>
                    {selectedClassId && (
                         <div className="flex gap-2">
                            <button
                                onClick={() => setShowAllStudents(!showAllStudents)}
                                className={`px-4 py-2 border rounded-md flex items-center text-sm font-bold transition-colors ${showAllStudents ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-600'}`}
                                title="Show students not enrolled in this category (Drop-ins)"
                            >
                                <Filter className="w-4 h-4 mr-2"/> {showAllStudents ? 'Showing All' : 'Enrolled Only'}
                            </button>
                            <button 
                                onClick={markAllPresent}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow flex items-center text-sm font-bold"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark All Present
                            </button>
                         </div>
                    )}
                </div>

                {selectedClassId ? (
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-200">
                                 {students
                                    .filter(s => {
                                        const cls = schedule.find(c => c.id === selectedClassId);
                                        // Default: Show only enrolled
                                        if (!showAllStudents) {
                                            return s.active && s.enrolledCategoryIds.includes(cls?.categoryId || '');
                                        }
                                        // Show All: Show active students
                                        return s.active;
                                    })
                                    .map(student => {
                                        const status = getAttendanceStatus(selectedClassId, student.id);
                                        const cls = schedule.find(c => c.id === selectedClassId);
                                        const isEnrolled = student.enrolledCategoryIds.includes(cls?.categoryId || '');

                                        return (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{student.name}</div>
                                                    {!isEnrolled && <span className="text-[10px] uppercase bg-gray-200 px-2 rounded text-gray-600">Drop-in / Trial</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {status === true && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Present</span>}
                                                    {status === false && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Absent</span>}
                                                    {status === null && <span className="text-gray-400 text-xs italic">Not Marked</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button title="Mark Present" onClick={() => toggleAttendance(student.id, true)} className={`p-2 rounded-full transition-colors ${status === true ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-400 hover:bg-green-200 hover:text-green-700'}`}><CheckCircle className="w-5 h-5" /></button>
                                                        <button title="Mark Absent" onClick={() => toggleAttendance(student.id, false)} className={`p-2 rounded-full transition-colors ${status === false ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-400 hover:bg-red-200 hover:text-red-700'}`}><XCircle className="w-5 h-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                 }
                             </tbody>
                         </table>
                         {students.filter(s => {
                                const cls = schedule.find(c => c.id === selectedClassId);
                                return s.active && s.enrolledCategoryIds.includes(cls?.categoryId || '');
                         }).length === 0 && !showAllStudents && (
                             <p className="text-center text-gray-500 mt-8 italic">No students enrolled in this class category.</p>
                         )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Please select a class session above to mark attendance.</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
