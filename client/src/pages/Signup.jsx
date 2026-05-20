import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              <Compass className="text-blue-400 w-8 h-8" />
              Traveloop
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">Create an Account</h2>
          <p className="text-gray-400 text-center mb-8">Join Traveloop to start planning.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 flex justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-8 text-sm">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
