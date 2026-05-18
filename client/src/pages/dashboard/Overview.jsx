import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Clock, ChevronRight, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const Overview = () => {
  const { api } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [api]);

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view your uploaded documents.</p>
        </div>
        <Link to="/dashboard/upload" className="btn-primary flex items-center space-x-2">
          <UploadCloud className="w-5 h-5" />
          <span>Upload New</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-full mb-4">
            <FileText className="w-12 h-12 text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No documents yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first PDF to start generating summaries and studying smarter.</p>
          <Link to="/dashboard/upload" className="btn-primary">Upload Document</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={doc._id} 
              className="glass-card p-5 hover:border-primary-400 dark:hover:border-primary-600 transition-colors group cursor-pointer"
            >
              <Link to={`/dashboard/document/${doc._id}`} className="block h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1" title={doc.originalName}>
                  {doc.originalName}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 mt-auto pt-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-primary-500 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;
