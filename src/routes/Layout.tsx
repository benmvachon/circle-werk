import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <div className="app-layout">
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/circles">Circles</Link>
        <Link to="/assignments">Assignments</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
