import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, X, Search, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Network() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const q1 = query(collection(db, 'connections'), where('user1', '==', user.uid));
    const q2 = query(collection(db, 'connections'), where('user2', '==', user.uid));
    
    const unsub1 = onSnapshot(q1, (s) => processConnections(s.docs));
    const unsub2 = onSnapshot(q2, (s) => processConnections(s.docs));
    
    // In a real app, query users excluding current connections
    const usersUnsub = onSnapshot(collection(db, 'users'), (s) => {
      setSuggestedUsers(s.docs.filter(d => d.id !== user.uid).map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
      usersUnsub();
    };
  }, [user]);

  const processConnections = (docs: any[]) => {
    // Merge connections logic here
  };

  const handleConnect = async (targetId: string) => {
    if (!user) return;
    await addDoc(collection(db, 'connections'), {
      user1: user.uid,
      user2: targetId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-20">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold tracking-tight">Manage network</h2>
          </div>
          <div className="p-2">
            {[
              { icon: UserPlus, label: 'Connections', count: 24 },
              { icon: UserCheck, label: 'Followers', count: 156 },
              { icon: X, label: 'Groups', count: 8 },
              { icon: MoreHorizontal, label: 'Events', count: 2 },
            ].map(item => (
              <button 
                key={item.label}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm font-medium cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-400" />
                  {item.label}
                </div>
                <span className="font-bold">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-3 space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">People you may know</h2>
          <p className="text-sm text-slate-500 mb-10">Expand your professional community based on your industry and location.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedUsers.map(u => (
              <motion.div 
                key={u.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-blue-600/10"
              >
                <div className="h-20 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-80" />
                <div className="px-5 pb-6 -mt-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-50 overflow-hidden shadow-lg object-cover">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                         <UserPlus className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h4 className="mt-4 font-bold text-slate-900 hover:text-blue-600 transition-colors">{u.displayName}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 h-8 leading-relaxed px-2 uppercase font-bold tracking-widest">
                    {u.headline || 'Professional'}
                  </p>
                  <button 
                    onClick={() => handleConnect(u.id)}
                    className="mt-6 w-full py-2 px-4 rounded-lg border border-blue-600 text-blue-600 text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Connect
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
