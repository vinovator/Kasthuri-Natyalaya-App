
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole, ScheduledClass, ClassCategory, Student, Reminder, ReminderChannel } from '../types';
import { PoundSterling, Search, Send, CheckCircle, XCircle, AlertCircle, Loader2, User, Edit2, Trash2, CalendarClock, CheckSquare, Square, Clock, Mail, MessageSquare, MessageCircle } from 'lucide-react';
import { generateFeeReminder, generateBulkFeeReminder } from '../services/geminiService';

// Helper to calculate fee for a specific class instance
const calculateClassFee = (cls: ScheduledClass, category?: ClassCategory): number => {
  if (!category) return 0;
  const start = new Date(`1970-01-01T${cls.startTime}`);
  const end = new Date(`1970-01-01T${cls.endTime}`);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.round((durationHours * category.feePerHour) * 100) / 100;
};

export const Fees: React.FC = () => {
  const { students, schedule, categories, fees, attendance, currentUser, togglePayment, updatePayment, addReminder, reminders, deleteReminder } = useData();
  const [tab, setTab] = useState<'OVERVIEW' | 'BY_CLASS' | 'BY_STUDENT' | 'SCHEDULED_REMINDERS'>('OVERVIEW');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Bulk Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Compose Modal State
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeMessage, setComposeMessage] = useState('');
  const [composeDate, setComposeDate] = useState<string>(''); // Empty means Send Now
  const [selectedChannels, setSelectedChannels] = useState<ReminderChannel[]>(['EMAIL']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftType, setDraftType] = useState<'SINGLE' | 'BULK'>('SINGLE');

  // Edit Payment State
  const [editPaymentModal, setEditPaymentModal] = useState<{ isOpen: boolean, paymentId: string, currentAmount: number }>({ isOpen: false, paymentId: '', currentAmount: 0 });

  // Filtered Data helpers
  const getStudentDueAmount = (student: Student) => {
    const validClasses = schedule.filter(s => {
        // Logic Fix: Include class if student is enrolled OR if they actually attended/paid for it (even if dropped later)
        const isEnrolled = student.enrolledCategoryIds.includes(s.categoryId);
        const hasAttended = attendance.some(a => a.classId === s.id && a.studentId === student.id && a.present);
        const hasPaid = fees.some(f => f.classId === s.id && f.studentId === student.id);
        const isPastOrToday = new Date(s.date) <= new Date();

        // Only count if it's a past class AND (they are enrolled OR they have a history with this class)
        return isPastOrToday && (isEnrolled || hasAttended || hasPaid);
    });

    let totalDue = 0;
    let pendingCount = 0;

    validClasses.forEach(cls => {
        const payment = fees.find(f => f.classId === cls.id && f.studentId === student.id);
        if (!payment) {
            const cat = categories.find(c => c.id === cls.categoryId);
            if (cat) {
                totalDue += calculateClassFee(cls, cat);
                pendingCount++;
            }
        }
    });

    return { totalDue, pendingCount };
  };

  // --- Handlers ---

  const toggleSelection = (id: string) => {
      setSelectedStudentIds(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
  };

  const toggleSelectAll = () => {
      const studentsWithDues = students.filter(s => s.active && getStudentDueAmount(s).totalDue > 0);
      if (selectedStudentIds.length === studentsWithDues.length) {
          setSelectedStudentIds([]);
      } else {
          setSelectedStudentIds(studentsWithDues.map(s => s.id));
      }
  };

  const toggleChannel = (channel: ReminderChannel) => {
      setSelectedChannels(prev => {
          if (prev.includes(channel)) {
              // Prevent deselecting the last one
              if (prev.length === 1) return prev;
              return prev.filter(c => c !== channel);
          } else {
              return [...prev, channel];
          }
      });
  };

  const openReminderComposer = async (student?: Student) => {
      setComposerOpen(true);
      setComposeDate(''); // Default to now
      setSelectedChannels(['EMAIL']); // Reset to default
      
      if (student) {
          // Single Mode
          setDraftType('SINGLE');
          setSelectedStudentIds([student.id]);
          const { totalDue, pendingCount } = getStudentDueAmount(student);
          setIsGenerating(true);
          setComposeMessage('Generating personalized draft...');
          const draft = await generateFeeReminder(student.parentName, student.name, totalDue, pendingCount);
          setComposeMessage(draft);
          setIsGenerating(false);
      } else {
          // Bulk Mode
          setDraftType('BULK');
          if (selectedStudentIds.length === 0) return;
          setIsGenerating(true);
          setComposeMessage('Generating bulk draft...');
          const draft = await generateBulkFeeReminder(selectedStudentIds.length);
          setComposeMessage(draft);
          setIsGenerating(false);
      }
  };

  const handleSendOrSchedule = () => {
      const newReminder: Reminder = {
          id: `rem_${Date.now()}`,
          studentIds: selectedStudentIds,
          message: composeMessage,
          scheduledDate: composeDate || new Date().toISOString(),
          channels: selectedChannels,
          status: composeDate ? 'PENDING' : 'SENT',
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.email || 'System'
      };

      addReminder(newReminder);

      if (!composeDate) {
          // Simulate Sending "Now"
          if (selectedStudentIds.length === 1) {
              const student = students.find(s => s.id === selectedStudentIds[0]);
              if (student) {
                // Logic to simulate opening default apps
                if (selectedChannels.includes('EMAIL')) {
                    window.open(`mailto:${student.email}?subject=Fee Reminder - Kasthuri Natyalaya&body=${encodeURIComponent(composeMessage)}`);
                } 
                if (selectedChannels.includes('WHATSAPP')) {
                    window.open(`https://wa.me/${student.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(composeMessage)}`, '_blank');
                }
                if (selectedChannels.includes('SMS')) {
                    window.open(`sms:${student.phone.replace(/\s+/g, '')}?&body=${encodeURIComponent(composeMessage)}`);
                }
              }
          } else {
              alert(`Reminders successfully sent to ${selectedStudentIds.length} parents via [${selectedChannels.join(', ')}] (Simulated).`);
          }
      } else {
          alert("Reminder Scheduled Successfully.");
      }

      setComposerOpen(false);
      setSelectedStudentIds([]);
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayment(editPaymentModal.paymentId, editPaymentModal.currentAmount);
    setEditPaymentModal({ isOpen: false, paymentId: '', currentAmount: 0 });
  };

  const sortedSchedule = [...schedule].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render View for Students (Sibling Support)
  if (currentUser?.role === UserRole.STUDENT) {
    const myStudentIds = currentUser.studentIds || [];
    const myStudents = students.filter(s => myStudentIds.includes(s.id));

    if (myStudents.length === 0) return <div>Student profile not found</div>;

    // Calculate Total Due for ALL siblings
    let combinedDue = 0;
    const allMyClasses: { cls: ScheduledClass, student: Student }[] = [];

    myStudents.forEach(stu => {
        const { totalDue } = getStudentDueAmount(stu);
        combinedDue += totalDue;

        const stuClasses = sortedSchedule.filter(s => {
            const isEnrolled = stu.enrolledCategoryIds.includes(s.categoryId);
            const hasAttended = attendance.some(a => a.classId === s.id && a.studentId === stu.id && a.present);
            const hasPaid = fees.some(f => f.classId === s.id && f.studentId === stu.id);
            const isPastOrToday = new Date(s.date) <= new Date();
            return isPastOrToday && (isEnrolled || hasAttended || hasPaid);
        });
        
        stuClasses.forEach(c => allMyClasses.push({ cls: c, student: stu }));
    });
    
    // Sort all classes by date
    allMyClasses.sort((a,b) => new Date(b.cls.date).getTime() - new Date(a.cls.date).getTime());

    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-natyalaya-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-natyalaya-900">My Fees</h1>
                    <p className="text-gray-600">Overview of payments for {myStudents.map(s => s.name).join(' & ')}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Outstanding Amount</p>
                    <p className={`text-3xl font-bold ${combinedDue > 0 ? 'text-red-600' : 'text-green-600'}`}>£{combinedDue}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-natyalaya-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student & Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {allMyClasses.map(({cls, student}) => {
                             const cat = categories.find(c => c.id === cls.categoryId);
                             const calculatedFee = calculateClassFee(cls, cat);
                             const payment = fees.find(f => f.classId === cls.id && f.studentId === student.id);
                             
                             return (
                                 <tr key={`${cls.id}_${student.id}`} className="hover:bg-gray-50">
                                     <td className="px-6 py-4 text-sm text-gray-900">{cls.date}</td>
                                     <td className="px-6 py-4 text-sm text-gray-900">
                                         <div className="font-bold">{student.name}</div>
                                         <div className="text-gray-500 text-xs">{cat?.name || 'Unknown Class'}</div>
                                     </td>
                                     <td className="px-6 py-4 text-sm text-gray-900">£{payment ? payment.amount : calculatedFee}</td>
                                     <td className="px-6 py-4 text-right text-sm">
                                         {payment ? (
                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                 Paid
                                             </span>
                                         ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                 Pending
                                             </span>
                                         )}
                                     </td>
                                 </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  // Admin / Teacher View
  return (
    <div className="space-y-6 relative">
         <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 gap-4">
            <h1 className="text-3xl font-heading font-bold text-natyalaya-900">Fee Management</h1>
            <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <button onClick={() => setTab('OVERVIEW')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'OVERVIEW' ? 'bg-natyalaya-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>Overview</button>
                <button onClick={() => setTab('BY_CLASS')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'BY_CLASS' ? 'bg-natyalaya-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>By Class</button>
                <button onClick={() => setTab('BY_STUDENT')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'BY_STUDENT' ? 'bg-natyalaya-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>By Student</button>
                <button onClick={() => setTab('SCHEDULED_REMINDERS')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'SCHEDULED_REMINDERS' ? 'bg-natyalaya-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>History & Scheduled</button>
            </div>
        </div>

        {/* Overview Tab */}
        {tab === 'OVERVIEW' && (
            <div className="bg-white rounded shadow overflow-hidden relative">
                
                {/* Bulk Action Bar */}
                {selectedStudentIds.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-natyalaya-700 text-white p-2 flex justify-between items-center z-10 animate-fade-in">
                        <span className="text-sm font-bold px-4">{selectedStudentIds.length} students selected</span>
                        <div className="flex gap-2 pr-2">
                            <button 
                                onClick={() => setSelectedStudentIds([])}
                                className="px-3 py-1 text-xs bg-natyalaya-800 rounded hover:bg-natyalaya-900"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => openReminderComposer()}
                                className="px-3 py-1 text-xs bg-white text-natyalaya-800 font-bold rounded hover:bg-gray-100 flex items-center"
                            >
                                <Send className="w-3 h-3 mr-1" /> Compose Reminder
                            </button>
                        </div>
                    </div>
                )}

                <div className="px-6 py-4 border-b border-gray-200 bg-natyalaya-50 pt-12">
                    <h3 className="font-bold text-lg text-natyalaya-900">Student Payment Status</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    <button onClick={toggleSelectAll} className="text-gray-500 hover:text-natyalaya-700">
                                        {students.filter(s => s.active && getStudentDueAmount(s).totalDue > 0).length > 0 && 
                                         selectedStudentIds.length === students.filter(s => s.active && getStudentDueAmount(s).totalDue > 0).length ? 
                                         <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pending Classes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Due</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.filter(s => s.active).map(student => {
                                const { totalDue, pendingCount } = getStudentDueAmount(student);
                                if (totalDue === 0 && pendingCount === 0) return null; 
                                
                                const isSelected = selectedStudentIds.includes(student.id);

                                return (
                                    <tr key={student.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-orange-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelection(student.id)} className="text-gray-400 hover:text-natyalaya-700">
                                                {isSelected ? <CheckSquare className="w-5 h-5 text-natyalaya-600"/> : <Square className="w-5 h-5"/>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{student.parentName}</td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900">{pendingCount}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-red-600">£{totalDue}</td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <button 
                                                onClick={() => openReminderComposer(student)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-natyalaya-600 hover:bg-natyalaya-700 focus:outline-none"
                                            >
                                                <Send className="w-3 h-3 mr-1" /> Remind
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Scheduled Reminders Tab */}
        {tab === 'SCHEDULED_REMINDERS' && (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold text-natyalaya-900">Scheduled & Past Reminders</h3>
                {reminders.length === 0 ? (
                    <p className="text-gray-500 italic">No reminders found.</p>
                ) : (
                    <div className="grid gap-4">
                        {reminders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(reminder => (
                            <div key={reminder.id} className="bg-white p-5 rounded shadow border-l-4 border-natyalaya-500 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${reminder.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {reminder.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Scheduled for: {new Date(reminder.scheduledDate).toLocaleDateString()} {new Date(reminder.scheduledDate).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{reminder.message}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-3">
                                        <span>Recipients: {reminder.studentIds.length} students</span>
                                        <span>•</span>
                                        <span>Created by {reminder.createdBy}</span>
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {reminder.channels?.includes('EMAIL') && <span title="Email" className="p-1 bg-blue-50 rounded text-blue-600"><Mail className="w-3 h-3" /></span>}
                                        {reminder.channels?.includes('SMS') && <span title="SMS" className="p-1 bg-green-50 rounded text-green-600"><MessageSquare className="w-3 h-3" /></span>}
                                        {reminder.channels?.includes('WHATSAPP') && <span title="WhatsApp" className="p-1 bg-green-100 rounded text-green-700"><MessageCircle className="w-3 h-3" /></span>}
                                    </div>
                                </div>
                                <button onClick={() => deleteReminder(reminder.id)} className="text-gray-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* By Class and By Student tabs logic remains similar but we are focusing on the requested features above */}
        {tab === 'BY_CLASS' && (
            <div className="space-y-6 animate-fade-in">
                 <div className="bg-white p-4 rounded shadow-sm">
                    <label className="block text-sm font-medium mb-2">Select Class to Manage Fees:</label>
                    <select 
                        className="w-full p-2 border rounded focus:ring-natyalaya-500 focus:border-natyalaya-500"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">-- Select a class --</option>
                        {sortedSchedule.map(cls => {
                            const cat = categories.find(c => c.id === cls.categoryId);
                            return <option key={cls.id} value={cls.id}>{cls.date} @ {cls.startTime} - {cat?.name || 'Unknown Class'}</option>
                        })}
                    </select>
                 </div>

                 {selectedClassId && (
                     <div className="bg-white rounded shadow overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-200 bg-natyalaya-50 flex justify-between">
                             <h3 className="font-bold text-lg text-natyalaya-900">Class Payment Register</h3>
                             {(() => {
                                 const cls = schedule.find(c => c.id === selectedClassId);
                                 const cat = categories.find(c => c.id === cls?.categoryId);
                                 return <span className="text-natyalaya-700 font-bold">Fee: £{cls && cat ? calculateClassFee(cls, cat) : 0}</span>
                             })()}
                         </div>
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-200 bg-white">
                                 {students
                                    .filter(s => {
                                        const cls = schedule.find(c => c.id === selectedClassId);
                                        // Include if enrolled OR if they have attendance/payment history for this specific class
                                        const isEnrolled = s.active && s.enrolledCategoryIds.includes(cls?.categoryId || '');
                                        const hasAttendance = attendance.some(a => a.classId === selectedClassId && a.studentId === s.id);
                                        const hasPayment = fees.some(f => f.classId === selectedClassId && f.studentId === s.id);
                                        return isEnrolled || hasAttendance || hasPayment;
                                    })
                                    .map(student => {
                                        const cls = schedule.find(c => c.id === selectedClassId);
                                        const cat = categories.find(c => c.id === cls?.categoryId);
                                        const standardFee = cls && cat ? calculateClassFee(cls, cat) : 0;
                                        
                                        const payment = fees.find(f => f.classId === selectedClassId && f.studentId === student.id);
                                        const attendanceRecord = attendance.find(a => a.classId === selectedClassId && a.studentId === student.id);
                                        const isPresent = attendanceRecord?.present;

                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {isPresent === true && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Present</span>}
                                                    {isPresent === false && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Absent</span>}
                                                    {isPresent === undefined && <span className="text-xs text-gray-400">Marking Pending</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                     {payment ? (
                                                         <span className="flex items-center justify-center text-green-600 font-bold text-sm">
                                                            <CheckCircle className="w-4 h-4 mr-1"/> Paid (£{payment.amount})
                                                         </span>
                                                     ) : (
                                                         <span className="flex items-center justify-center text-red-500 font-medium text-sm"><AlertCircle className="w-4 h-4 mr-1"/> Unpaid</span>
                                                     )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {payment ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => setEditPaymentModal({ isOpen: true, paymentId: payment.id, currentAmount: payment.amount })}
                                                                title="Edit Amount"
                                                                className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => togglePayment(selectedClassId, student.id, standardFee)}
                                                                title="Delete / Mark Unpaid"
                                                                className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => togglePayment(selectedClassId, student.id, standardFee)}
                                                            className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                 }
                             </tbody>
                         </table>
                     </div>
                 )}
            </div>
        )}

        {tab === 'BY_STUDENT' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded shadow-sm">
                    <label className="block text-sm font-medium mb-2">Select Student:</label>
                    <select 
                        className="w-full p-2 border rounded focus:ring-natyalaya-500 focus:border-natyalaya-500"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        <option value="">-- Select a student --</option>
                        {students.filter(s => s.active).map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.parentName})</option>
                        ))}
                    </select>
                </div>

                {selectedStudentId && (
                    <div className="space-y-6">
                        {(() => {
                            const student = students.find(s => s.id === selectedStudentId);
                            if (!student) return null;
                            const { totalDue } = getStudentDueAmount(student);
                            
                            const studentClasses = sortedSchedule.filter(s => {
                                const isEnrolled = student.enrolledCategoryIds.includes(s.categoryId);
                                const hasAttended = attendance.some(a => a.classId === s.id && a.studentId === student.id && a.present);
                                const hasPayment = fees.some(f => f.classId === s.id && f.studentId === student.id);
                                return (isEnrolled || hasAttended || hasPayment) && new Date(s.date) <= new Date();
                            });

                            return (
                                <>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded shadow border-l-4 border-natyalaya-600">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Classes</p>
                                            <p className="text-2xl font-bold">{studentClasses.length}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Paid</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                £{studentClasses.reduce((acc, cls) => {
                                                    const payment = fees.find(f => f.classId === cls.id && f.studentId === student.id);
                                                    if (payment) {
                                                        return acc + payment.amount;
                                                    }
                                                    return acc;
                                                }, 0)}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Outstanding Due</p>
                                            <p className="text-2xl font-bold text-red-600">£{totalDue}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded shadow overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-natyalaya-50">
                                            <h3 className="font-bold text-lg text-natyalaya-900">Detailed Payment History</h3>
                                        </div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Category</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fee</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {studentClasses.length === 0 ? (
                                                    <tr><td colSpan={5} className="text-center p-4 text-gray-500">No class history found.</td></tr>
                                                ) : (
                                                    studentClasses.map(cls => {
                                                        const cat = categories.find(c => c.id === cls.categoryId);
                                                        const standardFee = calculateClassFee(cls, cat);
                                                        const payment = fees.find(f => f.classId === cls.id && f.studentId === student.id);

                                                        return (
                                                            <tr key={cls.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 text-sm text-gray-900">{cls.date}</td>
                                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat?.name || 'Unknown'}</td>
                                                                <td className="px-6 py-4 text-sm text-center text-gray-600">£{payment ? payment.amount : standardFee}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    {payment ? (
                                                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                             Paid
                                                                         </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                             Unpaid
                                                                         </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {payment ? (
                                                                         <div className="flex justify-end gap-2">
                                                                            <button 
                                                                                onClick={() => setEditPaymentModal({ isOpen: true, paymentId: payment.id, currentAmount: payment.amount })}
                                                                                title="Edit Amount"
                                                                                className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => togglePayment(cls.id, student.id, standardFee)}
                                                                                title="Delete / Mark Unpaid"
                                                                                className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => togglePayment(cls.id, student.id, standardFee)}
                                                                            className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-natyalaya-600 text-white hover:bg-natyalaya-700 transition-colors"
                                                                        >
                                                                            Mark Paid
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
        )}

        {/* Compose Reminder Modal */}
        {composerOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-xl w-full shadow-xl m-4 border-t-4 border-natyalaya-700">
                    <h3 className="text-lg font-bold mb-4 text-natyalaya-900 flex items-center">
                        <Send className="w-5 h-5 mr-2"/> 
                        {draftType === 'BULK' ? `Bulk Reminder (${selectedStudentIds.length} recipients)` : 'Send Reminder'}
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Channel Selector */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Channels</label>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => toggleChannel('EMAIL')}
                                    className={`flex items-center px-3 py-2 rounded border text-sm ${selectedChannels.includes('EMAIL') ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                >
                                    <Mail className={`w-4 h-4 mr-2 ${selectedChannels.includes('EMAIL') ? 'text-blue-600' : 'text-gray-400'}`} /> Email
                                </button>
                                <button 
                                    onClick={() => toggleChannel('SMS')}
                                    className={`flex items-center px-3 py-2 rounded border text-sm ${selectedChannels.includes('SMS') ? 'bg-green-50 border-green-300 text-green-800 font-bold shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                >
                                    <MessageSquare className={`w-4 h-4 mr-2 ${selectedChannels.includes('SMS') ? 'text-green-600' : 'text-gray-400'}`} /> SMS
                                </button>
                                <button 
                                    onClick={() => toggleChannel('WHATSAPP')}
                                    className={`flex items-center px-3 py-2 rounded border text-sm ${selectedChannels.includes('WHATSAPP') ? 'bg-green-100 border-green-300 text-green-900 font-bold shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                >
                                    <MessageCircle className={`w-4 h-4 mr-2 ${selectedChannels.includes('WHATSAPP') ? 'text-green-700' : 'text-gray-400'}`} /> WhatsApp
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                            {isGenerating ? (
                                <div className="h-40 bg-gray-50 border rounded flex items-center justify-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2"/> Generating draft...
                                </div>
                            ) : (
                                <textarea 
                                    className="w-full p-3 border rounded focus:ring-natyalaya-500 focus:border-natyalaya-500 h-40 text-sm"
                                    value={composeMessage}
                                    onChange={(e) => setComposeMessage(e.target.value)}
                                    placeholder="Enter your reminder message here..."
                                />
                            )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded border flex justify-between items-center">
                             <div className="flex items-center">
                                 <CalendarClock className="w-4 h-4 mr-2 text-natyalaya-600"/>
                                 <span className="text-sm font-bold text-gray-700">Schedule Sending:</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="datetime-local" 
                                    className="p-1 border rounded text-sm"
                                    value={composeDate}
                                    onChange={(e) => setComposeDate(e.target.value)}
                                />
                                <span className="text-xs text-gray-500 italic">{!composeDate ? '(Leave empty to send now)' : ''}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                         <button 
                            onClick={() => setComposerOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                         >
                             Cancel
                         </button>
                         <button 
                             onClick={handleSendOrSchedule}
                             disabled={isGenerating || !composeMessage.trim()}
                             className="px-6 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800 flex items-center font-bold disabled:opacity-50"
                         >
                             {composeDate ? (
                                 <><Clock className="w-4 h-4 mr-2" /> Schedule Reminder</>
                             ) : (
                                 <><Send className="w-4 h-4 mr-2" /> Send Now</>
                             )}
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Payment Modal */}
        {editPaymentModal.isOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl m-4 border-t-4 border-gold-500">
                    <h3 className="text-lg font-bold mb-4 text-natyalaya-900">Edit Payment Amount</h3>
                    <form onSubmit={handleUpdatePayment}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Amount (£)</label>
                            <input 
                                type="number" 
                                required
                                step="0.01"
                                className="w-full p-2 border rounded focus:ring-natyalaya-500 focus:border-natyalaya-500" 
                                value={editPaymentModal.currentAmount}
                                onChange={(e) => setEditPaymentModal({ ...editPaymentModal, currentAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                type="button"
                                onClick={() => setEditPaymentModal({ isOpen: false, paymentId: '', currentAmount: 0 })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
