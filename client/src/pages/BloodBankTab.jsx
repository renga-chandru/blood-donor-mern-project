import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Phone, Droplet, Building2 } from 'lucide-react';

export default function BloodBankTab({ city }) {
  const [banks, setBanks] = useState([]);
  const [searchCity, setSearchCity] = useState(city || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/blood-bank/all?city=${searchCity}`);
      setBanks(res.data);
    } catch (err) {
      console.error('Error fetching blood banks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBanks();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 italic text-slate-500 font-medium">
        Search for authorized blood banks and check availability in your area.
      </div>

      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Enter city to find blood banks..."
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-blood-500 transition-all font-bold text-slate-700"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="px-10 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blood-600 transition-all"
          >
            <Search size={20} />
            <span>Search</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold text-slate-400">Loading blood banks...</div>
        ) : banks.length > 0 ? (
          banks.map(bank => (
            <div key={bank._id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blood-50 rounded-2xl flex items-center justify-center text-blood-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800">{bank.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{bank.city}</p>
                  </div>
                </div>
                <a href={`tel:${bank.phone}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-blood-50 hover:text-blood-600 transition">
                  <Phone size={20} />
                </a>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <MapPin size={16} className="text-blood-500" /> {bank.address}
                </p>
                
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Stock Availability</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(bank.stock || {}).map(([type, count]) => (
                      <div key={type} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                        <span className="text-[10px] font-black text-slate-400">{type}</span>
                        <span className={`text-sm font-black ${count > 5 ? 'text-green-600' : count > 0 ? 'text-amber-600' : 'text-red-400'}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <Building2 size={48} className="opacity-20" />
            <p className="font-bold">No blood banks found in {searchCity || 'this area'}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
