const {execSync} = require('child_process');
const r = (c,m)=> { try { return execSync(c,{timeout:m||30000,encoding:'utf-8'}); } catch(e) { return ''; } };
const sess = 'session';
const cuisine = '火锅';
const url = 'https://www.douyin.com/search/' + encodeURIComponent(cuisine + ' 美食') + '?type=general';
console.log('Open: ' + url);
r('opencli browser ' + sess + ' open "' + url + '" --window background');
r('opencli browser ' + sess + ' wait time 5');
console.log('Scrolling...');
r('opencli browser ' + sess + ' scroll down --amount 800');
r('opencli browser ' + sess + ' wait time 2');
r('opencli browser ' + sess + ' scroll down --amount 800');
console.log('Extracting...');
const raw = r('opencli browser ' + sess + ' extract');
if (raw && raw.length > 100) {
  const fs = require('fs');
  const p = require('path');
  const dir = p.join(__dirname, '..', 'data', 'hot-content', 'raw');
  fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(p.join(dir, 'douyin-test.txt'), raw, 'utf-8');
  console.log('Saved. Length:', raw.length);
  // parse
  const blocks = raw.split(/\n(?=\!\[)/);
  console.log('Blocks:', blocks.length);
  for (const b of blocks.slice(1, 4)) {
    const lines = b.split('\n').map(l=>l.trim()).filter(Boolean);
    let title = '';
    for (const l of lines) {
      if (l.length > 4 && !l.startsWith('![') && !l.startsWith('#') && !l.startsWith('[') && !l.startsWith('http') && !/^\d+:\d+$/.test(l) && !/^\d+/.test(l) && !l.startsWith('@')) {
        title += l + ' ';
      }
    }
    if (title.trim()) console.log('  ->', title.trim().slice(0, 80));
  }
} else {
  console.log('Extract empty or too short:', raw?.length || 0);
}
