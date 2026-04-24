import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden text-slate-900 border border-slate-200">
      {/* Left Branding Section */}
      <div className="md:w-3/5 p-16 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-xl tracking-tight uppercase text-blue-600">ConnectHub</span>
          </div>
          <h1 className="text-5xl font-light leading-tight mb-6">
            The professional <br/><span className="font-semibold text-blue-600">Fullstack Hub</span> for engineers.
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            Secure user authentication, full CRUD capabilities, and real-time network tracking designed with modern software principles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-blue-600 font-bold text-lg mb-1">Clean Arch</div>
              <p className="text-xs text-slate-400">Decoupled layers for maximum scalability and maintainability.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-blue-600 font-bold text-lg mb-1">Modern UI</div>
              <p className="text-xs text-slate-400">Sophisticated minimalism for zero-distraction productivity.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Login Section */}
      <div className="md:w-2/5 bg-white border-l border-slate-100 p-16 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-2">Access your professional project profile</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 bg-white border border-slate-200 rounded-full flex items-center justify-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Secure Access</span></div>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 leading-relaxed italic">
                "Join over 50,000 engineers building the future of fullstack development on ConnectHub."
              </p>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100">
            <p className="text-center text-sm text-slate-400">
              By joining, you agree to our <span className="text-blue-600 font-bold cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-bold cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
