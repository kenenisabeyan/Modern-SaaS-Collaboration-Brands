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

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Gradients to replace
  content = content.replace(/from-\[#0A0F24\](?!\/?[\w-]|\s+light:from)/g, 'from-[#0A0F24] light:from-white');
  content = content.replace(/to-\[#0A0F24\](?!\/?[\w-]|\s+light:to)/g, 'to-[#0A0F24] light:to-white');
  
  content = content.replace(/from-\[#160B2A\](?!\/?[\w-]|\s+light:from)/g, 'from-[#160B2A] light:from-slate-100');
  content = content.replace(/to-\[#160B2A\](?!\/?[\w-]|\s+light:to)/g, 'to-[#160B2A] light:to-slate-100');
  
  content = content.replace(/from-\[#050816\](?!\/?[\w-]|\s+light:from)/g, 'from-[#050816] light:from-slate-50');
  content = content.replace(/to-\[#050816\](?!\/?[\w-]|\s+light:to)/g, 'to-[#050816] light:to-slate-50');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed gradients in:', f);
  }
});
