
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ClassCategory, Location, FirebaseConfig, UserRole, UserAccount } from '../types';
import { Settings, MapPin, Plus, Edit2, Trash2, Save, X, Users, KeyRound, Database, Cloud, Download, Upload, UserPlus, AlertTriangle } from 'lucide-react';

export const Configuration: React.FC = () => {
  const { categories, locations, userAccounts, addCategory, updateCategory, addLocation, updateLocation, deleteItem, resetPassword, updateUserEmail, downloadSystemBackup, restoreSystemBackup, addUser, clearAllData } = useData();
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'LOCATIONS' | 'USERS' | 'DATABASE'>('CATEGORIES');

  // Category Form State
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState<Partial<ClassCategory>>({ name: '', level: '', feePerHour: 10, description: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Location Form State
  const [showLocForm, setShowLocForm] = useState(false);
  const [locForm, setLocForm] = useState<Partial<Location>>({ name: '', address: '' });
  const [editingLocId, setEditingLocId] = useState<string | null>(null);

  // User Management State
  const [editingEmailUser, setEditingEmailUser] = useState<string | null>(null); // Email of user being edited
  const [newEmail, setNewEmail] = useState('');
  
  // Add User Form State
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState<UserAccount>({ name: '', email: '', password: '', role: UserRole.TEACHER });

  // --- Category Handlers ---
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCatId) {
      updateCategory({ ...catForm, id: editingCatId } as ClassCategory);
    } else {
      const newCategory: ClassCategory = { ...catForm as ClassCategory, id: `cat_${Date.now()}` };
      addCategory(newCategory);
    }
    resetCatForm();
  };

  const resetCatForm = () => {
    setCatForm({ name: '', level: '', feePerHour: 10, description: '' });
    setEditingCatId(null);
    setShowCatForm(false);
  };

  const startEditCat = (cat: ClassCategory) => {
    setCatForm(cat);
    setEditingCatId(cat.id);
    setShowCatForm(true);
  };

  // --- Location Handlers ---
  const handleLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocId) {
      updateLocation({ ...locForm, id: editingLocId } as Location);
    } else {
      const newLocation: Location = { ...locForm as Location, id: `loc_${Date.now()}` };
      addLocation(newLocation);
    }
    resetLocForm();
  };

  const resetLocForm = () => {
    setLocForm({ name: '', address: '' });
    setEditingLocId(null);
    setShowLocForm(false);
  };

  const startEditLoc = (loc: Location) => {
    setLocForm(loc);
    setEditingLocId(loc.id);
    setShowLocForm(true);
  };

  // --- User Handlers ---
  const handleResetPassword = (email: string) => {
      const newPass = prompt(`Enter new password for ${email} (Leave empty for default 'password123'):`);
      if (newPass !== null) {
          resetPassword(email, newPass || undefined);
          alert('Password updated successfully.');
      }
  };

  const startEditEmail = (currentEmail: string) => {
      setEditingEmailUser(currentEmail);
      setNewEmail(currentEmail);
  };

  const saveNewEmail = (oldEmail: string) => {
      if (newEmail && newEmail !== oldEmail) {
          if (window.confirm(`Change email from ${oldEmail} to ${newEmail}? This will also update linked student profiles.`)) {
              updateUserEmail(oldEmail, newEmail);
          }
      }
      setEditingEmailUser(null);
      setNewEmail('');
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();

      if (userForm.password.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
      }

      const result = addUser(userForm);
      if (result.success) {
          alert(result.message);
          setShowUserForm(false);
          setUserForm({ name: '', email: '', password: '', role: UserRole.TEACHER });
      } else {
          alert(result.message);
      }
  };

  // --- Database Handlers ---
  const handleFirebaseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (window.confirm("Restoring will overwrite current data. Are you sure?")) {
              restoreSystemBackup(file);
          }
      }
  };

  const handleFactoryReset = async () => {
      if (window.confirm("⚠️ DANGER: Are you sure you want to WIPE ALL DATA?\n\nThis will delete all students, schedule, attendance, fees, and announcements.\n\nOnly Admin accounts and Settings will remain.")) {
          if (window.confirm("Please confirm a second time.\n\nThis action cannot be undone.")) {
              await clearAllData();
              alert("System has been reset to factory state (Empty).");
          }
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 gap-4">
        <h1 className="text-3xl font-heading font-bold text-natyalaya-900">System Configuration</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'CATEGORIES' ? 'bg-natyalaya-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <Settings className="w-4 h-4 mr-2" /> Classes
          </button>
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'LOCATIONS' ? 'bg-natyalaya-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <MapPin className="w-4 h-4 mr-2" /> Locations
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'USERS' ? 'bg-natyalaya-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4 mr-2" /> Users
          </button>
           <button
            onClick={() => setActiveTab('DATABASE')}
            className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'DATABASE' ? 'bg-natyalaya-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <Database className="w-4 h-4 mr-2" /> Database
          </button>
        </div>
      </div>

      {/* --- Categories Tab --- */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-between items-center">
              <p className="text-gray-600">Manage dance styles, levels, and fee structures.</p>
              <button onClick={() => { resetCatForm(); setShowCatForm(true); }} className="flex items-center px-3 py-2 bg-natyalaya-600 text-white rounded hover:bg-natyalaya-700 text-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
              </button>
           </div>

           {showCatForm && (
             <div className="bg-white p-6 rounded-lg shadow-lg border border-natyalaya-200">
                <h3 className="font-bold mb-4 text-natyalaya-900">{editingCatId ? 'Edit Category' : 'New Class Category'}</h3>
                <form onSubmit={handleCatSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Category Name</label>
                        <input required placeholder="e.g. Beginner Adavus" className="w-full p-2 border rounded" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Level</label>
                        <input required placeholder="e.g. Level 1" className="w-full p-2 border rounded" value={catForm.level} onChange={e => setCatForm({...catForm, level: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Fee per Hour (£)</label>
                        <input required type="number" className="w-full p-2 border rounded" value={catForm.feePerHour} onChange={e => setCatForm({...catForm, feePerHour: Number(e.target.value)})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                        <textarea placeholder="Description of the curriculum..." className="w-full p-2 border rounded" rows={2} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button type="button" onClick={resetCatForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded border">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800 flex items-center">
                            <Save className="w-4 h-4 mr-2" /> Save Category
                        </button>
                    </div>
                </form>
             </div>
           )}

           <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
               <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-natyalaya-50">
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee (£/hr)</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                       {categories.map(cat => (
                           <tr key={cat.id} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{cat.level}</td>
                               <td className="px-6 py-4 text-sm font-bold text-natyalaya-700">£{cat.feePerHour}</td>
                               <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description}</td>
                               <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-2">
                                   <button onClick={() => startEditCat(cat)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                                   <button onClick={() => { if(window.confirm('Delete this category?')) deleteItem('categories', cat.id) }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
        </div>
      )}

      {/* --- Locations Tab --- */}
      {activeTab === 'LOCATIONS' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-between items-center">
              <p className="text-gray-600">Manage studio locations and online links.</p>
              <button onClick={() => { resetLocForm(); setShowLocForm(true); }} className="flex items-center px-3 py-2 bg-natyalaya-600 text-white rounded hover:bg-natyalaya-700 text-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Location
              </button>
           </div>

           {showLocForm && (
             <div className="bg-white p-6 rounded-lg shadow-lg border border-natyalaya-200">
                <h3 className="font-bold mb-4 text-natyalaya-900">{editingLocId ? 'Edit Location' : 'New Location'}</h3>
                <form onSubmit={handleLocSubmit} className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Location Name</label>
                        <input required placeholder="e.g. Studio 1" className="w-full p-2 border rounded" value={locForm.name} onChange={e => setLocForm({...locForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Address / Link</label>
                        <input required placeholder="Address or URL" className="w-full p-2 border rounded" value={locForm.address} onChange={e => setLocForm({...locForm, address: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={resetLocForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded border">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800 flex items-center">
                            <Save className="w-4 h-4 mr-2" /> Save Location
                        </button>
                    </div>
                </form>
             </div>
           )}

           <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
               <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-natyalaya-50">
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location Name</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address / Link</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                       {locations.map(loc => (
                           <tr key={loc.id} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center"><MapPin className="w-3 h-3 mr-2 text-gray-400"/> {loc.name}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{loc.address}</td>
                               <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-2">
                                   <button onClick={() => startEditLoc(loc)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                                   <button onClick={() => { if(window.confirm('Delete this location?')) deleteItem('locations', loc.id) }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
        </div>
      )}

      {/* --- User Accounts Tab --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage login credentials for Admin, Teachers, and Students.</p>
                <button 
                    onClick={() => setShowUserForm(!showUserForm)}
                    className="flex items-center px-3 py-2 bg-natyalaya-600 text-white rounded hover:bg-natyalaya-700 text-sm"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                </button>
           </div>
           
           {showUserForm && (
             <div className="bg-white p-6 rounded-lg shadow-lg border border-natyalaya-200 animate-fade-in">
                <h3 className="font-bold mb-4 text-natyalaya-900">Add New User (Admin / Teacher)</h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                        <input 
                            required 
                            placeholder="Name" 
                            className="w-full p-2 border rounded" 
                            value={userForm.name} 
                            onChange={e => setUserForm({...userForm, name: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                        <input 
                            required 
                            type="email"
                            placeholder="Email" 
                            className="w-full p-2 border rounded" 
                            value={userForm.email} 
                            onChange={e => setUserForm({...userForm, email: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Role</label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={userForm.role}
                            onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}
                        >
                            <option value={UserRole.TEACHER}>Teacher</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                            <option value={UserRole.HEAD_TEACHER}>Head Teacher</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Initial Password</label>
                        <input 
                            required 
                            type="password"
                            placeholder="Password" 
                            className="w-full p-2 border rounded" 
                            value={userForm.password} 
                            onChange={e => setUserForm({...userForm, password: e.target.value})} 
                        />
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded border">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" /> Create Account
                        </button>
                    </div>
                </form>
             </div>
           )}

           <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
               <div className="bg-natyalaya-50 px-6 py-4 border-b border-gray-200">
                   <h3 className="font-bold text-natyalaya-900">Registered Accounts</h3>
                   <p className="text-xs text-gray-500">Existing accounts in the system.</p>
               </div>
               <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-white">
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email (Login ID)</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                       {userAccounts.map((user, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.name}</td>
                               <td className="px-6 py-4 text-sm">
                                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                       user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                                       user.role === 'HEAD_TEACHER' ? 'bg-purple-100 text-purple-800' : 
                                       user.role === 'TEACHER' ? 'bg-purple-50 text-purple-700' :
                                       'bg-blue-100 text-blue-800'
                                   }`}>
                                       {user.role.replace('_', ' ')}
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-sm text-gray-600">
                                   {editingEmailUser === user.email ? (
                                       <div className="flex gap-2 items-center">
                                           <input 
                                                type="email" 
                                                className="border rounded px-2 py-1 text-sm w-48" 
                                                value={newEmail} 
                                                onChange={e => setNewEmail(e.target.value)} 
                                           />
                                           <button onClick={() => saveNewEmail(user.email)} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4"/></button>
                                           <button onClick={() => setEditingEmailUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                                       </div>
                                   ) : (
                                       <span className="flex items-center group">
                                           {user.email}
                                           <button onClick={() => startEditEmail(user.email)} className="ml-2 text-gray-300 hover:text-natyalaya-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Correct Email Typo">
                                               <Edit2 className="w-3 h-3"/>
                                           </button>
                                       </span>
                                   )}
                               </td>
                               <td className="px-6 py-4 text-right text-sm font-medium">
                                   <button 
                                    onClick={() => handleResetPassword(user.email)}
                                    className="text-gray-500 hover:text-natyalaya-700 flex items-center justify-end w-full"
                                    title="Set/Reset Password"
                                   >
                                       <KeyRound className="w-4 h-4 mr-1" /> Reset Pass
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
        </div>
      )}

      {/* --- Database & Backup Tab --- */}
      {activeTab === 'DATABASE' && (
          <div className="space-y-8 animate-fade-in">
               {/* 1. Backup & Restore Section */}
               <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-bold text-natyalaya-900 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2"/> System Backup & Restore
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-5 rounded border border-gray-200">
                            <h4 className="font-bold text-sm text-gray-700 mb-2">Download Backup</h4>
                            <p className="text-xs text-gray-500 mb-4">Save a copy of all students, classes, fees, and settings to your computer.</p>
                            <button 
                                onClick={downloadSystemBackup}
                                className="w-full flex items-center justify-center px-4 py-2 bg-natyalaya-700 text-white rounded hover:bg-natyalaya-800"
                            >
                                <Download className="w-4 h-4 mr-2"/> Download JSON
                            </button>
                        </div>
                        <div className="bg-gray-50 p-5 rounded border border-gray-200">
                            <h4 className="font-bold text-sm text-gray-700 mb-2">Restore from File</h4>
                            <p className="text-xs text-gray-500 mb-4">Overwrite current data with a previously saved backup file.</p>
                            <label className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer">
                                <Upload className="w-4 h-4 mr-2"/> Select JSON File
                                <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                            </label>
                        </div>
                    </div>
               </section>

               {/* 3. Factory Reset Section (Danger Zone) */}
               <section className="bg-white p-6 rounded-lg shadow border-t-4 border-red-600 mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-100 text-red-700 px-3 py-1 text-xs font-bold rounded-bl-lg">
                        ADMIN ONLY
                    </div>
                    <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2"/> Danger Zone: Factory Reset
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        This will <strong>permanently delete</strong> all students, schedule, attendance records, fees, and announcements.
                        <br/>Use this to clear dummy data before starting fresh.
                        <br/><strong>Your Admin account and Settings will be preserved.</strong>
                    </p>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleFactoryReset}
                            className="px-6 py-2 bg-red-100 text-red-700 border border-red-200 font-bold rounded hover:bg-red-600 hover:text-white transition-colors flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2"/> Wipe All Data
                        </button>
                    </div>
               </section>
          </div>
      )}
    </div>
  );
};
