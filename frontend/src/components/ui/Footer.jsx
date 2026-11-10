import { Video, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-[#E4E8EE] bg-[#F5F7FA] pt-14 lg:pt-20 pb-8 lg:pb-12 px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10 text-[#1E2761] font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div 
              onClick={() => { onNavigate('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center space-x-3 mb-5 cursor-pointer select-none group"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#1E2761] border border-[#151A44] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Video className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#FF5A36] border-2 border-[#F5F7FA] rounded-full animate-pulse"></span>
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-[#1E2761] uppercase">
                WABISEMINAR
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xs">
              The modern platform for hosting engaging masterclasses, secure meetings, and instant webinars without limits.
            </p>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-sm">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-sm">
                <Mail size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#E4E8EE] flex items-center justify-center text-[#1E2761] hover:text-[#FF5A36] hover:bg-slate-50 transition-all shadow-sm">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-4 sm:mb-6 tracking-wide text-sm uppercase">Product</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><button onClick={() => onNavigate('features')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Features</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">How It Works</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Pricing</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Instant Meetings</button></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-4 sm:mb-6 tracking-wide text-sm uppercase">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">FAQ & Help Center</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Masterclass Guide</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Community Standards</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Security Overview</button></li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h4 className="font-bold text-[#1E2761] mb-4 sm:mb-6 tracking-wide text-sm uppercase">Company</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><button onClick={() => onNavigate('features')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">About WabiSeminar</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Careers</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-[#FF5A36] transition-colors text-left cursor-pointer">Privacy & Terms</button></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-[#E4E8EE] pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-500">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium text-[#1E2761]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
