const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src/components');
files.push('frontend/src/App.jsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // For bg-[#050816] (very dark, usually page background)
  content = content.replace(/bg-\[#050816\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#050816] light:bg-slate-50');
  content = content.replace(/bg-\[#050816\]\/80(?!\s+light:bg)/g, 'bg-[#050816]/80 light:bg-slate-50/80');
  content = content.replace(/bg-\[#050816\]\/90(?!\s+light:bg)/g, 'bg-[#050816]/90 light:bg-slate-50/90');
  content = content.replace(/bg-\[#050816\]\/60(?!\s+light:bg)/g, 'bg-[#050816]/60 light:bg-slate-50/60');
  
  // For bg-[#0A0F24] (slightly lighter dark, usually cards)
  content = content.replace(/bg-\[#0A0F24\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#0A0F24] light:bg-white');
  content = content.replace(/bg-\[#0A0F24\]\/80(?!\s+light:bg)/g, 'bg-[#0A0F24]/80 light:bg-white/90');
  content = content.replace(/bg-\[#0A0F24\]\/90(?!\s+light:bg)/g, 'bg-[#0A0F24]/90 light:bg-white/90');
  content = content.replace(/bg-\[#0A0F24\]\/60(?!\s+light:bg)/g, 'bg-[#0A0F24]/60 light:bg-white');
  content = content.replace(/bg-\[#0A0F24\]\/40(?!\s+light:bg)/g, 'bg-[#0A0F24]/40 light:bg-white/60');

  // Also text-white needs to change to text-slate-900 in light mode if not already there
  // This is riskier so I'll only do it for text-white where light:text is missing
  content = content.replace(/text-white(?!\/?[\w-]|\s+light:text)/g, 'text-white light:text-slate-900');
  
  // Same for text-[#94A3B8] -> light:text-slate-500
  content = content.replace(/text-\[#94A3B8\](?!\/?[\w-]|\s+light:text)/g, 'text-[#94A3B8] light:text-slate-500');

  // Also replace any remaining Tailwind dark: prefixes that were used improperly
  content = content.replace(/dark:bg-\[#0A0F24\]/g, 'bg-[#0A0F24] light:bg-white');
  content = content.replace(/dark:text-white/g, 'text-white light:text-slate-900');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed backgrounds in:', f);
  }
});
