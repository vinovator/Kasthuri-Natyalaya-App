
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Student, UserRole } from '../types';
import { Plus, Search, Download, User as UserIcon, Edit2, KeyRound, Archive, RefreshCcw, Trash2, AlertTriangle } from 'lucide-react';

export const Students: React.FC = () => {
  const { students, categories, addStudent, updateStudent, deleteItem, currentUser, resetPassword, schedule } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewStatus, setViewStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Role Checks
  const isSuperUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HEAD_TEACHER;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', parentName: '', email: '', phone: '', address: '', dob: '', enrolledCategoryIds: [], notes: ''
  });

  const resetForm = () => {
    setFormData({ name: '', parentName: '', email: '', phone: '', address: '', dob: '', enrolledCategoryIds: [], notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        const student = students.find(s => s.id === editingId);
        if(student) {
            updateStudent({ ...student, ...formData } as Student);
        }
    } else {
        const newStudent: Student = {
            id: `stu_${Date.now()}`,
            active: true,
            joinedDate: new Date().toISOString().split('T')[0],
            ...formData as any
        };
        addStudent(newStudent);
    }
    resetForm();
  };

  const startEdit = (student: Student) => {
      setEditingId(student.id);
      setFormData(student);
      setShowForm(true);
  }

  const handlePasswordReset = (student: Student) => {
      const newPass = prompt(`Enter new password for ${student.name} (Leave empty for default 'password123'):`);
      if (newPass !== null) {
          resetPassword(student.email, newPass || undefined);
          alert(`Password updated for ${student.email}.`);
      }
  }

  const toggleStudentStatus = (student: Student) => {
      const action = student.active ? 'archive' : 'activate';
      if (window.confirm(`Are you sure you want to ${action} ${student.name}?`)) {
          updateStudent({ ...student, active: !student.active });
      }
  };

  const handlePermanentDelete = (student: Student) => {
      deleteItem('students', student.id);
  };

  const handleCategoryToggle = (catId: string) => {
    const current = formData.enrolledCategoryIds || [];
    if (current.includes(catId)) {
      setFormData({ ...formData, enrolledCategoryIds: current.filter(id => id !== catId) });
    } else {
      setFormData({ ...formData, enrolledCategoryIds: [...current, catId] });
    }
  };

  // Filter logic based on Role
  let visibleStudents = students;

  if (isTeacher) {
      // 1. Find classes taught by this teacher
      const myClasses = schedule.filter(s => s.teacherName === currentUser?.name);
      // 2. Get unique category IDs from those classes
      const taughtCategoryIds = Array.from(new Set(myClasses.map(s => s.categoryId)));
      // 3. Filter students who are enrolled in ANY of these categories
      visibleStudents = students.filter(s => s.enrolledCategoryIds.some(id => taughtCategoryIds.includes(id)));
  }

  const filteredStudents = visibleStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = viewStatus === 'ACTIVE' ? s.active : !s.active;
      return matchesSearch && matchesStatus;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleExportCSV = () => {
      const headers = ['Name', 'Parent Name', 'Email', 'Phone', 'DOB', 'Status', 'Enrolled Classes', 'Notes'];
      
      const rows = filteredStudents.map(s => [
          s.name,
          s.parentName,
          s.email,
          s.phone,
          s.dob,
          s.active ? 'Active' : 'Archived',
          s.enrolledCategoryIds.map(id => categories.find(c => c.id === id)?.name || id).join('; '),
          s.notes
      ]);

      const csvContent = [
          headers.join(','),
          ...rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (currentUser?.role === UserRole.STUDENT) {
    const myStudentIds = currentUser.studentIds || [];
    const myProfiles = students.filter(s => myStudentIds.includes(s.id));

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl font-heading font-bold text-natyalaya-900">Student Profiles</h2>
        {myProfiles.length === 0 ? (
             <p className="text-gray-500 italic">No profiles found associated with this login.</p>
        ) : (
             <div className="grid gap-6">
                 {myProfiles.map(profile => (
                     <div key={profile.id} className="bg-white p-6 rounded-lg shadow border border-natyalaya-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-natyalaya-600"></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-natyalaya-900">{profile.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${profile.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {profile.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><label className="text-xs text-gray-500 uppercase font-bold">DOB</label><p className="font-medium">{profile.dob}</p></div>
                            <div><label className="text-xs text-gray-500 uppercase font-bold">Joined</label><p className="font-medium">{profile.joinedDate}</p></div>
                            <div><label className="text-xs text-gray-500 uppercase font-bold">Email</label><p className="font-medium">{profile.email}</p></div>
                            <div><label className="text-xs text-gray-500 uppercase font-bold">Phone</label><p className="font-medium">{profile.phone}</p></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500 uppercase font-bold">Enrolled Classes</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile.enrolledCategoryIds.map(cid => {
                                        const cat = categories.find(c => c.id === cid);
                                        return cat ? <span key={cid} className="bg-natyalaya-100 text-natyalaya-800 px-2 py-1 rounded text-xs font-medium">{cat.name}</span> : null;
                                    })}
                                </div>
                            </div>
                        </div>
                     </div>
                 ))}
             </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-heading font-bold text-natyalaya-900">
            {isTeacher ? 'My Students' : 'Student Management'}
        </h1>
        <div className="flex gap-2">
             <button 
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm"
            >
                <Download className="w-4 h-4 mr-2" /> Export Excel (CSV)
            </button>
            {/* Only Super Users can add students */}
            {isSuperUser && (
                <button 
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="flex items-center px-4 py-2 bg-natyalaya-700 text-white rounded-md hover:bg-natyalaya-800 shadow-sm font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel Intake' : 'New Student'}
                </button>
            )}
        </div>
      </div>

      {showForm && isSuperUser && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-natyalaya-500 animate-fade-in">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Student' : 'New Student Intake Form'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required placeholder="Full Name" className="p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="Parent/Guardian Name" className="p-2 border rounded" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
            <input required type="email" placeholder="Email" className="p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required placeholder="Phone" className="p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input required type="date" placeholder="DOB" className="p-2 border rounded" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            <input placeholder="Address" className="p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Enroll in Categories:</label>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm border ${formData.enrolledCategoryIds?.includes(cat.id) ? 'bg-natyalaya-600 text-white border-natyalaya-600' : 'bg-white text-gray-600 border-gray-300'}`}
                  >
                    {cat.name} (£{cat.feePerHour}/hr)
                  </button>
                ))}
              </div>
            </div>

             <textarea placeholder="Notes / Medical Info" className="md:col-span-2 p-2 border rounded" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

            <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800 font-bold">Save Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex space-x-2">
                <button 
                    onClick={() => setViewStatus('ACTIVE')} 
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${viewStatus === 'ACTIVE' ? 'bg-white text-natyalaya-900 shadow border-t-4 border-t-natyalaya-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    Active Students
                </button>
                <button 
                    onClick={() => setViewStatus('ARCHIVED')} 
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${viewStatus === 'ARCHIVED' ? 'bg-white text-natyalaya-900 shadow border-t-4 border-t-gray-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    Archived
                </button>
            </div>
            
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-natyalaya-500 focus:border-natyalaya-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="bg-white shadow rounded-b-lg rounded-tr-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-natyalaya-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                No {viewStatus.toLowerCase()} students found matching your search.
                            </td>
                        </tr>
                    ) : (
                        filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${student.active ? 'bg-natyalaya-100 text-natyalaya-700' : 'bg-gray-100 text-gray-400'}`}>
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className="ml-4">
                                            <div className={`text-sm font-medium ${student.active ? 'text-gray-900' : 'text-gray-500'}`}>{student.name}</div>
                                            <div className="text-xs text-gray-500">Parent: {student.parentName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{student.email}</div>
                                    <div className="text-xs text-gray-500">{student.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {student.enrolledCategoryIds.map(id => {
                                            const c = categories.find(cat => cat.id === id);
                                            return c ? <span key={id} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.active ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>{c.name}</span> : null;
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {student.active ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isSuperUser && (
                                        <button onClick={() => handlePasswordReset(student)} title="Reset/Set Password" className="text-gray-500 hover:text-natyalaya-700 mr-3">
                                            <KeyRound className="w-4 h-4"/>
                                        </button>
                                    )}
                                    
                                    <button onClick={() => startEdit(student)} title="Edit Profile" className="text-natyalaya-600 hover:text-natyalaya-900 mr-3">
                                        <Edit2 className="w-4 h-4"/>
                                    </button>
                                    
                                    {isSuperUser && (
                                        student.active ? (
                                            <button 
                                                onClick={() => toggleStudentStatus(student)} 
                                                title="Archive Student (Soft Delete)" 
                                                className="text-orange-500 hover:text-orange-700"
                                            >
                                                <Archive className="w-4 h-4"/>
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => toggleStudentStatus(student)} 
                                                    title="Restore Student" 
                                                    className="text-green-600 hover:text-green-800 mr-3"
                                                >
                                                    <RefreshCcw className="w-4 h-4"/>
                                                </button>
                                                <button 
                                                    onClick={() => handlePermanentDelete(student)} 
                                                    title="Permanently Delete (Destructive)" 
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};
