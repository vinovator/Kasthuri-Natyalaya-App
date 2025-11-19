
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Lock, Eye, EyeOff, UserPlus, LogIn, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, register } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (regPassword.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
      }
      
      const result = register({
          email: regEmail,
          password: regPassword,
          name: regName,
          role: UserRole.STUDENT // Default to student, system will check admin/teacher emails
      }, regDob);

      if (result.success) {
          alert(result.message);
          setIsRegistering(false);
          setEmail(regEmail);
          setRegEmail('');
          setRegPassword('');
          setRegName('');
          setRegDob('');
      } else {
          setError(result.message);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1632213702844-1e0615781374?q=80&w=2000&auto=format&fit=crop" 
          alt="Bharatanatyam Dancer Traditional Dress" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-natyalaya-950/70 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="relative z-10 bg-white/95 p-10 rounded-t-xl rounded-b-sm shadow-2xl max-w-md w-full border-t-8 border-natyalaya-700 border-b-8 border-b-gold-500 animate-fade-in">
        <div className="text-center mb-8">
          {/* Logo Container */}
          <div className="w-24 h-24 mx-auto mb-6 transform hover:scale-105 transition-transform duration-500">
            <Logo />
          </div>
          
          <h1 className="text-4xl font-heading font-bold text-natyalaya-900 tracking-tight">Kasthuri Natyalaya</h1>
          <div className="flex items-center justify-center gap-2 mt-3 opacity-80">
            <div className="h-[1px] w-8 bg-natyalaya-400"></div>
            <p className="text-natyalaya-800 font-serif font-semibold italic tracking-wider uppercase text-xs">The Digital Gurukulam</p>
            <div className="h-[1px] w-8 bg-natyalaya-400"></div>
          </div>
        </div>

        {/* Toggle Header */}
        <div className="flex justify-center mb-6">
             <div className="bg-natyalaya-50 rounded-full p-1 flex">
                 <button 
                    onClick={() => { setIsRegistering(false); setError(''); }}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${!isRegistering ? 'bg-natyalaya-700 text-white shadow' : 'text-natyalaya-600'}`}
                 >
                     Login
                 </button>
                 <button 
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${isRegistering ? 'bg-natyalaya-700 text-white shadow' : 'text-natyalaya-600'}`}
                 >
                     Sign Up
                 </button>
             </div>
        </div>

        {!isRegistering ? (
             <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type="email"
                            required
                            className="pl-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="pl-10 pr-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-natyalaya-400 hover:text-natyalaya-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 animate-pulse">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-natyalaya-700 hover:bg-natyalaya-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natyalaya-500 transition-all"
                >
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                </button>
             </form>
        ) : (
            <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Your Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type="text"
                            required
                            className="pl-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            placeholder="Full Name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type="email"
                            required
                            className="pl-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            placeholder="Enter your email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Student Date of Birth (Verification)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type="date"
                            required
                            className="pl-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-natyalaya-800 uppercase tracking-wide mb-2">Create Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-natyalaya-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="pl-10 pr-10 block w-full bg-natyalaya-50 border-natyalaya-200 rounded-md shadow-sm focus:ring-natyalaya-600 focus:border-natyalaya-600 py-3 border transition-all"
                            placeholder="At least 6 characters"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                         <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-natyalaya-400 hover:text-natyalaya-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-natyalaya-700 hover:bg-natyalaya-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natyalaya-500 transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                </button>
            </form>
        )}

        <div className="mt-6 text-center">
             <p className="text-xs text-gray-500">© {new Date().getFullYear()} Kasthuri Natyalaya. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};
