import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DocumentDetail = () => {
  const { id } = useParams();
  const { api } = useContext(AuthContext);
  
  const [document, setDocument] = useState(null);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'chat'
  const chatEndRef = useRef(null);

  useEffect(() => {
    let intervalId;
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setDocument(res.data);
        
        // If still processing, poll every 3 seconds
        if (res.data.status === 'processing') {
          intervalId = setTimeout(fetchDoc, 3000);
        } else {
          setLoading(false);
          // Fetch chat history once done
          const chatRes = await api.get(`/chat/${id}`);
          if (chatRes.data && chatRes.data.messages) {
            setChat(chatRes.data.messages);
          }
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDoc();

    return () => clearTimeout(intervalId);
  }, [api, id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setChat(prev => [...prev, { role: 'user', content: userQ }]);
    setAsking(true);

    try {
      const res = await api.post('/chat', { documentId: id, question: userQ });
      setChat(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error answering that.' }]);
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Processing document...</p>
      </div>
    );
  }

  if (!document) {
    return <div className="p-8 text-center text-red-500">Document not found.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-md">{document.originalName}</h2>
            <p className="text-xs text-gray-500">Processed on {new Date(document.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Summary & Insights
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            AI Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {document.status === 'failed' ? (
          <div className="max-w-3xl mx-auto glass-card p-6 flex items-start space-x-4 border-red-200 bg-red-50 dark:bg-red-900/10">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-400 font-bold mb-1">Processing Failed</h3>
              <p className="text-red-600 dark:text-red-300 text-sm">We couldn't extract text from this document. It might be encrypted, corrupted, or an image-based PDF without OCR.</p>
            </div>
          </div>
        ) : activeTab === 'summary' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
            <div className="glass-card p-8">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Summary</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {document.summary || "No summary available."}
              </p>
            </div>
            
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Topics & Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {document.keywords && document.keywords.length > 0 ? (
                  document.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No keywords extracted.</span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-full flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Sparkles className="w-12 h-12 mb-2 opacity-50" />
                  <p>Ask a question about your document.</p>
                </div>
              ) : (
                chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-3 flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
              <form onSubmit={handleAskQuestion} className="flex space-x-2">
                <input 
                  type="text" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={asking}
                />
                <button 
                  type="submit" 
                  disabled={asking || !question.trim()}
                  className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
