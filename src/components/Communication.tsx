
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Announcement, Event, UserRole, ReminderChannel } from '../types';
import { Sparkles, Calendar, Send, MapPin, Loader2, Edit2, Trash2, X, Mail, MessageSquare, MessageCircle } from 'lucide-react';
import { generateAnnouncement, generateEventDescription } from '../services/geminiService';

export const Communication: React.FC = () => {
  const { announcements, events, addAnnouncement, updateAnnouncement, deleteItem, addEvent, categories, currentUser, students } = useData();
  const [tab, setTab] = useState<'ANNOUNCEMENTS' | 'EVENTS'>('ANNOUNCEMENTS');

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);

  // Announcement Form
  const [annForm, setAnnForm] = useState({ title: '', topic: '', details: '', targetAudience: 'ALL', content: '' });
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<ReminderChannel[]>(['EMAIL']);
  
  // Event Form
  const [evtForm, setEvtForm] = useState<Partial<Event>>({ title: '', date: '', location: 'School Main Hall', description: '', isPublic: true, targetAudience: 'ALL' });
  const [selectedEventChannels, setSelectedEventChannels] = useState<ReminderChannel[]>(['EMAIL']);

  const handleAiGenerate = async () => {
      if (!annForm.topic) return;
      setIsGenerating(true);
      const generated = await generateAnnouncement(annForm.topic, annForm.targetAudience, annForm.details);
      setAnnForm(prev => ({ ...prev, content: generated }));
      setIsGenerating(false);
  };

  const handleEventAiGenerate = async () => {
      if (!evtForm.title || !evtForm.date) return;
      setIsGenerating(true);
      const generated = await generateEventDescription(evtForm.title, evtForm.date);
      setEvtForm(prev => ({ ...prev, description: generated }));
      setIsGenerating(false);
  }

  // Helper to calculate recipients
  const getRecipientCount = (audience: string) => {
      if (audience === 'ALL') return students.filter(s => s.active).length;
      // Check if it's a category ID
      const cat = categories.find(c => c.id === audience);
      if (cat) return students.filter(s => s.active && s.enrolledCategoryIds.includes(cat.id)).length;
      return 0;
  };

  const toggleChannel = (channel: ReminderChannel, type: 'ANN' | 'EVT') => {
      if (type === 'ANN') {
        setSelectedChannels(prev => {
            if (prev.includes(channel)) {
                if (prev.length === 1) return prev;
                return prev.filter(c => c !== channel);
            } else {
                return [...prev, channel];
            }
        });
      } else {
        setSelectedEventChannels(prev => {
            if (prev.includes(channel)) {
                if (prev.length === 1) return prev;
                return prev.filter(c => c !== channel);
            } else {
                return [...prev, channel];
            }
        });
      }
  };

  const submitAnnouncement = (e: React.FormEvent) => {
      e.preventDefault();
      
      const recipients = getRecipientCount(annForm.targetAudience);

      if (editingAnnId) {
        // Update Existing
        const existing = announcements.find(a => a.id === editingAnnId);
        if (existing) {
            updateAnnouncement({
                ...existing,
                title: annForm.title,
                content: annForm.content,
                targetAudience: annForm.targetAudience,
                sentVia: selectedChannels
            });
        }
        alert(`Announcement Updated and re-published to ${recipients} recipients via [${selectedChannels.join(', ')}].`);
      } else {
        // Create New
        addAnnouncement({
            id: `ann_${Date.now()}`,
            date: new Date().toISOString(),
            author: currentUser?.name || 'Admin',
            title: annForm.title,
            content: annForm.content,
            targetAudience: annForm.targetAudience,
            sentVia: selectedChannels
        });
        alert(`Announcement Published to ${recipients} recipients via [${selectedChannels.join(', ')}].`);
      }
      resetAnnForm();
  };

  const resetAnnForm = () => {
    setAnnForm({ title: '', topic: '', details: '', targetAudience: 'ALL', content: '' });
    setEditingAnnId(null);
    setSelectedChannels(['EMAIL']);
  };

  const handleEditAnnouncement = (ann: Announcement) => {
      setAnnForm({
          title: ann.title,
          content: ann.content,
          targetAudience: ann.targetAudience,
          topic: '', 
          details: ''
      });
      setEditingAnnId(ann.id);
      if (ann.sentVia) setSelectedChannels(ann.sentVia);
  };

  const handleDeleteAnnouncement = (id: string) => {
      if (window.confirm('Are you sure you want to delete this announcement?')) {
          deleteItem('announcements', id);
          if (editingAnnId === id) resetAnnForm();
      }
  };

  const submitEvent = (e: React.FormEvent) => {
      e.preventDefault();
      const recipients = getRecipientCount(evtForm.targetAudience || 'ALL');
      
      addEvent({
          id: `evt_${Date.now()}`,
          ...evtForm as Event,
          sentVia: selectedEventChannels
      });

      alert(`Event Created and Notification sent to ${recipients} recipients via [${selectedEventChannels.join(', ')}].`);

      setEvtForm({ title: '', date: '', location: 'School Main Hall', description: '', isPublic: true, targetAudience: 'ALL' });
      setSelectedEventChannels(['EMAIL']);
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (currentUser?.role === UserRole.STUDENT) {
      // Student Read-Only View - Filter by enrolled categories
      const myStudentIds = currentUser.studentIds || [];
      const myStudents = students.filter(s => myStudentIds.includes(s.id));
      const allEnrolledCategories = myStudents.flatMap(s => s.enrolledCategoryIds);

      const relevantAnnouncements = sortedAnnouncements.filter(ann => {
          if (ann.targetAudience === 'ALL') return true;
          return allEnrolledCategories.includes(ann.targetAudience);
      });

      return (
          <div className="space-y-8">
               <section>
                   <h2 className="text-2xl font-heading font-bold mb-4 text-natyalaya-900">Announcements</h2>
                   {relevantAnnouncements.length === 0 ? (
                       <p className="text-gray-500 italic">No announcements for your classes.</p>
                   ) : (
                        <div className="grid gap-4">
                            {relevantAnnouncements.map(ann => (
                                <div key={ann.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-natyalaya-500">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-bold text-lg">{ann.title}</h3>
                                        <span className="text-xs text-gray-500">{new Date(ann.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                                </div>
                            ))}
                        </div>
                   )}
               </section>
               <section>
                   <h2 className="text-2xl font-heading font-bold mb-4 text-natyalaya-900">Upcoming Events</h2>
                   <div className="grid md:grid-cols-2 gap-4">
                        {sortedEvents.filter(e => new Date(e.date) >= new Date()).map(evt => (
                            <div key={evt.id} className="bg-white p-5 rounded-lg shadow border border-gray-200">
                                <div className="bg-natyalaya-900 text-white text-xs font-bold uppercase tracking-wide px-2 py-1 rounded w-fit mb-2">
                                    {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                                <h3 className="font-bold text-xl mb-2">{evt.title}</h3>
                                <p className="text-sm text-gray-500 mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {evt.location}</p>
                                <p className="text-gray-700 text-sm">{evt.description}</p>
                            </div>
                        ))}
                   </div>
               </section>
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-3xl font-heading font-bold text-natyalaya-900">Communications</h1>
            <div className="flex space-x-2">
                <button onClick={() => setTab('ANNOUNCEMENTS')} className={`px-3 py-1 rounded ${tab === 'ANNOUNCEMENTS' ? 'bg-natyalaya-100 text-natyalaya-800' : 'text-gray-500'}`}>Announcements</button>
                <button onClick={() => setTab('EVENTS')} className={`px-3 py-1 rounded ${tab === 'EVENTS' ? 'bg-natyalaya-100 text-natyalaya-800' : 'text-gray-500'}`}>Events</button>
            </div>
        </div>

        {tab === 'ANNOUNCEMENTS' && (
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow h-fit border-t-4 border-natyalaya-600">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            {editingAnnId ? <Edit2 className="w-4 h-4 text-natyalaya-600"/> : <Sparkles className="w-4 h-4 text-purple-600"/>} 
                            {editingAnnId ? 'Edit Announcement' : 'New Announcement'}
                        </h3>
                        {editingAnnId && (
                            <button onClick={resetAnnForm} className="text-xs flex items-center text-gray-500 hover:text-gray-700">
                                <X className="w-3 h-3 mr-1"/> Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={submitAnnouncement} className="space-y-3">
                        <input required placeholder="Title" className="w-full p-2 border rounded" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Target Audience</label>
                            <select className="w-full p-2 border rounded text-sm" value={annForm.targetAudience} onChange={e => setAnnForm({...annForm, targetAudience: e.target.value})}>
                                <option value="ALL">All Students & Parents</option>
                                {categories.map(c => <option key={c.id} value={c.id}>Students in {c.name}</option>)}
                            </select>
                            <p className="text-xs text-right text-gray-400 mt-1">
                                Will notify approx. {getRecipientCount(annForm.targetAudience)} recipients
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Publish Via</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => toggleChannel('EMAIL', 'ANN')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedChannels.includes('EMAIL') ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <Mail className="w-3 h-3 mr-1" /> Email
                                </button>
                                <button type="button" onClick={() => toggleChannel('SMS', 'ANN')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedChannels.includes('SMS') ? 'bg-green-50 border-green-300 text-green-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <MessageSquare className="w-3 h-3 mr-1" /> SMS
                                </button>
                                <button type="button" onClick={() => toggleChannel('WHATSAPP', 'ANN')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedChannels.includes('WHATSAPP') ? 'bg-green-100 border-green-300 text-green-900 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                            <p className="text-xs text-purple-800 font-bold mb-2 uppercase">AI Draft Generator</p>
                            <input placeholder="Topic (e.g. Navaratri Performance)" className="w-full p-2 border rounded mb-2 text-sm" value={annForm.topic} onChange={e => setAnnForm({...annForm, topic: e.target.value})} />
                            <input placeholder="Key details (e.g. Oct 24th, wear costume, 5pm)" className="w-full p-2 border rounded mb-2 text-sm" value={annForm.details} onChange={e => setAnnForm({...annForm, details: e.target.value})} />
                            <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-purple-600 text-white py-1.5 rounded text-sm hover:bg-purple-700 flex justify-center items-center">
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1"/> Draft with AI</>}
                            </button>
                        </div>

                        <textarea required placeholder="Final Content (Edit as needed)" className="w-full p-2 border rounded min-h-[100px]" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
                        <button type="submit" className="w-full bg-natyalaya-700 text-white py-2 rounded hover:bg-natyalaya-800 flex justify-center items-center">
                            <Send className="w-4 h-4 mr-2"/> {editingAnnId ? 'Update & Republish' : 'Post Announcement'}
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold">History</h3>
                    {sortedAnnouncements.length === 0 && <p className="text-gray-500 italic">No announcements posted.</p>}
                    {sortedAnnouncements.map(ann => (
                        <div key={ann.id} className={`bg-white p-4 border rounded-lg hover:shadow-md transition-all ${editingAnnId === ann.id ? 'ring-2 ring-natyalaya-500 border-transparent' : ''}`}>
                             <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="font-bold text-natyalaya-900">{ann.title}</h4>
                                    <span className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString()}</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleEditAnnouncement(ann)} className="text-gray-400 hover:text-natyalaya-600 p-1">
                                         <Edit2 className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-gray-400 hover:text-red-600 p-1">
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                 </div>
                             </div>
                             <p className="text-sm text-gray-600 mt-1 line-clamp-3 whitespace-pre-wrap">{ann.content}</p>
                             <div className="mt-2 flex items-center justify-between">
                                <div className="text-xs bg-gray-100 inline-block px-2 py-0.5 rounded text-gray-600">Audience: {ann.targetAudience}</div>
                                <div className="flex gap-1">
                                    {ann.sentVia?.includes('EMAIL') && <Mail className="w-3 h-3 text-blue-500" />}
                                    {ann.sentVia?.includes('SMS') && <MessageSquare className="w-3 h-3 text-green-500" />}
                                    {ann.sentVia?.includes('WHATSAPP') && <MessageCircle className="w-3 h-3 text-green-700" />}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {tab === 'EVENTS' && (
             <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                     <h3 className="font-bold mb-4">Create Event</h3>
                     <form onSubmit={submitEvent} className="space-y-3">
                        <input required placeholder="Event Title" className="w-full p-2 border rounded" value={evtForm.title} onChange={e => setEvtForm({...evtForm, title: e.target.value})} />
                        <input required type="date" className="w-full p-2 border rounded" value={evtForm.date} onChange={e => setEvtForm({...evtForm, date: e.target.value})} />
                        <input placeholder="Location" className="w-full p-2 border rounded" value={evtForm.location} onChange={e => setEvtForm({...evtForm, location: e.target.value})} />
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Target Audience</label>
                            <select className="w-full p-2 border rounded text-sm" value={evtForm.targetAudience} onChange={e => setEvtForm({...evtForm, targetAudience: e.target.value})}>
                                <option value="ALL">All Students & Parents</option>
                                {categories.map(c => <option key={c.id} value={c.id}>Students in {c.name}</option>)}
                            </select>
                            <p className="text-xs text-right text-gray-400 mt-1">
                                Will notify approx. {getRecipientCount(evtForm.targetAudience || 'ALL')} recipients
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Notify Via</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => toggleChannel('EMAIL', 'EVT')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedEventChannels.includes('EMAIL') ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <Mail className="w-3 h-3 mr-1" /> Email
                                </button>
                                <button type="button" onClick={() => toggleChannel('SMS', 'EVT')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedEventChannels.includes('SMS') ? 'bg-green-50 border-green-300 text-green-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <MessageSquare className="w-3 h-3 mr-1" /> SMS
                                </button>
                                <button type="button" onClick={() => toggleChannel('WHATSAPP', 'EVT')} className={`flex items-center px-2 py-1 rounded border text-xs ${selectedEventChannels.includes('WHATSAPP') ? 'bg-green-100 border-green-300 text-green-900 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                    <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={handleEventAiGenerate} disabled={isGenerating} className="whitespace-nowrap px-3 py-2 bg-purple-100 text-purple-700 rounded border border-purple-200 text-sm hover:bg-purple-200">
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
                            </button>
                            <textarea required placeholder="Description" className="w-full p-2 border rounded" value={evtForm.description} onChange={e => setEvtForm({...evtForm, description: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="w-full bg-natyalaya-700 text-white py-2 rounded hover:bg-natyalaya-800">Create & Notify</button>
                     </form>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                    {sortedEvents.length === 0 && <p className="text-gray-500 italic">No upcoming events.</p>}
                    {sortedEvents.map(evt => (
                        <div key={evt.id} className="bg-white p-4 border-l-4 border-gold-500 rounded shadow-sm">
                             <h4 className="font-bold text-lg">{evt.title}</h4>
                             <p className="text-sm text-natyalaya-700 font-medium">{new Date(evt.date).toLocaleDateString()} @ {evt.location}</p>
                             <p className="text-sm text-gray-600 mt-2">{evt.description}</p>
                             <div className="mt-2 flex items-center justify-between border-t pt-2">
                                <span className="text-xs text-gray-400">Audience: {evt.targetAudience || 'ALL'}</span>
                                <div className="flex gap-1">
                                    {evt.sentVia?.includes('EMAIL') && <Mail className="w-3 h-3 text-blue-500" />}
                                    {evt.sentVia?.includes('SMS') && <MessageSquare className="w-3 h-3 text-green-500" />}
                                    {evt.sentVia?.includes('WHATSAPP') && <MessageCircle className="w-3 h-3 text-green-700" />}
                                </div>
                             </div>
                        </div>
                    ))}
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};
