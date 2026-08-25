import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';

export default function AppLayout() {
  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr_auto] min-h-screen md:grid-cols-[16rem_1fr] md:grid-rows-[auto_1fr] bg-bg text-text pb-16 md:pb-0">
      <Sidebar />
      <Header className="md:col-start-2 md:row-start-1" />
      <main className="p-4 md:p-6 min-w-0 overflow-x-hidden md:col-start-2 md:row-start-2" role="main" aria-labelledby="page-title">
        <Outlet />
      </main>
    </div>
  );
}
