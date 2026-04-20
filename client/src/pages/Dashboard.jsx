import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  User, Heart, Clock, CheckCircle, XCircle, AlertCircle, List,
  ArrowDownLeft, ArrowUpRight, Search, MapPin, Droplet, UserPlus,
  MessageSquare, Phone, Info, Bell, Shield, Award, Map, Check, Copy
} from 'lucide-react';
import { io } from 'socket.io-client';
import BloodBankTab from './BloodBankTab';
import ImpactCard from '../components/ImpactCard';

import { useAuth } from '../utils/AuthContext';

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002');

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useState({ bloodGroup: 'A+', city: '' });
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [feedback, setFeedback] = useState({ message: '', rating: 5 });
  const [sosAlert, setSosAlert] = useState(null);
  const [myDonorProfile, setMyDonorProfile] = useState(null);
  const [showHeroCard, setShowHeroCard] = useState(null); // stores { donorName, date }

  useEffect(() => {
    fetchMyRequests();
    fetchIncomingRequests();
    fetchMyDonorProfile();

    socket.on('requestStatusUpdated', (data) => {
      toast.success('A blood request status was updated!');
      fetchMyRequests();
      fetchIncomingRequests();
      fetchMyDonorProfile();
    });

    socket.on('sosAlert', (data) => {
      // Only show alert for people in the same city
      if (user?.city?.toLowerCase() === data.city?.toLowerCase()) {
        setSosAlert(data);
        toast.error(`EMERGENCY: ${data.bloodGroup} needed in ${data.city}!`, { duration: 10000 });
      }
    });

    return () => {
      socket.off('requestStatusUpdated');
      socket.off('sosAlert');
    };
  }, [user]);

  const fetchMyDonorProfile = async () => {
    try {
      const res = await api.get('/donor/me');
      setMyDonorProfile(res.data);
    } catch (err) {
      console.error('Not a donor or error fetching donor profile');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/request/my');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await api.get('/request/incoming');
      setIncomingRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await api.get('/donor/search', { params: searchParams });
      setSearchResults(res.data);
      if (res.data.length === 0) toast.error("No approved donors found for this criteria.");
    } catch (err) {
      toast.error("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleP2PRequest = async (donorUserId, donorName, bloodGroup) => {
    if (!donorUserId) {
      toast.error("Error: Donor has no associated user ID");
      return;
    }
    try {
      await api.post('/request/create', {
        bloodGroup,
        requestType: 'Receive',
        urgency: 'high',
        quantity: 1,
        recipientId: donorUserId // CRITICAL: Use User ID, not Donor ID
      });
      toast.success(`Request sent to ${donorName}!`);
      fetchMyRequests();
      setActiveTab('requests');
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  const handleResponse = async (id, status) => {
    try {
      await api.put(`/request/p2p-status/${id}`, { status });
      toast.success(`Request ${status === 'Approved' ? 'Accepted' : 'Declined'}`);
      fetchIncomingRequests();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleComplete = async (reqId, donorName) => {
    try {
      await api.put(`/request/complete/${reqId}`);
      toast.success('Amazing! Life Saved! ❤️');
      setShowHeroCard({ donorName, date: new Date() });
      fetchIncomingRequests();
    } catch (err) {
      toast.error('Failed to complete request');
    }
  };

  const handleSOS = async () => {
    if (!window.confirm(`Trigger an emergency SOS for ${searchParams.bloodGroup} in ${user?.city}? This will alert all local donors!`)) {
      return;
    }
    try {
      await api.post('/request/sos', {
        bloodGroup: searchParams.bloodGroup,
        city: user?.city,
        message: `CRITICAL: ${searchParams.bloodGroup} blood required immediately at ${user?.city}!`
      });
      toast.success('Emergency SOS broadcasted!');
    } catch (err) {
      toast.error('Failed to trigger SOS');
    }
  };

  const getBadge = (count) => {
    if (count >= 10) return { label: 'Gold Saver', color: 'text-amber-500', bg: 'bg-amber-100', icon: Award };
    if (count >= 5) return { label: 'Silver Hero', color: 'text-slate-400', bg: 'bg-slate-100', icon: Shield };
    if (count >= 2) return { label: 'Bronze Donor', color: 'text-orange-500', bg: 'bg-orange-100', icon: Award };
    return { label: 'New Donor', color: 'text-blood-500', bg: 'bg-blood-50', icon: Droplet };
  };

  const calculateEligibility = () => {
    if (!myDonorProfile?.lastDonatedDate) return { percent: 100, days: 0 };
    const lastDate = new Date(myDonorProfile.lastDonatedDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 90);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { percent: 100, days: 0 };
    const percent = Math.max(0, Math.min(100, ((90 - diffDays) / 90) * 100));
    return { percent, days: diffDays };
  };

  const submitFeedback = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.post('/feedback/submit', { ...feedback, name: user?.name });
      toast.success('Thank you for your feedback!');
      setFeedback({ message: '', rating: 5 });
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const tabs = [
    { id: 'search', label: 'Find Donors', icon: Search },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'banks', label: 'Blood Banks', icon: Map },
    { id: 'requests', label: 'Sent Requests', icon: ArrowUpRight },
    { id: 'incoming', label: 'Incoming', icon: ArrowDownLeft, count: (incomingRequests || []).filter(r => r.status === 'Pending').length },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* SOS ALERT BANNER */}
      {sosAlert && (
        <div className="bg-red-600 text-white p-6 rounded-[32px] shadow-2xl animate-pulse flex justify-between items-center border-4 border-white/20">
          <div className="flex items-center gap-6">
            <div className="bg-white text-red-600 p-4 rounded-2xl">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Emergency SOS Alert</h3>
              <p className="font-bold text-red-100">{sosAlert.message}</p>
              {sosAlert.senderPhone && (
                <a 
                  href={`tel:${sosAlert.senderPhone}`}
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-white text-red-600 rounded-xl font-black text-xs hover:bg-red-50 transition-colors"
                >
                  <Phone size={14} /> CALL {sosAlert.senderName?.toUpperCase()}: {sosAlert.senderPhone}
                </a>
              )}
            </div>
          </div>
          <button 
            onClick={() => setSosAlert(null)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-black text-sm transition"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blood-800 to-blood-600 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Droplet size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2">Welcome, {user?.name}!</h2>
          <p className="text-blood-100 font-bold opacity-80 max-w-md">Connect with life-saving donors in our secure P2P network.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/70 backdrop-blur-xl p-2 rounded-3xl border border-white/50 shadow-xl max-w-5xl mx-auto sticky top-4 z-50 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-blood-600 text-white shadow-lg shadow-blood-200 scale-105'
                  : 'text-slate-600 hover:bg-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="bg-white text-blood-600 px-2 py-0.5 rounded-full text-[10px]">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="p-2 bg-blood-50 rounded-xl"><Search size={24} className="text-blood-600" /></div>
              Emergency Donor Search
            </h3>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                <select
                  className="w-full h-14 px-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blood-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  value={searchParams.bloodGroup} onChange={(e) => setSearchParams({ ...searchParams, bloodGroup: e.target.value })}
                >
                  {['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg === 'All' ? 'All Groups' : bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text" placeholder="e.g. Tirunelveli"
                    className="w-full h-14 pl-12 pr-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blood-500 transition-all font-bold text-slate-700"
                    value={searchParams.city} onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-end gap-3 col-span-1 md:col-span-3 lg:col-span-1">
                <button
                  type="submit" disabled={searching}
                  className="flex-1 h-14 bg-blood-600 hover:bg-blood-700 text-white rounded-2xl font-black shadow-xl shadow-blood-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {searching ? 'Finding...' : 'Search Donors'}
                </button>
                <button
                  type="button"
                  onClick={handleSOS}
                  className="h-14 px-5 bg-red-100 text-red-600 rounded-2xl font-black hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  title="Trigger Emergency SOS"
                >
                  <Bell className="w-5 h-5 animate-bounce" />
                  <span className="hidden md:inline">SOS</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map(donor => (
              <div key={donor._id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:border-blood-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blood-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-blood-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blood-100 transition-transform group-hover:rotate-6">
                      {donor.bloodGroup}
                    </div>
                    <div className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle size={12} /> Approved
                    </div>
                  </div>
                  <div className="flex flex-col mb-6">
                    <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                       {donor.name}
                       {getBadge(donor.donationsCount) && (
                         <div className={`p-1 rounded-lg ${getBadge(donor.donationsCount).bg}`} title={getBadge(donor.donationsCount).label}>
                           <Award className={`w-4 h-4 ${getBadge(donor.donationsCount).color}`} />
                         </div>
                       )}
                    </h4>
                    <p className="text-slate-500 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest opacity-60">
                      <MapPin size={14} className="text-blood-500" /> {donor.city}
                    </p>
                  </div>
                  <button
                    onClick={() => handleP2PRequest(donor.userId, donor.name, donor.bloodGroup)}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-extrabold flex items-center justify-center gap-3 hover:bg-blood-600 transition-all shadow-xl shadow-slate-100"
                  >
                    <UserPlus size={20} /> Request Blood
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blood-50 rounded-xl"><ArrowUpRight size={24} className="text-blood-600" /></div>
                Sent Requests & Status
              </h3>
              <button
                onClick={fetchMyRequests}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-blood-50 group text-slate-600 hover:text-blood-600 rounded-2xl font-black transition-all text-xs"
              >
                <Clock size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Refresh List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {requests.map(req => (
                <div key={req._id} className={`p-8 rounded-[48px] border-2 transition-all relative ${req.status === 'Approved' ? 'border-green-400 bg-green-50/5' : 'border-slate-50 bg-white shadow-sm'
                  }`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'Approved' ? 'bg-green-500 text-white shadow-lg shadow-green-200' :
                        req.status === 'Rejected' ? 'bg-red-500 text-white' :
                          'bg-yellow-400 text-white'
                      }`}>
                      {req.status === 'Approved' ? 'Accepted' : req.status}
                    </div>
                    <span className="w-12 h-12 flex items-center justify-center bg-blood-50 text-blood-600 rounded-2xl font-black text-xl">{req.bloodGroup}</span>
                  </div>

                  <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">Donor Name</p>
                    <h4 className="text-3xl font-black text-slate-800">{req.recipientId?.name || 'Someone Special'}</h4>
                    {req.status === 'Approved' && <p className="text-green-600 font-bold text-sm mt-1 flex items-center gap-1.5"><CheckCircle size={14} /> Request Accepted by Donor</p>}
                  </div>

                  {req.status === 'Approved' && req.recipientId ? (
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 space-y-5 border border-slate-100">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                          <Phone className="text-blood-600" size={20} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                            <span className="text-lg font-black text-slate-800">{req.recipientId.phone || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                          <MessageSquare className="text-blood-600" size={20} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                            <span className="text-sm font-black text-slate-800">{req.recipientId.email || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                          <MapPin className="text-blood-600" size={20} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                            <span className="text-lg font-black text-slate-800">{req.recipientId.city || 'Anywhere'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `tel:${req.recipientId.phone}`}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blood-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Phone size={18} /> CALL DONOR
                      </button>
                    </div>
                  ) : req.status === 'Pending' ? (
                    <div className="py-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                      <Clock size={32} className="text-slate-200 mb-2 animate-pulse" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Awaiting Donor Reply</p>
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-red-700 font-bold text-sm text-center">
                      Donor is currently unable to assist.
                    </div>
                  )}

                  <p className="text-[10px] text-slate-300 font-bold mt-8 italic text-right">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {requests.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-bold">No sent requests to show.</div>}
            </div>
          </div>
        </div>
      )}

      {/* INCOMING REQUESTS TAB */}
      {activeTab === 'incoming' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3">
              <div className="p-2 bg-blood-50 rounded-xl"><ArrowDownLeft size={24} className="text-blood-600" /></div>
              Requests For You
            </h3>
            <div className="space-y-6">
              {incomingRequests.map(req => (
                <div key={req._id} className="p-8 rounded-[40px] bg-slate-50 border border-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-white rounded-3xl flex flex-col items-center justify-center shadow-inner border border-slate-100 group-hover:bg-blood-600 group-hover:text-white transition-colors duration-500">
                      <span className="text-2xl font-black">{req.bloodGroup}</span>
                      <span className="text-[8px] font-black uppercase opacity-60">Needed</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">{req.userId?.name}</h4>
                      <p className="text-blood-600 font-black uppercase text-[10px] tracking-widest mt-1">"Are you available to donate?"</p>
                      <p className="text-[10px] text-slate-300 font-bold mt-2">Received: {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {req.status === 'Pending' ? (
                    <div className="flex gap-4 w-full md:w-auto">
                      <button onClick={() => handleResponse(req._id, 'Approved')} className="flex-1 md:flex-none h-16 px-10 bg-green-500 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:scale-105 transition active:scale-95">ACCEPT</button>
                      <button onClick={() => handleResponse(req._id, 'Rejected')} className="flex-1 md:flex-none h-16 px-10 bg-slate-200 text-slate-600 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all active:scale-95">DECLINE</button>
                    </div>
                  ) : req.status === 'Approved' ? (
                    <button 
                      onClick={() => handleComplete(req._id, user.name)}
                      className="px-10 py-5 bg-blood-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-blood-100 flex items-center gap-2"
                    >
                      <Award size={18} /> MARK AS COMPLETED
                    </button>
                  ) : (
                    <div className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest uppercase ${
                        req.status === 'Completed' ? 'bg-indigo-100 text-indigo-700' : 
                        req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      Status: {req.status}
                    </div>
                  )}
                </div>
              ))}
              {incomingRequests.length === 0 && <div className="py-20 text-center text-slate-300 font-bold">No incoming requests at the moment.</div>}
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100 text-center">
            <h3 className="text-3xl font-black text-slate-800 mb-10">Rate Your Experience</h3>
            <form onSubmit={submitFeedback} className="space-y-8 text-left">
              <div className="flex justify-center gap-4 mb-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setFeedback({ ...feedback, rating: star })} className={`text-4xl transition-all ${feedback.rating >= star ? 'text-blood-600' : 'text-slate-200'}`}>
                    <Droplet size={40} className={feedback.rating >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
              <textarea
                required placeholder="How was the P2P interaction?"
                className="w-full h-32 p-6 rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-blood-500/10 font-bold text-slate-700 resize-none"
                value={feedback.message} onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              />
              <button type="submit" className="w-full h-16 bg-blood-600 text-white rounded-2xl font-black text-lg hover:bg-blood-700 shadow-xl shadow-blood-100 transition-all">Submit Feedback</button>
            </form>
          </div>
        </div>
      )}

      {/* BLOOD BANKS TAB */}
      {activeTab === 'banks' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <BloodBankTab city={user?.city} />
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="w-32 h-32 bg-slate-100 rounded-[48px] mx-auto md:mx-0 flex items-center justify-center text-5xl font-black text-slate-400">{user?.name?.charAt(0)}</div>
                <h3 className="text-4xl font-black text-slate-800">{user?.name}</h3>
                <p className="text-blood-600 font-extrabold uppercase tracking-widest">{user?.bloodGroup} Type</p>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-blood-600 rounded-2xl flex items-center justify-center text-white">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-800">{myDonorProfile?.donationsCount || 0}</h4>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Lives Saved</p>
                  {getBadge(myDonorProfile?.donationsCount || 0) && (
                    <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded ${getBadge(myDonorProfile?.donationsCount || 0).bg} ${getBadge(myDonorProfile?.donationsCount || 0).color}`}>
                      {getBadge(myDonorProfile?.donationsCount || 0).label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
               <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-700 uppercase tracking-widest text-sm">Donation Eligibility</h4>
                  <span className={`text-xs font-black px-3 py-1 rounded-xl ${calculateEligibility().days === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {calculateEligibility().days === 0 ? 'READY TO SAVE A LIFE' : `${calculateEligibility().days} Days Left`}
                  </span>
               </div>
               <div className="h-6 bg-white rounded-full p-1 border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${calculateEligibility().days === 0 ? 'bg-green-500' : 'bg-blood-500 animate-pulse'}`}
                    style={{ width: `${calculateEligibility().percent}%` }}
                  ></div>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Eligibility resets 90 days after each donation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email Address</p>
                <p className="text-xl font-black text-slate-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Location</p>
                <p className="text-xl font-black text-slate-800">{user?.city}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHeroCard && (
        <ImpactCard 
          donorName={showHeroCard.donorName} 
          date={showHeroCard.date} 
          onClose={() => setShowHeroCard(null)} 
        />
      )}
    </div>
  );
}
