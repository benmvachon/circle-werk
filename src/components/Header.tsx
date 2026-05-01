import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="main-nav">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/circles">Circles</Link>
        <Link to="/assignments">Assignments</Link>
        <Link to="/profile">Profile</Link>
      </div>
      {user && (
        <div className="nav-user">
          <span>{user.email}</span>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </nav>
  );
}
