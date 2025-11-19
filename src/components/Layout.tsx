
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { LayoutDashboard, Users, Calendar, Bell, LogOut, Menu, X, PoundSterling, Settings, Award } from 'lucide-react';
import { UserRole } from '../types';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { currentUser, logout } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'STUDENTS', label: 'Students', icon: Users, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'CLASSES', label: 'Classes & Attendance', icon: Calendar, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'FEES', label: 'Fees (Dakshina)', icon: PoundSterling, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'PROGRESS', label: 'Progress & Grading', icon: Award, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'COMMUNICATION', label: 'Communication', icon: Bell, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER, UserRole.TEACHER, UserRole.STUDENT] },
    { id: 'CONFIGURATION', label: 'Configuration', icon: Settings, roles: [UserRole.ADMIN, UserRole.HEAD_TEACHER] }, // Only Admin & Head Teacher
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser?.role as UserRole));

  return (
    <div className="min-h-screen bg-[#fbf6f0] flex font-body">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-natyalaya-900 via-natyalaya-900 to-natyalaya-950 text-white shadow-2xl border-r border-natyalaya-800">
        <div className="p-6 flex flex-col items-center border-b border-natyalaya-800/50 bg-natyalaya-950/20">
          <div className="w-28 h-28 mb-3 bg-white/5 rounded-full p-3 shadow-inner transition-all hover:scale-105 border border-gold-500/20">
            <Logo />
          </div>
          <div className="text-center">
            <h2 className="font-heading font-bold text-2xl leading-tight text-white tracking-wide">Kasthuri</h2>
            <h2 className="font-heading font-bold text-lg leading-tight text-gold-500 tracking-[0.2em] uppercase">Natyalaya</h2>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-natyalaya-800 text-gold-500 shadow-lg border-l-4 border-gold-500' 
                  : 'text-natyalaya-100 hover:bg-natyalaya-800/40 hover:text-white hover:pl-5'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${currentView === item.id ? 'text-gold-500' : 'text-natyalaya-400 group-hover:text-gold-400'}`} />
              <span className="font-medium tracking-wide text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 bg-natyalaya-950/30 border-t border-natyalaya-800/50">
          <div className="mb-4 px-2">
             <p className="text-[10px] text-gold-500/70 uppercase font-bold tracking-wider mb-1">Logged in as</p>
             <p className="font-medium text-white truncate">{currentUser?.name}</p>
             <p className="text-xs text-natyalaya-400 italic capitalize">{currentUser?.role.replace('_', ' ').toLowerCase()}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-natyalaya-700 rounded-md hover:bg-natyalaya-800 transition-colors text-xs font-bold uppercase tracking-wider text-natyalaya-300 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-natyalaya-900 text-white z-50 flex justify-between items-center p-4 shadow-md border-b border-gold-600">
          <div className="flex items-center">
             <div className="w-10 h-10 mr-3 bg-white/10 rounded-full p-1">
                <Logo />
             </div>
             <div>
                <span className="font-heading font-bold text-lg block leading-none">Kasthuri</span>
                <span className="font-heading font-bold text-xs text-gold-500 tracking-wider">Natyalaya</span>
             </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gold-500">
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-natyalaya-900 z-40 pt-24 px-6 space-y-4 animate-fade-in">
             {filteredNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center px-4 py-4 rounded-lg text-lg border-b border-natyalaya-800 ${
                    currentView === item.id ? 'text-gold-500 font-bold bg-natyalaya-800' : 'text-white'
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  {item.label}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center px-4 py-4 text-red-300 mt-8 border-t border-natyalaya-700">
                  <LogOut className="w-6 h-6 mr-4" /> Sign Out
              </button>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-0 p-4 md:p-8 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};
