'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminAuth } from '@/utils/adminAuth';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoading(true);
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setAdminAuth();
            router.push('/admin');
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#2563eb] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <div className="flex justify-center mb-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-[#0066ff] rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative h-36 w-36 rounded-full bg-gradient-to-br from-[#0066ff] to-[#2563eb] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <UserCircleIcon className="h-24 w-24 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-[#0066ff] to-[#2563eb] bg-clip-text text-transparent mb-8"
              >
                Welcome Back!
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-8"
              >
                <div className="relative">
                  <div className="w-full h-2.5 bg-[#e6f0ff] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#0066ff] to-[#2563eb]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-sm font-medium text-[#0066ff]">
                    <span>Loading</span>
                    <span>{progress}%</span>
                  </div>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[#0066ff] text-xl font-medium"
                >
                  Preparing your dashboard...
                </motion.p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl"
            >
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-[#2563eb]">
                  Admin Portal
                </h2>
                <p className="mt-2 text-sm text-[#3b82f6]">
                  Enter your credentials to access the admin panel
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="rounded-md shadow-sm space-y-4">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#bfdbfe] text-[#2563eb] placeholder-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#bfdbfe] text-[#2563eb] placeholder-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-[#ef4444] text-sm text-center">{error}</div>
                )}

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2563eb] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] transition-all duration-200"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 