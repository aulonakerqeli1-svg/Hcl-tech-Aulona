import { 
  Briefcase, 
  Home, 
  MessageSquare, 
  Bell, 
  Users, 
  Search, 
  User as UserIcon,
  LogOut,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'My Network', path: '/network' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: MessageSquare, label: 'Messaging', path: '/messaging' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-xl tracking-tight uppercase text-blue-600">ConnectHub</span>
          </Link>
          <div className="hidden md:flex relative max-w-xs w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search developers, jobs..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] md:min-w-[70px] pt-1 text-sm font-medium transition-colors",
                location.pathname === item.path 
                  ? "text-blue-600" 
                  : "text-slate-500 hover:text-blue-600"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] md:text-[11px] hidden sm:block">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="h-8 w-[1px] bg-slate-200 mx-2" />

          <div className="flex items-center gap-3">
            <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-full h-full p-1.5 text-slate-500" />
                )}
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors hidden lg:block">Me</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function SidebarProfile() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="h-16 bg-blue-600" />
      <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
        <Link to={`/profile/${profile.uid}`} className="relative group">
          <div className="w-20 h-20 rounded-full border-[4px] border-white bg-slate-100 overflow-hidden shadow-md">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-full h-full p-4 text-slate-400" />
            )}
          </div>
        </Link>
        <Link to={`/profile/${profile.uid}`} className="mt-4 font-bold text-slate-900 hover:text-blue-600 transition-colors text-lg">
          {profile.displayName}
        </Link>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed px-4">
          {profile.headline || 'No headline set'}
        </p>
      </div>
      <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
        <div className="flex justify-between text-xs mb-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Connections</span>
          <span className="text-blue-600 font-bold">24</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Views</span>
          <span className="text-blue-600 font-bold">12</span>
        </div>
      </div>
    </div>
  );
}
