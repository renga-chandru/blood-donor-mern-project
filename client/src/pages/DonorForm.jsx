import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Heart, User, Droplet, Phone, MapPin, FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export default function DonorForm() {
  const { user } = useAuth();
  const [existingDonor, setExistingDonor] = useState(null);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bloodGroup: user?.bloodGroup || '',
    phone: user?.phone || '',
    address: '',
    city: user?.city || '',
    lastDonatedDate: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/donor/me');
        if (res.data) {
          setExistingDonor(res.data);
        }
      } catch (err) {
        // 404 is fine, means no donor profile yet
        console.log("No donor profile found yet");
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, []);

  const handle = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/donor/add', formData);
      toast.success('Your Donor Application has been submitted!', {
          icon: '🦸‍♂️',
          duration: 5000
      });
      // Refresh to show status card
      const res = await api.get('/donor/me');
      setExistingDonor(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const inputClass = "w-full px-5 py-3 border-2 border-slate-50 bg-slate-50 rounded-2xl focus:outline-none focus:border-blood-500 focus:bg-white transition-all font-bold text-slate-700";

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Checking Hero Status...</p>
      </div>
    );
  }

  // STATUS VIEW (If donor already exists)
  if (existingDonor) {
      return (
        <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in duration-500">
           <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100">
              <div className={`p-10 text-center text-white ${
                  existingDonor.status === 'approved' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                  existingDonor.status === 'rejected' ? 'bg-gradient-to-br from-red-600 to-red-400' :
                  'bg-gradient-to-br from-amber-500 to-amber-400'
              }`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-4">
                      {existingDonor.status === 'approved' ? <CheckCircle className="w-10 h-10" /> :
                       existingDonor.status === 'rejected' ? <XCircle className="w-10 h-10" /> :
                       <Clock className="w-10 h-10 animate-spin-slow" />}
                  </div>
                  <h2 className="text-3xl font-black mb-1 italic uppercase tracking-tight">
                      {existingDonor.status === 'approved' ? 'Active Blood Hero' : 
                       existingDonor.status === 'rejected' ? 'Application Declined' :
                       'Hero Verification Pending'}
                  </h2>
                  <p className="text-white/80 font-bold opacity-90">
                      {existingDonor.status === 'approved' ? 'You are part of our life-saving network.' :
                       existingDonor.status === 'rejected' ? 'Please contact admin for more details.' :
                       'Our team is reviewing your details to ensure safety.'}
                  </p>
              </div>

              <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6 text-center">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                          <p className="text-3xl font-black text-blood-600">{existingDonor.bloodGroup}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-xl font-black text-slate-700">{existingDonor.city}</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                          <span className="text-slate-500 font-bold text-sm">Full Name</span>
                          <span className="text-slate-800 font-black">{existingDonor.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                          <span className="text-slate-500 font-bold text-sm">Contact Number</span>
                          <span className="text-slate-800 font-black">{existingDonor.phone}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl">
                          <span className="text-slate-500 font-bold text-sm">Registration Date</span>
                          <span className="text-slate-800 font-black">{new Date(existingDonor.createdAt).toLocaleDateString()}</span>
                      </div>
                  </div>

                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black hover:bg-slate-800 transition shadow-xl"
                  >
                      Go to Dashboard
                  </button>
              </div>
           </div>
        </div>
      );
  }

  // FORM VIEW (If no donor exists)
  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blood-800 to-blood-600 p-12 rounded-[48px] text-white shadow-2xl mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white shadow-xl rounded-3xl mb-6 scale-110 rotate-3 transition-transform hover:rotate-0">
            <Heart className="w-10 h-10 text-blood-600 fill-blood-600" />
          </div>
          <h1 className="text-4xl font-black mb-3 italic">Be a Hero, Save Lives</h1>
          <p className="text-blood-100 font-bold opacity-80 max-w-md mx-auto">Fill out your donor details. Once approved by our admin, you'll be part of the life-saving network.</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</span>
              </label>
              <input required type="text" placeholder="John Doe" className={inputClass}
                value={formData.name} onChange={handle('name')} />
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2"><Droplet className="w-4 h-4 text-blood-500" /> Blood Group</span>
              </label>
              <select required className={inputClass}
                value={formData.bloodGroup} onChange={handle('bloodGroup')}>
                <option value="">Select Group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</span>
              </label>
              <input required type="tel" placeholder="+91 9876543210" className={inputClass}
                value={formData.phone} onChange={handle('phone')} />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> City / Location</span>
              </label>
              <input required type="text" placeholder="e.g. Tirunelveli" className={inputClass}
                value={formData.city} onChange={handle('city')} />
            </div>

            {/* Last Donated Date */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Last Donation Date</span>
              </label>
              <input type="date" className={inputClass}
                value={formData.lastDonatedDate} onChange={handle('lastDonatedDate')}
                max={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Residential Address</span>
            </label>
            <textarea required rows={3} placeholder="Full address for internal record..." className={`${inputClass} resize-none`}
              value={formData.address} onChange={handle('address')} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-slate-900 hover:bg-blood-600 text-white rounded-[32px] font-black transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-xl shadow-slate-100 hover:shadow-blood-100 hover:-translate-y-1 active:scale-95"
          >
            <Heart className="w-6 h-6 fill-current" />
            {loading ? 'Submitting Application...' : 'Register as a Blood Hero'}
          </button>
        </form>
      </div>
    </div>
  );
}
