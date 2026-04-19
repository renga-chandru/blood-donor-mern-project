import { Award, Check, Download, Share2, X } from 'lucide-react';

export default function ImpactCard({ donorName, date, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] max-w-lg w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-blood-700 via-blood-600 to-blood-800 p-12 text-center text-white relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl -mt-32"></div>
          <div className="w-24 h-24 bg-white rounded-[32px] mx-auto mb-8 shadow-2xl flex items-center justify-center text-blood-600">
            <Award size={56} />
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">LIFE SAVER</h2>
          <p className="text-blood-100 font-bold uppercase tracking-widest text-xs">Certified Hero Badge</p>
        </div>

        <div className="p-12 text-center space-y-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-slate-800">{donorName}</h3>
            <p className="text-slate-500 font-medium px-8">This certificate is awarded in recognition of your selfless act of blood donation.</p>
          </div>

          <div className="flex items-center justify-center gap-4 py-6 border-y border-slate-50">
             <div className="text-left">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Donated On</p>
                <p className="text-lg font-black text-slate-800">{new Date(date).toLocaleDateString()}</p>
             </div>
             <div className="h-10 w-px bg-slate-100"></div>
             <div className="text-left">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-1 text-green-600">
                    <Check size={18}/>
                    <span className="text-lg font-black uppercase italic">SUCCESS</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
               className="h-14 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blood-600 transition-all active:scale-95"
               onClick={() => window.print()}
             >
                <Download size={18} />
                <span>SAVE</span>
             </button>
             <button className="h-14 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95">
                <Share2 size={18} />
                <span>SHARE</span>
             </button>
          </div>
          
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic pt-4">Official LifeDrops Gratitude Record · ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
