import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight, ShieldCheck, Droplet } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden rounded-[64px] mt-2 shadow-[0_32px_64px_-16px_rgba(153,27,27,0.2)] mx-2">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#991b1b] via-[#dc2626] to-[#1e293b] animate-gradient-slow"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[140px] -mr-40 -mt-40 animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/30 rounded-full blur-[120px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 text-center px-8 max-w-6xl mx-auto space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white text-[13px] font-black tracking-[0.2em] uppercase shadow-2xl animate-in zoom-in duration-1000">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blood-400"></span>
            </div>
            Over 10,000 Donors Active Now
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl italic">
               Be a Hero, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-100 via-white to-blood-200">Save a Life.</span>
            </h1>
            <p className="text-xl md:text-2xl text-blood-50/90 max-w-4xl mx-auto font-bold leading-relaxed tracking-wide drop-shadow-lg">
              Every drop counts. Join the most trusted direct Peer-to-Peer blood network. Connect directly with donors and recipients in your city without intermediaries.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-6">
            {!user ? (
              <>
                <Link 
                  to="/register" 
                  className="group relative bg-white text-blood-800 px-16 py-6 rounded-[32px] font-black shadow-[0_20px_40px_-8px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-3 text-xl overflow-hidden"
                >
                  <span className="relative z-10">Join Us Now</span>
                  <ArrowUpRight className="w-7 h-7 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-16 py-6 rounded-[32px] font-black hover:bg-white/20 transition-all duration-300 active:scale-95 text-xl shadow-2xl"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-8">
                <Link 
                  to="/donate" 
                  className="group bg-[#dc2626] text-white px-16 py-6 rounded-[32px] font-black shadow-[0_20px_40px_-8px_rgba(220,38,38,0.4)] hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-3 text-xl border-2 border-blood-400/50"
                >
                  <Heart className="w-7 h-7 fill-current group-hover:scale-125 transition-transform" /> 
                  <span className="uppercase tracking-wider">Donate Blood Now</span>
                </Link>
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="bg-[#1e293b]/60 backdrop-blur-xl border-2 border-white/10 text-white px-16 py-6 rounded-[32px] font-black hover:bg-[#1e293b]/80 transition-all duration-300 active:scale-95 text-xl shadow-2xl"
                >
                  {user?.role === 'admin' ? 'Open Admin Portal' : 'Find Local Donors'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-800 tracking-tight italic uppercase">How to be a hero</h2>
          <div className="h-2 w-24 bg-blood-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Droplet, title: "1. Register", desc: "Fast signup with your blood group and location details.", bg: "bg-blood-50", color: "text-blood-600", shadow: "shadow-blood-100" },
            { icon: ShieldCheck, title: "2. Verification", desc: "Admin approves your details to keep the network secure and reliable.", bg: "bg-indigo-50", color: "text-indigo-600", shadow: "shadow-indigo-100" },
            { icon: Heart, title: "3. Direct Impact", desc: "Accept requests and share your contact flow with those in need.", bg: "bg-emerald-50", color: "text-emerald-600", shadow: "shadow-emerald-100" }
          ].map((f, i) => (
            <div key={i} className={`p-16 bg-white rounded-[56px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-50 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 text-center group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className={`relative z-10 w-24 h-24 rounded-[32px] ${f.bg} ${f.color} flex items-center justify-center mb-10 mx-auto transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-xl ${f.shadow}`}>
                <f.icon className="w-12 h-12" />
              </div>
              <h3 className="relative z-10 text-3xl font-black text-slate-800 mb-6 italic">{f.title}</h3>
              <p className="relative z-10 text-slate-500 font-bold leading-relaxed opacity-70 text-sm uppercase tracking-[0.15em] px-4">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
