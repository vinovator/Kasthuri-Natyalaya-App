
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole, Student, ProgressReport } from '../types';
import { Award, TrendingUp, Star, Plus, Save } from 'lucide-react';

export const Progress: React.FC = () => {
  const { students, progressReports, addProgressReport, currentUser } = useData();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [form, setForm] = useState<Partial<ProgressReport>>({
      term: '',
      skills: { talam: 5, bhavam: 5, angashudhi: 5, memory: 5 },
      comments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedStudentId) return;

      addProgressReport({
          id: `prog_${Date.now()}`,
          studentId: selectedStudentId,
          date: new Date().toISOString(),
          assessedBy: currentUser?.name || 'Teacher',
          ...form as any
      });
      
      setShowForm(false);
      setForm({ term: '', skills: { talam: 5, bhavam: 5, angashudhi: 5, memory: 5 }, comments: '' });
  };

  // Student View (Supports Siblings)
  if (currentUser?.role === UserRole.STUDENT) {
      const myStudentIds = currentUser.studentIds || [];
      const myReports = progressReports.filter(r => myStudentIds.includes(r.studentId));

      return (
          <div className="space-y-6">
              <h1 className="text-3xl font-heading font-bold text-natyalaya-900">My Progress</h1>
              {myReports.length === 0 ? (
                  <div className="bg-white p-8 rounded text-center text-gray-500 border border-natyalaya-200">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No progress reports available yet.</p>
                  </div>
              ) : (
                  <div className="grid gap-6">
                      {myReports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(report => {
                           const student = students.find(s => s.id === report.studentId);
                           return <ReportCard key={report.id} report={report} studentName={student?.name} />;
                      })}
                  </div>
              )}
          </div>
      )
  }

  // Teacher/Admin View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-heading font-bold text-natyalaya-900">Student Grading & Progress</h1>
        <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-natyalaya-700 text-white px-4 py-2 rounded flex items-center hover:bg-natyalaya-800"
        >
            <Plus className="w-4 h-4 mr-2" /> New Assessment
        </button>
      </div>

      {showForm && (
          <div className="bg-white p-6 rounded shadow-lg border-t-4 border-gold-500 animate-fade-in">
              <h3 className="font-bold text-lg mb-4">Create Progress Report</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">Select Student</label>
                      <select 
                        required 
                        className="w-full p-2 border rounded" 
                        value={selectedStudentId} 
                        onChange={e => setSelectedStudentId(e.target.value)}
                      >
                          <option value="">-- Select Student --</option>
                          {students.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Term / Item Name</label>
                      <input 
                        required 
                        placeholder="e.g. Term 1 2024 or Alarippu Assessment" 
                        className="w-full p-2 border rounded"
                        value={form.term}
                        onChange={e => setForm({...form, term: e.target.value})}
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-natyalaya-50 p-4 rounded">
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Talam (Rhythm)</label>
                          <input type="number" min="1" max="10" className="w-full p-2 border rounded" value={form.skills?.talam} onChange={e => setForm({...form, skills: {...form.skills!, talam: Number(e.target.value)}})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Bhavam (Expr.)</label>
                          <input type="number" min="1" max="10" className="w-full p-2 border rounded" value={form.skills?.bhavam} onChange={e => setForm({...form, skills: {...form.skills!, bhavam: Number(e.target.value)}})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Angashudhi (Form)</label>
                          <input type="number" min="1" max="10" className="w-full p-2 border rounded" value={form.skills?.angashudhi} onChange={e => setForm({...form, skills: {...form.skills!, angashudhi: Number(e.target.value)}})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Memory</label>
                          <input type="number" min="1" max="10" className="w-full p-2 border rounded" value={form.skills?.memory} onChange={e => setForm({...form, skills: {...form.skills!, memory: Number(e.target.value)}})} />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium mb-1">Teacher's Comments</label>
                      <textarea 
                        className="w-full p-2 border rounded" 
                        rows={3} 
                        value={form.comments}
                        onChange={e => setForm({...form, comments: e.target.value})}
                      />
                  </div>

                  <div className="flex justify-end">
                      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center">
                          <Save className="w-4 h-4 mr-2" /> Save Report
                      </button>
                  </div>
              </form>
          </div>
      )}

      <div className="space-y-4">
          {progressReports.length === 0 ? (
              <p className="text-gray-500">No progress reports generated yet.</p>
          ) : (
              progressReports.map(report => {
                  const student = students.find(s => s.id === report.studentId);
                  if (!student) return null;
                  return <ReportCard key={report.id} report={report} studentName={student.name} />;
              })
          )}
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ report: ProgressReport, studentName?: string }> = ({ report, studentName }) => {
    const average = Math.round(((report.skills.talam + report.skills.bhavam + report.skills.angashudhi + report.skills.memory) / 4) * 10) / 10;
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gold-500 to-natyalaya-600"></div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    {studentName && <h3 className="font-bold text-lg text-natyalaya-900">{studentName}</h3>}
                    <h4 className="font-medium text-gray-700">{report.term}</h4>
                    <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()} • Assessed by {report.assessedBy}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-heading font-bold text-natyalaya-800">{average}<span className="text-sm text-gray-400">/10</span></div>
                    <div className="text-xs font-bold text-gold-600 uppercase tracking-wide">Overall Score</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <SkillBar label="Talam (Rhythm)" score={report.skills.talam} />
                <SkillBar label="Bhavam (Expr.)" score={report.skills.bhavam} />
                <SkillBar label="Angashudhi" score={report.skills.angashudhi} />
                <SkillBar label="Memory" score={report.skills.memory} />
            </div>

            <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 italic border-l-4 border-gray-300">
                "{report.comments}"
            </div>
        </div>
    );
};

const SkillBar: React.FC<{ label: string, score: number }> = ({ label, score }) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-gray-600">{label}</span>
            <span className="font-bold text-natyalaya-700">{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
                className="bg-natyalaya-600 h-2 rounded-full" 
                style={{ width: `${(score / 10) * 100}%` }}
            ></div>
        </div>
    </div>
);
