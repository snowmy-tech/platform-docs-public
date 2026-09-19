import fs from 'fs';
import path from 'path';

// Usage: node scripts/replace-cta.mjs [vercel|cloudflare] [custom-domain]
const targetPlatform = process.argv[2] || process.env.DEPLOY_TARGET || 'vercel';
const customDomainArg = process.argv[3] || process.env.CUSTOM_DOMAIN;

// Domains:
// Vercel -> snowmy.app
// Cloudflare -> snowmy.tech
const targetDomain = customDomainArg || (targetPlatform === 'cloudflare' ? 'snowmy.tech' : 'snowmy.app');
const targetConsoleUrl = `https://console.${targetDomain}`;
const targetHomeUrl = `https://${targetDomain}`;

console.log(`=======================================================`);
console.log(`[CTA Replacer] Deploy Platform: ${targetPlatform}`);
console.log(`[CTA Replacer] Target Domain:   ${targetDomain}`);
console.log(`[CTA Replacer] Console URL:     ${targetConsoleUrl}`);
console.log(`[CTA Replacer] Home URL:        ${targetHomeUrl}`);
console.log(`=======================================================`);

// Detect root directory (if run from workspace root, point to mistral-docs, or directly inside)
let rootDir = process.cwd();
if (fs.existsSync(path.join(rootDir, 'mistral-docs', 'package.json'))) {
  rootDir = path.join(rootDir, 'mistral-docs');
}

// Files to replace
const filesToProcess = [
  'src/components/layout/header/dynamic-studio-cta.tsx',
  'src/lib/constants.ts',
  'src/components/common/interface-cards.tsx',
  'src/components/layout/footer/index.tsx',
  'src/components/common/interactive-glossary/glossary-data.tsx',
];

let totalReplacements = 0;

for (const relPath of filesToProcess) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[Skip] File not found: ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // 1. Replace console.mistral.ai -> console.snowmy.app / console.snowmy.tech
  content = content.replaceAll('https://console.mistral.ai', targetConsoleUrl);
  content = content.replaceAll('console.mistral.ai', `console.${targetDomain}`);

  // 2. In constants.ts, ensure environment variables or fallback points to the domain
  if (relPath.includes('constants.ts')) {
    content = content.replaceAll("'https://console.mistral.ai/home'", `'${targetConsoleUrl}/home'`);
    content = content.replaceAll("'https://console.mistral.ai'", `'${targetConsoleUrl}'`);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[Updated] ${relPath}`);
    totalReplacements++;
  } else {
    console.log(`[Unchanged] ${relPath}`);
  }
}

// Also process markdown files in changelog or content for any hardcoded console.mistral.ai
function walkAndReplace(dir, ext) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndReplace(full, ext);
    } else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) {
      let c = fs.readFileSync(full, 'utf8');
      if (c.includes('console.mistral.ai')) {
        c = c.replaceAll('https://console.mistral.ai', targetConsoleUrl);
        c = c.replaceAll('console.mistral.ai', `console.${targetDomain}`);
        fs.writeFileSync(full, c, 'utf8');
        console.log(`[Updated Doc] ${path.relative(rootDir, full)}`);
        totalReplacements++;
      }
    }
  }
}

walkAndReplace(path.join(rootDir, 'changelog'), ['.md', '.mdx']);
walkAndReplace(path.join(rootDir, 'src/content'), ['.md', '.mdx']);
walkAndReplace(path.join(rootDir, 'src/schema'), ['.ts', '.tsx', '.js', '.json']);

// Also strip out studio_trial UTM params from all src files
function stripUtm(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      stripUtm(full);
    } else if (entry.isFile() && /\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      let c = fs.readFileSync(full, 'utf8');
      if (c.includes('studio_trial')) {
        c = c.replaceAll('?utm_source=docs&utm_medium=header_cta&utm_campaign=studio_trial', '');
        fs.writeFileSync(full, c, 'utf8');
        console.log(`[Stripped UTM] ${path.relative(rootDir, full)}`);
      }
    }
  }
}
stripUtm(path.join(rootDir, 'src'));

console.log(`\n[CTA Replacer] Done! Successfully updated CTA links across ${totalReplacements} files.\n`);
