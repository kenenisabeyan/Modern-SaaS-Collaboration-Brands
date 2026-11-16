import { Video, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-[#E4E8EE] bg-[#F5F7FA] pt-10 lg:pt-12 pb-6 lg:pb-8 px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10 text-[#1E2761] font-sans">
      <div className="max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8 sm:mb-10">
          
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div 
              onClick={() => { 
                onNavigate(localStorage.getItem('token') ? 'user-dashboard' : 'dashboard'); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
              className="flex items-center space-x-2.5 mb-3.5 cursor-pointer select-none group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#1E2761] border border-[#151A44] flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF5A36] border-2 border-[#F5F7FA] rounded-full animate-pulse"></span>
              </div>
              <span className="font-extrabold text-base tracking-wider text-[#1E2761] uppercase">
                WABISEMINAR
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 max-w-xs font-normal">
              Browser-native video meetings and interactive masterclasses with zero downloads and zero limits.
            </p>
            <div className="flex items-center space-x-2.5">
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-xs" title="Website">
                <Globe size={14} />
              </a>
              <a href="mailto:solutions@wabiseminar.com" className="w-8 h-8 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-xs" title="Email Us">
                <Mail size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-xs" title="Community">
                <MessageCircle size={14} />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-3 sm:mb-4 tracking-wide text-xs uppercase">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><button onClick={() => { onNavigate('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Home</button></li>
              <li><button onClick={() => { onNavigate('features'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Features</button></li>
              <li><button onClick={() => { onNavigate('pricing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Pricing</button></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-3 sm:mb-4 tracking-wide text-xs uppercase">Resources</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">How It Works</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">FAQ & Help</button></li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-3 sm:mb-4 tracking-wide text-xs uppercase">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">About WabiSeminar</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Contact Us</button></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-[#E4E8EE] pt-5 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
              <span className="text-xs font-medium text-[#1E2761]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
