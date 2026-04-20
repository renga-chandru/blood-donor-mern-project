import { useState, useEffect } from 'react';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { AlertCircle, Phone, MapPin, Droplet } from 'lucide-react';

export default function EmergencyRequests() {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ bloodGroup: 'A+', location: '', contact: '', urgency: 'high' });

  useEffect(() => {
    fetchRequests();
    
    // Set up Socket.io
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002');
    
    socket.on('newEmergencyRequest', (request) => {
      setRequests((prev) => [request, ...prev]);
      toast.error(`Urgent: ${request.bloodGroup} needed at ${request.location}!`, {
        icon: '🚨',
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#B91C1C',
          color: '#fff',
        },
      });
    });

    return () => socket.disconnect();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/request/all');
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to load emergency requests');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/request/create', formData);
      toast.success('Emergency request broadcasted successfully!');
      setFormData({ bloodGroup: 'A+', location: '', contact: '', urgency: 'high' });
      fetchRequests();
    } catch (error) {
      toast.error('Failed to post request. Ensure you are logged in.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-red-50 p-8 rounded-2xl border border-red-100 flex flex-col items-center text-center shadow-sm">
        <h2 className="text-3xl font-bold text-red-700 mb-2 flex items-center gap-2">
          <AlertCircle className="h-8 w-8" /> Emergency Broadcast
        </h2>
        <p className="text-red-600 max-w-2xl">
          Post an urgent requirement for blood here. This will immediately notify matching donors in our system via live alert.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 sticky top-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">New Urgent Request</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group Needed</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blood-500"
                value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} required
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location Details</label>
              <input type="text" placeholder="Hospital, City..." className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blood-500" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Details</label>
              <input type="text" placeholder="Phone Name/Number" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blood-500" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition flex justify-center items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Broadcast Urgent Need
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-bold text-slate-800">Live Active Requests</h3>
          {requests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full flex items-center gap-1 text-sm"><Droplet className="w-4 h-4"/> {req.bloodGroup}</span>
                  <span className="text-slate-500 text-sm">{new Date(req.createdAt).toLocaleString()}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400"/> {req.location}</h4>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <a href={`tel:${req.contact}`} className="flex-1 md:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-6 rounded-xl font-medium flex items-center gap-2 transition">
                  <Phone className="w-4 h-4"/> Call
                </a>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-slate-500">No active emergency requests.</p>}
        </div>
      </div>
    </div>
  );
}
