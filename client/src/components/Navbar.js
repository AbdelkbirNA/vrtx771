import React from 'react'; // Removed useState and useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth(); // Get auth state and logout function from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout from context
    console.log('User logged out');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <a href="/">Newsletter App</a>
      </div>
      <ul className="navbar-nav">
        {isLoggedIn ? (
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </li>
        ) : (
          <>
            <li className="nav-item">
              <a href="/login" className="nav-link">Login</a>
            </li>
            <li className="nav-item">
              <a href="/register" className="nav-link">Register</a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
