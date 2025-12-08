import { useState } from 'react';
import Login from './components/auth/login';
import SignUp from './components/auth/signUp';
import ForgotPassword from './components/auth/forgotPassword';
import ResetPassword from './components/auth/resetPassword';
import MainApp from './components/layout/MainApp';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  if (!isAuthenticated) {
    return (
      <div>
        {currentPage === 'login' && <Login onNavigate={setCurrentPage} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignUp onNavigate={setCurrentPage} />}
        {currentPage === 'forgot' && <ForgotPassword onNavigate={setCurrentPage} />}
        {currentPage === 'reset' && <ResetPassword onNavigate={setCurrentPage} />}
      </div>
    );
  }

  return <MainApp onLogout={handleLogout} />;
}

export default App;