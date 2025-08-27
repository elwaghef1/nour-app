import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n'; // Import i18n configuration

import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalysisList from './pages/AnalysisList';
import BatchAnalysis from './pages/BatchAnalysis';
import PatientHistory from './pages/PatientHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AnalysisProvider>
          <Router>
            <div className="App">
            <Routes>
              {/* Route publique */}
              <Route path="/login" element={<Login />} />
              
              {/* Routes protégées */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analyses" element={<AnalysisList />} />
                <Route path="batch-analysis" element={<BatchAnalysis />} />
                <Route path="patient-history" element={<PatientHistory />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Route par défaut */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            
            {/* Notifications toast */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              className="mt-16"
            />
          </div>
        </Router>
      </AnalysisProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;