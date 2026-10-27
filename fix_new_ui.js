const fs = require('fs');
if(fs.existsSync('frontend/src/components/newUI.jsx')) {
  let content = fs.readFileSync('frontend/src/components/newUI.jsx', 'utf8');

  // First replace the explicit dark: variants backwards
  content = content.replace(/text-slate-900 dark:text-white/g, 'text-white light:text-slate-900');
  content = content.replace(/bg-white dark:bg-\[#0A0F24\]/g, 'bg-[#0A0F24] light:bg-white');
  content = content.replace(/shadow-xl dark:shadow-none\/80/g, 'shadow-none/80 light:shadow-xl');
  content = content.replace(/shadow-xl dark:shadow-none\/95/g, 'shadow-none/95 light:shadow-xl');
  content = content.replace(/border-slate-200 dark:border-white\/10/g, 'border-white/10 light:border-slate-200');
  content = content.replace(/bg-slate-100 dark:bg-white\/5/g, 'bg-white/5 light:bg-slate-100');
  content = content.replace(/hover:bg-slate-200 dark:bg-white\/10/g, 'hover:bg-white/10 light:hover:bg-slate-200');
  content = content.replace(/text-indigo-600 dark:text-indigo-400/g, 'text-indigo-400 light:text-indigo-600');
  content = content.replace(/text-blue-600 dark:text-blue-400/g, 'text-blue-400 light:text-blue-600');
  content = content.replace(/border-indigo-200 dark:border-indigo-500\/30/g, 'border-indigo-500/30 light:border-indigo-200');
  content = content.replace(/border-slate-100 dark:border-white\/5/g, 'border-white/5 light:border-slate-100');
  content = content.replace(/hover:border-slate-200 dark:border-white\/10/g, 'hover:border-white/10 light:hover:border-slate-200');
  content = content.replace(/text-slate-200/g, 'text-slate-200 light:text-slate-700');

  // Then add light: variants to the main UI
  content = content.replace(/bg-\[#050816\](?![\w/])/g, 'bg-[#050816] light:bg-slate-50');
  content = content.replace(/bg-\[#0A0F24\]\/80/g, 'bg-[#0A0F24]/80 light:bg-white/90');
  content = content.replace(/bg-\[#0A0F24\]\/40/g, 'bg-[#0A0F24]/40 light:bg-white/60');
  content = content.replace(/bg-\[#0A0F24\]\/90/g, 'bg-[#0A0F24]/90 light:bg-white/90');
  content = content.replace(/bg-\[#050816\]\/90/g, 'bg-[#050816]/90 light:bg-slate-50/90');

  content = content.replace(/text-white(?![/\w-])/g, 'text-white light:text-slate-900');
  // Because we might have replaced text-white that already had light:, we fix duplicates:
  content = content.replace(/text-white light:text-slate-900 light:text-slate-900/g, 'text-white light:text-slate-900');

  content = content.replace(/text-slate-400/g, 'text-slate-400 light:text-slate-500');
  content = content.replace(/border-white\/10/g, 'border-white/10 light:border-slate-200');

  fs.writeFileSync('frontend/src/components/newUI.jsx', content);
  console.log('Fixed newUI.jsx styling.');
}
