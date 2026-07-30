import fs from 'fs';

const files = [
  'D:/projects/lepakshi_spices/apps/user/src/app/App.tsx',
  'D:/projects/lepakshi_spices/apps/admin/src/app/App.tsx',
];

const replacements = [
  ['ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬', ''],
  ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬', ''],
  ['ÃƒÆ’Ã‚Â¢â€“Ãƒâ€¹Ã¢â‚¬Â ', ''],
  ['ÃƒÂ¢â€šÂ¬Ã¢â‚¬Â¦', '...'],
  ['ÃƒÂ¢â€šÂ¬Ã¢â‚¬â€œ', '–'],
  ['ÃƒÂ¢â€šÂ¬Ã¢â‚¬â€', '—'],
  ['ÃƒÂ¢â€šÂ¬Ã¢â€žÂ¢', '’'],
  ['ÃƒÂ¢â‚¬Â¦', '...'],
  ['ÃƒÂ¢â‚¬â€œ', '–'],
  ['ÃƒÂ¢â‚¬â€', '—'],
  ['ÃƒÂ¢â‚¬â„¢', '’'],
  ['ÃƒÂ¢â‚¬Â ', '→'],
  ['ÃƒÂ¢â‚¬Â¢', '•'],
  ['ÃƒÂ¢â€¹â€š', '★'],
  ['ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·', '·'],
  ['ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶', '¶'],
  ['Ãƒâ€šÃ‚Â·', '·'],
  ['Ãƒâ€šÃ‚', ''],
  ['Ã¢â€šÂ¹', '₹'],
  ['â‚¹', '₹'],
  ['Ã—', '×'],
  ['â€¢', '•'],
  ['â†’', '->'],
  ['â€¦', '...'],
  ['â€“', '–'],
  ['â€”', '—'],
  ['â˜…', '★'],
  ['â€¡', '‡'],
  ['â„¢', '™'],
  ['â€œ', '"'],
  ['â€', '"'],
  ['â€˜', "'"],
  ['â€™', "'"],
  ['Ã‚Â', ''],
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  text = text
    .split(/\r?\n/)
    .map((line) => {
      if (line.includes('{"\\n"}') && line.includes('Ãƒ')) return '';
      if (line.includes('Brand Tokens') && line.includes('Ãƒ')) return '// Brand Tokens';
      if (line.includes('Data & Database State') && line.includes('Ãƒ')) return '// Data & Database State';
      if (line.includes('Primitives') && line.includes('Ãƒ')) return '// Primitives';
      if (line.includes('Sidebar') && line.includes('Ãƒ')) return '// Sidebar';
      if (line.includes('Header') && line.includes('Ãƒ')) return '// Header';
      if (line.includes('Dashboard') && line.includes('Ãƒ')) return '// Dashboard';
      if (line.includes('Analytics') && line.includes('Ãƒ')) return '// Analytics';
      if (line.includes('Settings') && line.includes('Ãƒ')) return '// Settings';
      if (line.includes('WHOLESALE MANAGEMENT CMS PAGE') && line.includes('Ãƒ')) return '// WHOLESALE MANAGEMENT CMS PAGE';
      if (line.includes('QUOTATION MANAGEMENT CMS PAGE') && line.includes('Ãƒ')) return '// QUOTATION MANAGEMENT CMS PAGE';
      if (line.includes('PRODUCT CATALOG CMS PAGE') && line.includes('Ãƒ')) return '// PRODUCT CATALOG CMS PAGE';
      if (line.includes('WEBSITE CMS (unified)') && line.includes('Ãƒ')) return '// WEBSITE CMS (unified)';
      if (line.includes('Loading activity') && line.includes('Ã')) return line.replace(/Loading activity.*/, 'Loading activity...');
      if (line.includes('Uploading') && line.includes('Ã')) return line.replace(/Uploading.*/, 'Uploading...');
      if (line.includes('Signing in') && line.includes('Ã')) return line.replace(/Signing in.*/, 'Signing in...');
      if (line.includes('Navigate') && line.includes('Ã')) return '                    <span className="text-[10px] text-stone-400 group-hover:text-stone-600 font-mono">Navigate -></span>';
      if (line.includes('repeat(rev.rating') && line.includes('Ã')) return '                                    {"★".repeat(rev.rating || 5)}';
      if (line.includes('{star}') && line.includes('Ã')) return '                                      ★ {star}';
      if (line.includes('2FA Modal') && line.includes('Ã')) return '      {/* 2FA Modal */}';
      let cleaned = line.replace(/[ÃâƒÄÅ‚€‹›�]/g, '');
      cleaned = cleaned.replace(/\s{2,}/g, ' ');
      return cleaned;
    })
    .join('\n');
  fs.writeFileSync(file, text, 'utf8');
}
