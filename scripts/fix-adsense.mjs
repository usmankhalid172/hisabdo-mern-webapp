import fs from 'fs';
import path from 'path';
import { glob } from 'fs';
import { promisify } from 'util';

const globAsync = promisify(glob);

const CORRECT = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6134980091439447" crossorigin="anonymous"></script>';

// Matches any variant: with or without quotes around src/crossorigin values
const ADSENSE_PATTERN = /<script[^>]*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^>]*><\/script>/gi;

function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next', 'public', '.git'].includes(entry.name)) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const root = process.cwd();
const files = collectHtmlFiles(root);

let totalScanned = 0;
let filesFixed = 0;
let filesAlreadyCorrect = 0;
let duplicatesRemoved = 0;
const issues = [];

for (const file of files) {
  totalScanned++;
  let content = fs.readFileSync(file, 'utf8');
  const matches = content.match(ADSENSE_PATTERN) || [];

  if (matches.length === 0) {
    // No AdSense at all — skip (not required to add)
    continue;
  }

  const alreadyCorrect = matches.every(m => m === CORRECT);
  const hasDuplicates = matches.length > 1;

  if (alreadyCorrect && !hasDuplicates) {
    filesAlreadyCorrect++;
    continue;
  }

  // Remove ALL occurrences
  let fixed = content.replace(ADSENSE_PATTERN, '');

  if (hasDuplicates) {
    duplicatesRemoved += matches.length - 1;
  }

  // Insert exactly ONE correct script before </head>
  if (fixed.includes('</head>')) {
    fixed = fixed.replace('</head>', CORRECT + '\n</head>');
  } else {
    issues.push(`${file}: no </head> found, script appended at top of <body>`);
    fixed = fixed.replace('<body>', '<body>\n' + CORRECT);
  }

  fs.writeFileSync(file, fixed, 'utf8');
  filesFixed++;
}

console.log('\n========== ADSENSE FIX REPORT ==========');
console.log(`Total HTML files scanned : ${totalScanned}`);
console.log(`Files fixed              : ${filesFixed}`);
console.log(`Files already correct    : ${filesAlreadyCorrect}`);
console.log(`Duplicate scripts removed: ${duplicatesRemoved}`);
if (issues.length) {
  console.log('\nRemaining issues:');
  issues.forEach(i => console.log('  - ' + i));
} else {
  console.log('Remaining issues         : None');
}
console.log('=========================================\n');
