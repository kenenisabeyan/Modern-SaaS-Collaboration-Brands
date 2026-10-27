const fs = require('fs');
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

  // other specific hex colors
  content = content.replace(/bg-\[#160B2A\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#160B2A] light:bg-slate-100');
  content = content.replace(/bg-\[#160B2A\]\/50(?!\s+light:bg)/g, 'bg-[#160B2A]/50 light:bg-slate-100');
  content = content.replace(/bg-\[#1E113C\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#1E113C] light:bg-slate-100');
  content = content.replace(/bg-\[#0A241A\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#0A241A] light:bg-slate-100');
  content = content.replace(/bg-\[#331C0D\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#331C0D] light:bg-slate-100');

  // bg-slate-900 etc
  content = content.replace(/bg-slate-900(?!\/?[\w-]|\s+light:bg)/g, 'bg-slate-900 light:bg-slate-100');
  content = content.replace(/bg-slate-800(?!\/?[\w-]|\s+light:bg)/g, 'bg-slate-800 light:bg-slate-200');

  // bg-white/5 and bg-white/10
  content = content.replace(/bg-white\/5(?!\/?[\w-]|\s+light:bg)/g, 'bg-white/5 light:bg-slate-100');
  content = content.replace(/bg-white\/10(?!\/?[\w-]|\s+light:bg)/g, 'bg-white/10 light:bg-slate-200');
  content = content.replace(/hover:bg-white\/5(?!\/?[\w-]|\s+light:hover:bg)/g, 'hover:bg-white/5 light:hover:bg-slate-100');
  content = content.replace(/hover:bg-white\/10(?!\/?[\w-]|\s+light:hover:bg)/g, 'hover:bg-white/10 light:hover:bg-slate-200');

  // text colors
  content = content.replace(/text-slate-300(?!\/?[\w-]|\s+light:text)/g, 'text-slate-300 light:text-slate-600');
  content = content.replace(/text-slate-200(?!\/?[\w-]|\s+light:text)/g, 'text-slate-200 light:text-slate-700');
  content = content.replace(/text-gray-300(?!\/?[\w-]|\s+light:text)/g, 'text-gray-300 light:text-slate-600');
  content = content.replace(/text-gray-400(?!\/?[\w-]|\s+light:text)/g, 'text-gray-400 light:text-slate-500');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed additional dark styling in:', f);
  }
});
