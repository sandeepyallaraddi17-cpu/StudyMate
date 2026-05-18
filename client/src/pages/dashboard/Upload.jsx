import React, { useState, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { UploadCloud, File, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Redirect to document detail
      navigate(`/dashboard/document/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload a PDF to extract insights and start chatting.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
                <UploadCloud className="w-10 h-10 text-primary-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              or click to browse from your computer (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded text-red-600">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full max-w-md py-3 text-lg flex justify-center items-center"
            >
              {uploading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Uploading...</>
              ) : 'Start Processing'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;
