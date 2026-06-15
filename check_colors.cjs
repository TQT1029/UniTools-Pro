const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const issues = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for bg-slate-800 or bg-slate-900 without dark:
    const bgMatch = line.match(/(?<!dark:)bg-slate-(800|900)\b/g);
    if (bgMatch) {
      issues.push(`[BG] ${file}:${i + 1}: ${line.trim()}`);
    }

    // Check for text-white, text-slate-100, text-slate-200 without dark:
    // EXCEPT when there is a colored background like bg-indigo, bg-rose, bg-emerald, bg-slate-400, etc.
    const textMatch = line.match(/(?<!dark:)text-(white|slate-100|slate-200)\b/g);
    if (textMatch) {
      if (!line.match(/bg-(indigo|rose|emerald|teal|purple|sky|pink|blue|amber|red|orange|cyan|slate-(400|500|600))/)) {
         issues.push(`[TEXT] ${file}:${i + 1}: ${line.trim()}`);
      }
    }
    
    // Check for border-slate-700, 800, 900 without dark:
    const borderMatch = line.match(/(?<!dark:)border-slate-(700|800|900)\b/g);
    if (borderMatch) {
       issues.push(`[BORDER] ${file}:${i + 1}: ${line.trim()}`);
    }
  }
}

fs.writeFileSync('check_colors.log', issues.join('\n'));
console.log('Found ' + issues.length + ' issues.');
