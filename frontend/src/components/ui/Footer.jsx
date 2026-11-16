import { Video, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/10 bg-[#1E2761] pt-8 sm:pt-10 pb-5 sm:pb-6 px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 text-white font-sans overflow-hidden">
      <div className="max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8 mb-6 sm:mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div 
              onClick={() => { 
                onNavigate('dashboard'); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
              className="flex items-center space-x-2.5 mb-3.5 cursor-pointer select-none group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF5A36] border-2 border-[#1E2761] rounded-full animate-pulse"></span>
              </div>
              <span className="font-extrabold text-base tracking-wider text-white uppercase">
                COVIDEO
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 max-w-xs font-normal">
              Browser-native video meetings and interactive masterclasses with zero downloads and zero limits.
            </p>
            <div className="flex items-center space-x-2.5">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-200 hover:text-[#FF5A36] transition-all shadow-xs" title="Website">
                <Globe size={14} />
              </a>
              <a href="mailto:solutions@covideo.com" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-200 hover:text-[#FF5A36] transition-all shadow-xs" title="Email Us">
                <Mail size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-200 hover:text-[#FF5A36] transition-all shadow-xs" title="Community">
                <MessageCircle size={14} />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h4 className="font-bold text-white mb-3 sm:mb-4 tracking-wide text-xs uppercase">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><button onClick={() => { onNavigate('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Home</button></li>
              <li><button onClick={() => { onNavigate('features'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Features</button></li>
              <li><button onClick={() => { onNavigate('pricing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Pricing</button></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-bold text-white mb-3 sm:mb-4 tracking-wide text-xs uppercase">Resources</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">How It Works</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">FAQ & Help</button></li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h4 className="font-bold text-white mb-3 sm:mb-4 tracking-wide text-xs uppercase">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">About WabiSeminar</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Contact Us</button></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-4 sm:pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p className="text-center sm:text-left text-slate-400">&copy; {new Date().getFullYear()} WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
              <span className="text-xs font-medium text-slate-200">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
