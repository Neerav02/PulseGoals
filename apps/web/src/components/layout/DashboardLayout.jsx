import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 260,
        minHeight: '100vh',
      }}>
        <Header />
        <main style={{
          flex: 1,
          padding: '1.5rem 2rem 2rem',
          background: 'var(--gradient-hero)',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
