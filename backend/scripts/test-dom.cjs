const { execSync } = require('child_process');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  const output = execSync(`"${edge}" --headless=new --dump-dom "http://localhost:5174"`, { encoding: 'utf8', timeout: 10000 });
  console.log('DOM length:', output.length);
  const rootIndex = output.indexOf('id="root"');
  if (rootIndex !== -1) {
    console.log('Root content:', output.substring(rootIndex, rootIndex + 200));
  } else {
    console.log('No root element found!');
  }
} catch (e) {
  console.error('Exec error:', e.message);
  if (e.stdout) console.log('Stdout:', e.stdout);
}
