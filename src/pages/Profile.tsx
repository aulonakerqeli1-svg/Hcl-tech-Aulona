import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, GraduationCap, Edit2, Check, X, Camera, Plus, Mail, Linkedin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { id } = useParams();
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  const [isMe] = useState(user?.uid === id);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const generateAIBio = async () => {
    setIsGeneratingBio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Generate a professional, compelling, and concise 3-paragraph bio for a ${editValues.headline || 'professional'} based in ${editValues.location || 'somewhere'}. Keep it under 150 words. Focus on skills, passion, and professional drive.` }] }],
      });
      if (response.text) {
        setEditValues({ ...editValues, bio: response.text });
      }
    } catch (error) {
      console.error("Failed to generate AI bio:", error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      const d = await getDoc(doc(db, 'users', id));
      if (d.exists()) {
        setProfile(d.data());
        setEditValues(d.data());
      }
    };
    fetchProfile();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    await updateDoc(doc(db, 'users', id), editValues);
    setProfile(editValues);
    setIsEditing(false);
  };

  if (!profile) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold uppercase tracking-widest">Loading Professional Profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative group">
        <div className="h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 flex justify-end items-start relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 flex flex-wrap gap-8 p-10 pointer-events-none select-none">
                 {[...Array(20)].map((_, i) => <Briefcase key={i} className="w-12 h-12 rotate-12" />)}
             </div>
             {isMe && (
               <button className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 text-white cursor-pointer relative z-10 transition-all">
                  <Camera className="w-5 h-5" />
               </button>
             )}
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex justify-between items-start -mt-16">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-[6px] border-white bg-gray-200 overflow-hidden shadow-2xl z-20 relative">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-100">
                    {profile.displayName?.[0]}
                  </div>
                )}
              </div>
              {isMe && (
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 text-blue-600 z-30 cursor-pointer">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mt-20 flex gap-3">
              {isMe ? (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isEditing ? 'Save Profile' : 'Add Profile Section'}
                </button>
              ) : (
                <div className="flex gap-2">
                   <button className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md cursor-pointer">Connect</button>
                   <button className="border border-blue-600 text-blue-600 px-8 py-2.5 rounded-full font-bold hover:bg-blue-50 transition cursor-pointer">Message</button>
                </div>
              )}
              <button className="p-2.5 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-all">
                <Edit2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8 flex flex-col gap-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">{profile.displayName}</h1>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  {isEditing ? (
                    <input 
                      className="w-full border-b-2 border-blue-600 focus:outline-none" 
                      value={editValues.headline} 
                      onChange={e => setEditValues({...editValues, headline: e.target.value})}
                    />
                  ) : profile.headline}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2">
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" /> {profile.location || 'Add location'}
                  </span>
                  <Link to="/" className="text-blue-600 font-bold hover:underline">500+ connections</Link>
                  <span className="font-bold text-gray-300">|</span>
                  <Link to="/" className="text-blue-600 font-bold hover:underline">Contact info</Link>
                </div>
              </div>

              <section className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold tracking-tight">About</h3>
                  <div className="flex gap-2">
                    {isMe && isEditing && (
                      <button 
                        onClick={generateAIBio}
                        disabled={isGeneratingBio}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {isGeneratingBio ? 'Generating...' : '✨ Improve with AI'}
                      </button>
                    )}
                    {isMe && <Edit2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />}
                  </div>
                </div>
                {isEditing ? (
                  <textarea 
                    className="w-full min-h-[150px] p-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editValues.bio}
                    onChange={e => setEditValues({...editValues, bio: e.target.value})}
                  />
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "Write about your professional journey..."}
                  </p>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-2xl font-bold tracking-tight">Experience</h3>
                  <Plus className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-600" />
                </div>
                <div className="p-8 space-y-10">
                  {profile.experience?.map((exp: any, i: number) => (
                    <div key={i} className="flex gap-6 relative last:after:hidden after:absolute after:left-7 after:top-14 after:bottom-[-2.5rem] after:w-[2px] after:bg-gray-100">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-sm relative z-10">
                         <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-bold text-gray-900 tracking-tight">{exp.role}</h4>
                        <p className="text-base font-semibold text-gray-700">{exp.company}</p>
                        <p className="text-sm text-gray-500 font-medium">{exp.duration} • {exp.location}</p>
                        <p className="text-sm text-gray-600 mt-4 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{exp.description}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-10">
                      <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 italic">No experience added yet.</p>
                      {isMe && <button className="mt-4 text-blue-600 font-bold hover:underline">+ Add experience</button>}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="md:col-span-4 space-y-8">
               <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 tracking-tight">Profile Language</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center group cursor-pointer">
                        <span className="text-gray-600 font-medium group-hover:text-blue-600">English</span>
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center p-0.5">
                           <div className="w-full h-full bg-blue-600 rounded-full" />
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 tracking-tight">Public Profile & URL</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 break-all font-mono">
                     connecthub.com/in/{profile.displayName?.toLowerCase().replace(/\s+/g, '-')}
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="font-bold text-xl tracking-tight px-2">Contact Info</h3>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
                     <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                           <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                           <p className="text-sm font-semibold text-gray-900">{profile.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                           <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website</p>
                           <p className="text-sm font-semibold text-blue-600 hover:underline">portfolio.com</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
