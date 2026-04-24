import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Briefcase, Building, MapPin, Search, Filter, Bookmark, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-20">
          <h2 className="font-bold flex items-center gap-2 mb-4 tracking-tight">
            <Filter className="w-5 h-5 text-gray-400" /> Job filters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Distance</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Within 25 miles</option>
                <option>Remote only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Job type</label>
              <div className="space-y-2">
                {['Full-time', 'Contract', 'Part-time', 'Internship'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="group-hover:translate-x-1 transition-transform">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="lg:col-span-9 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search jobs, skill, or company" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-lg"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="City, state, or zip code" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-lg"
              />
            </div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg cursor-pointer active:scale-95">
              Search
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Personalized opportunities</h3>
          <div className="grid gap-4">
            {jobs.length > 0 ? jobs.map(job => (
              <motion.div 
                key={job.id}
                whileHover={{ x: 5 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors border border-slate-100">
                    <Building className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer tracking-tight">
                        {job.title}
                      </h4>
                      <button className="text-slate-300 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-slate-700 font-bold mt-1 uppercase text-xs tracking-wider">{job.company}</p>
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" /> {job.location}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-100">Actively recruiting</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {job.createdAt ? formatDistanceToNow(job.createdAt.toDate()) + ' ago' : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-blue-900 mb-2">No jobs matched your search</h4>
                <p className="text-blue-600/70 max-w-sm mx-auto">Try adjusting your filters or search keywords to find more opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
