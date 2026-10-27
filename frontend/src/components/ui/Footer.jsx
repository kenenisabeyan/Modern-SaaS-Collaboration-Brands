import { Video, Globe, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/5 light:border-slate-200 bg-[#050816] light:bg-[#FAFAFA] pt-12 lg:pt-20 pb-6 lg:pb-10 px-4 sm:px-6 lg:px-8 xl:px-16 relative z-10 text-white light:text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Mobile-optimized grid: 1 column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {/* Brand Section - Full width on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Video className="text-white light:text-slate-900 w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-wide text-white light:text-slate-900">WabiSeminar</span>
            </div>
            <p className="text-[#94A3B8] light:text-slate-600 text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs">
              The modern platform for hosting engaging masterclasses, secure meetings, and instant webinars without limits.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 flex items-center justify-center text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 hover:border-white/20 light:hover:border-slate-300 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 flex items-center justify-center text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 hover:border-white/20 light:hover:border-slate-300 transition-all">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 flex items-center justify-center text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 hover:border-white/20 light:hover:border-slate-300 transition-all">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h4 className="font-semibold text-white light:text-slate-900 mb-4 sm:mb-6 tracking-wide text-base">Product</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-[#94A3B8] light:text-slate-600">
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">Features</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-indigo-400 transition-colors text-left">How it Works</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-indigo-400 transition-colors text-left">Pricing</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">Integrations</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">Changelog</button></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="font-semibold text-white light:text-slate-900 mb-4 sm:mb-6 tracking-wide text-base">Resources</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-[#94A3B8] light:text-slate-600">
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Documentation</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">API Reference</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Community</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">Blog</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Help Center</button></li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h4 className="font-semibold text-white light:text-slate-900 mb-4 sm:mb-6 tracking-wide text-base">Company</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-[#94A3B8] light:text-slate-600">
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">About</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors text-left">Careers</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Legal</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom - Mobile optimized */}
        <div className="border-t border-white/5 light:border-slate-200 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-[#94A3B8] light:text-slate-600">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs sm:text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
