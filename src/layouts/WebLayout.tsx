import { Outlet } from 'react-router-dom';
import Navbar from '../components/web/Navbar';
import Footer from '../components/web/Footer';

export default function WebLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
