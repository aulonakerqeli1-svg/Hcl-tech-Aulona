import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Search, Send, User as UserIcon, MoreHorizontal, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Messaging() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsubscribe;
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageData = {
      chatId: selectedChat.id,
      senderId: user.uid,
      content: newMessage,
      createdAt: serverTimestamp(),
    };

    setNewMessage('');
    await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messageData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-64px)] flex gap-4">
      {/* Chats List */}
      <div className="w-80 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg tracking-tight">Messaging</h2>
          <button className="p-1 hover:bg-gray-200 rounded-full"><MoreHorizontal className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search messages" 
              className="w-full bg-gray-100 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.length > 0 ? chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "p-4 border-b border-gray-50 flex gap-3 cursor-pointer hover:bg-gray-50 transition-all",
                selectedChat?.id === chat.id && "bg-blue-50 border-l-4 border-l-blue-600"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold truncate">Partner Name</h4>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Dec 20</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{chat.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm italic">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <h3 className="text-sm font-bold">Professional Partner</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">• Online</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full"><MoreHorizontal className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#F9FAFB]">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    message.senderId === user?.uid ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mt-auto" />
                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      "p-3 text-sm leading-relaxed",
                      message.senderId === user?.uid 
                        ? "bg-blue-600 text-white rounded-2xl rounded-br-none shadow-sm" 
                        : "bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm"
                    )}>
                      {message.content}
                    </div>
                    <span className={cn(
                      "text-[10px] text-gray-400 px-1",
                      message.senderId === user?.uid ? "text-right" : ""
                    )}>
                      {message.createdAt ? format(message.createdAt.toDate(), 'p') : ''}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-transparent focus-within:border-blue-200">
                <textarea 
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent resize-none h-10 py-2 text-sm focus:outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Select a conversation</h2>
            <p className="text-gray-500 max-w-sm">Connect with your network by starting a conversation with your professionals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
