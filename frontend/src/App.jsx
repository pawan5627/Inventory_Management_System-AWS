import { useState } from 'react';
import Login from './components/auth/login';
import SignUp from './components/auth/signUp';
import ForgotPassword from './components/auth/forgotPassword';
import ResetPassword from './components/auth/resetPassword';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div>
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <SignUp onNavigate={setCurrentPage} />}
      {currentPage === 'forgot' && <ForgotPassword onNavigate={setCurrentPage} />}
      {currentPage === 'reset' && <ResetPassword onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;