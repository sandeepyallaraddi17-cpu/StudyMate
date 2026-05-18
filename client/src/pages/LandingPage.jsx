import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BrainCircuit, FileText } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold text-gray-800 dark:text-white">StudyMate</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400 mb-6">
            Study Smarter, Not Harder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Upload your PDF documents and let our AI extract key insights, generate summaries, and answer your questions instantly.
          </p>
          
          <Link to="/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105">
            Start Learning for Free
          </Link>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
          {[
            { icon: <FileText className="w-10 h-10 text-blue-500"/>, title: 'Smart Summaries', desc: 'Get concise summaries of long documents in seconds.' },
            { icon: <BookOpen className="w-10 h-10 text-green-500"/>, title: 'Key Insights', desc: 'Automatically extract important keywords and topics.' },
            { icon: <BrainCircuit className="w-10 h-10 text-purple-500"/>, title: 'AI Q&A', desc: 'Ask questions about your document and get instant answers.' },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="glass-card p-6 text-left flex flex-col items-start"
            >
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} StudyMate. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
