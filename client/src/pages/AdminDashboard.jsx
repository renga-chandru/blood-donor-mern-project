import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, XCircle, Users, Heart, AlertCircle, 
  BarChart3, List, Clock, Droplet, Key, Copy, Eye, EyeOff
} from 'lucide-react';

export default function AdminDashboard() {
  const [donors, setDonors] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalDonors: 0, totalRequests: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('pending');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    fetchStats();
    fetchDonors();
    fetchUsers();
    fetchHistory();
    fetchFeedback();
  }, []);

  const handleResetPassword = async (userId, userName) => {
    const newPassword = window.prompt(`Enter new password for ${userName}:`, '123456');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put(`/user/reset-password/${userId}`, { newPassword });
      toast.success(`Password updated for ${userName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/donor/stats'); 
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await api.get('/donor/all');
      setDonors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/user/all');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/feedback/all');
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/request/all');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDonorStatus = async (id, action) => {
    try {
      await api.put(`/donor/${action}/${id}`);
      toast.success(`Donor ${action}ed successfully!`);
      fetchDonors();
      fetchStats();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'donors', label: 'Donor Apps', icon: Heart },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'history', label: 'Request Log', icon: List },
    { id: 'feedback', label: 'Feedback', icon: AlertCircle },
  ];

  const pendingDonors = donors.filter(d => d.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blood-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BarChart3 size={120} />
        </div>
        <h2 className="text-4xl font-black mb-2">Admin Control Center</h2>
        <p className="text-slate-400 font-medium max-w-xl">Monitor platform metrics, manage donor approvals, and oversee user communications.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white/50 shadow-sm overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition text-sm ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Approved Donors', value: stats.totalDonors || 0, icon: Heart, color: 'text-green-600', bg: 'bg-green-100' },
              { label: 'P2P Communications', value: history.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-slate-300 transition-all">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="text-xl font-black text-slate-800 mb-6">Pending Donor Applications ({pendingDonors})</h3>
             <div className="space-y-3">
                {donors.filter(d => d.status === 'pending').map(donor => (
                  <div key={donor._id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                     <div>
                        <p className="font-bold text-slate-800">{donor.name} <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 ml-2">{donor.city}</span></p>
                        <p className="text-xs text-slate-500 font-medium">Blood Group: <span className="text-blood-600 font-bold">{donor.bloodGroup}</span> · Applied on {new Date(donor.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleDonorStatus(donor._id, 'approve')} className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"><CheckCircle className="w-5 h-5"/></button>
                        <button onClick={() => handleDonorStatus(donor._id, 'reject')} className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"><XCircle className="w-5 h-5"/></button>
                     </div>
                  </div>
                ))}
                {pendingDonors === 0 && <p className="text-slate-400 text-center py-4">No pending donor applications.</p>}
             </div>
          </div>
        </div>
      )}

      {/* Donors Tab */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 capitalize">Donor Approvals</h3>
              <div className="flex gap-2">
                 {['pending', 'approved', 'rejected'].map(s => (
                   <button 
                     key={s} onClick={() => setFilter(s)}
                     className={`px-4 py-2 rounded-xl text-xs font-black transition ${filter === s ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
                   >
                     {s.toUpperCase()}
                   </button>
                 ))}
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="text-left bg-slate-50/50">
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Blood Group</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                       {filter === 'pending' && <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-medium">
                    {donors.filter(d => d.status === filter).map(donor => (
                      <tr key={donor._id}>
                         <td className="px-8 py-6">
                            <p className="font-bold text-slate-800">{donor.name}</p>
                            <p className="text-xs text-slate-400">{donor.phone}</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="bg-blood-100 text-blood-700 px-3 py-1 rounded-lg font-black">{donor.bloodGroup}</span>
                         </td>
                         <td className="px-8 py-6 text-slate-600">
                            {donor.city}
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                               donor.status === 'approved' ? 'bg-green-100 text-green-700' :
                               donor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                               'bg-yellow-100 text-yellow-700'
                            }`}>{donor.status.toUpperCase()}</span>
                         </td>
                         {filter === 'pending' && (
                           <td className="px-8 py-6">
                              <div className="flex gap-2">
                                 <button onClick={() => handleDonorStatus(donor._id, 'approve')} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md shadow-green-100 transition"><CheckCircle className="w-4 h-4"/></button>
                                 <button onClick={() => handleDonorStatus(donor._id, 'reject')} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md shadow-red-100 transition"><XCircle className="w-4 h-4"/></button>
                              </div>
                           </td>
                         )}
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">All Registered Users</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User Details</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-nowrap">Password</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Blood</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {users.map(u => (
                      <tr key={u._id}>
                         <td className="px-8 py-6">
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 group">
                               <span className="text-xs font-mono text-blood-600 font-bold bg-blood-50 px-2 py-0.5 rounded border border-blood-100 truncate max-w-[120px]">
                                  {visiblePasswords[u._id] ? u.password : '••••••••'}
                               </span>
                               <button 
                                  onClick={() => togglePasswordVisibility(u._id)}
                                  className="text-slate-400 hover:text-blood-600 transition"
                                  title={visiblePasswords[u._id] ? "Hide Password" : "Show Password"}
                               >
                                  {visiblePasswords[u._id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                               </button>
                               <button 
                                  onClick={() => copyToClipboard(u.password)}
                                  className="text-slate-400 hover:text-blood-600 transition"
                                  title="Copy Password"
                               >
                                  <Copy size={12}/>
                               </button>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="font-black text-blood-600">{u.bloodGroup}</span>
                         </td>
                         <td className="px-8 py-6">
                            {u.city}
                         </td>
                         <td className="px-8 py-6 text-xs text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-8 py-6">
                            <button 
                               onClick={() => handleResetPassword(u._id, u.name)}
                               className="mx-auto flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl font-bold transition text-xs"
                               title="Reset User Password"
                            >
                               <Key size={14}/>
                               <span>Reset Pass</span>
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Log Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">P2P Communication Log</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="text-left bg-slate-50/50">
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Interaction</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Blood</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-medium">
                    {history.map(item => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <span className="text-slate-800 font-bold">{item.userId?.name || 'Someone'}</span>
                               <span className="text-slate-400 text-xs text-nowrap">requested to</span>
                               <span className="text-blood-700 font-bold">{item.recipientId?.name || 'a Donor'}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 font-black text-blood-600">{item.bloodGroup}</td>
                         <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                               item.status === 'Approved' ? 'text-green-600' : 
                               item.status === 'Rejected' ? 'text-red-500' : 'text-yellow-600'
                            }`}>
                               {item.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : item.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3"/> }
                               {item.status.toUpperCase()}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                            {new Date(item.createdAt).toLocaleString()}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">User Feedback & Ratings</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="text-left bg-slate-50/50">
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rating</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Message</th>
                       <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {feedback.map(f => (
                      <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6 font-bold text-slate-800">{f.name}</td>
                         <td className="px-8 py-6">
                            <div className="flex gap-0.5 text-yellow-500 font-black">
                               {[...Array(f.rating)].map((_, i) => <Droplet key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                         </td>
                         <td className="px-8 py-6 italic text-slate-500">"{f.message}"</td>
                         <td className="px-8 py-6 text-xs text-slate-400">
                            {new Date(f.createdAt).toLocaleDateString()}
                         </td>
                      </tr>
                    ))}
                    {feedback.length === 0 && <tr><td colSpan="4" className="text-center py-10 opacity-40">No feedback submitted yet.</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
