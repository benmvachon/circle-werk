import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export function Layout() {

  return (
    <div className="app-layout">
      <Header />
      <main className="page app-main">
        <Outlet />
      </main>
    </div>
  );
}
