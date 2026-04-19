import { Link, useNavigate } from 'react-router-dom';
import { Droplet, LogOut, Sun, Moon, Heart } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blood-700 dark:bg-slate-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center text">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Droplet className="h-6 w-6 text-blood-50" fill="currentColor" />
          <span>LifeDrops</span>
        </Link>
         <div className="flex items-center space-x-6">
          <Link to="/" className="hidden sm:block hover:text-blood-100 font-medium transition">Home</Link>
          
          {user && (
            <Link to="/donate" className="hidden sm:flex items-center gap-1 hover:text-blood-100 font-medium transition text-blood-100 border-l border-white/10 pl-4">
              <Heart className="w-4 h-4 fill-current" /> Donate
            </Link>
          )}

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-4">
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="hover:text-blood-100 font-medium transition">
                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-4">
              <Link to="/login" className="hover:text-blood-100 font-medium transition">Login</Link>
              <Link to="/register" className="bg-white text-blood-700 px-5 py-1.5 rounded-xl font-bold hover:bg-blood-50 transition">Join</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
