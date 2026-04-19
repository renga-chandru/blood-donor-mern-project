import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Droplet, User, Mail, Phone, Lock, MapPin } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    bloodGroup: 'A+',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blood-500 focus:outline-none transition dark:bg-slate-800 dark:border-slate-700 dark:text-white";
  const iconClass = "absolute left-3 top-3 h-5 w-5 text-slate-400";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-blood-700 to-blood-500 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-2">
              <Droplet className="w-7 h-7" fill="white" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-blood-100 text-sm mt-1">Join the LifeDrops donor network</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className={iconClass} />
                    <input
                      type="text" required placeholder="John Doe"
                      className={inputClass}
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <input
                      type="tel" required placeholder="+91 9876543210"
                      className={inputClass}
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    type="email" required placeholder="you@example.com"
                    className={inputClass}
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Blood Group</label>
                  <div className="relative">
                    <Droplet className={iconClass} />
                    <select
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blood-500 focus:outline-none transition dark:bg-slate-800 dark:border-slate-700 dark:text-white appearance-none"
                      value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className={iconClass} />
                    <input
                      type="text" required placeholder="London, NY..."
                      className={inputClass}
                      value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input
                    type="password" required placeholder="Min. 6 characters"
                    className={inputClass}
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-blood-600 hover:bg-blood-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2 shadow-lg shadow-blood-500/20"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-slate-600 dark:text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blood-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
