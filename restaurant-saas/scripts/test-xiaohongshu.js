const {execSync} = require('child_process');
const r = (c,m)=> { try { return execSync(c,{timeout:m||30000,encoding:'utf-8'}); } catch(e) { return ''; } };
const sess = 'session';
const url = 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent('火锅 美食') + '&sort=general';
console.log('Open xiaohongshu...');
r('opencli browser ' + sess + ' open "' + url + '" --window background');
r('opencli browser ' + sess + ' wait time 5');
console.log('Getting page state...');
const state = r('opencli browser ' + sess + ' state');
if (state) {
  // Find all note links and titles
  const lines = state.split('\n').filter(l => l.includes('note') || l.includes('title') || l.includes('search'));
  console.log('Relevant lines:', lines.slice(0,10).join('\n'));
}
console.log('Extract...');
const raw = r('opencli browser ' + sess + ' extract');
if (raw && raw.length > 200) {
  // Check for note titles
  const lines = raw.split('\n').filter(l => l.trim() && l.length > 5 && !l.startsWith('![') && !l.startsWith('http') && !l.startsWith('[') && !l.startsWith('#'));
  console.log('Text lines:', lines.length, lines.slice(0,20).join('\n'));
} else console.log('Short extract:', raw?.length);
