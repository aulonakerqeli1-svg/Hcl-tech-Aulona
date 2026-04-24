import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Image as ImageIcon, Send, User as UserIcon, Plus, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { SidebarProfile } from '../components/Layout';
import { cn } from '../lib/utils';

export default function Feed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user || !profile) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile.displayName,
        authorHeadline: profile.headline,
        authorPhoto: profile.photoURL,
        content: newPost,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewPost('');
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, likedByMe: boolean) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likesCount: increment(likedByMe ? -1 : 1)
    });
    // In a real app, track who liked it in a subcollection
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <div className="md:col-span-1 lg:col-span-3">
        <SidebarProfile />
        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-20">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent hashtags</h3>
          <ul className="space-y-3">
            {['#technology', '#hiring', '#reactjs', '#career', '#design'].map(tag => (
              <li key={tag} className="text-slate-600 hover:text-blue-600 p-1 rounded cursor-pointer text-xs flex items-center gap-2 transition-colors font-medium">
                <span className="text-blue-500 font-bold">#</span>
                {tag.substring(1)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Feed */}
      <div className="md:col-span-3 lg:col-span-6 space-y-4">
        {/* Create Post */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-2.5 text-slate-400" />
              )}
            </div>
            <button 
              onClick={() => setIsPosting(true)}
              className="flex-1 bg-slate-50 rounded-lg text-left px-5 text-sm text-slate-400 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer font-medium"
            >
              Share an engineering insight...
            </button>
          </div>
          <div className="mt-5 flex justify-between px-2 pt-4 border-t border-slate-50">
            <button className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider hover:text-blue-600 px-3 py-2 rounded-md transition-all cursor-pointer">
              <ImageIcon className="text-blue-500 w-4 h-4" /> Photo
            </button>
            <button className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider hover:text-blue-600 px-3 py-2 rounded-md transition-all cursor-pointer">
              <Plus className="text-blue-600 w-4 h-4" /> Link
            </button>
            <button className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider hover:text-blue-600 px-3 py-2 rounded-md transition-all cursor-pointer">
              <Briefcase className="text-slate-400 w-4 h-4" /> Resource
            </button>
          </div>
        </div>

        {/* Posts List */}
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                      {post.authorPhoto ? (
                        <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-full h-full p-2.5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer">
                        {post.authorName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{post.authorHeadline || 'Professional'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {post.createdAt ? formatDistanceToNow(post.createdAt.toDate()) + ' ago' : 'Processing'} • 🌐
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors p-1"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {post.imageURL && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-slate-100">
                    <img src={post.imageURL} alt="Post content" className="w-full h-auto" />
                  </div>
                )}
              </div>

              <div className="px-5 py-3 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="text-blue-600">{post.likesCount || 0} Likes</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{post.commentsCount || 0} Discussions</span>
                </div>
              </div>

              <div className="px-5 py-1 flex items-center gap-1 border-t border-slate-50">
                <button 
                  onClick={() => handleLike(post.id, false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4" /> Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-wider rounded cursor-pointer">
                  <MessageSquare className="w-4 h-4" /> Discuss
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-wider rounded cursor-pointer">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recommended experts</h3>
          <ul className="space-y-5">
            {[
              { name: 'Dr. Sarah Chen', desc: 'Cloud Architect @ Azure' },
              { name: 'Alex Rivera', desc: 'Principal Engineer @ Vercel' },
              { name: 'ConnectHub Staff', desc: 'Platform Updates' },
            ].map(org => (
              <li key={org.name} className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{org.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{org.desc}</p>
                  <button className="mt-2 w-full py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                    Connect
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosting(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold tracking-tight">Create a post</h3>
                <button onClick={() => setIsPosting(false)} className="text-gray-400 hover:text-black">
                  <Plus className="rotate-45 w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handlePost} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-sm">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-full h-full p-2 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{profile?.displayName}</h4>
                    <button className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 mt-1 font-semibold text-gray-600">🌐 Anyone</button>
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[150px] text-lg text-gray-800 placeholder-gray-500 resize-none focus:outline-none"
                  placeholder="What do you want to talk about?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  autoFocus
                />
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><ImageIcon className="w-6 h-6" /></button>
                    <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Plus className="w-6 h-6" /></button>
                  </div>
                  <button
                    disabled={!newPost.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition shadow-md cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
