import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Overview from './dashboard/Overview';
import Upload from './dashboard/Upload';
import DocumentDetail from './dashboard/DocumentDetail';

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Sidebar fixed to the left */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/documents" element={<Overview />} /> {/* Alias */}
          <Route path="/document/:id" element={<DocumentDetail />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;
