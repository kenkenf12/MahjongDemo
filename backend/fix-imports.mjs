import fs from 'fs';
import path from 'path';

const sourceDir = './src';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        walkDir(filepath);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      fixImports(filepath);
    }
  });
}

function fixImports(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;
  
  // Fix local imports: from './x' and from '../x'
  // Only if they don't already end with .js
  content = content.replace(
    /from\s+['"](\.[^'"]*?)(?<!\.js)['"];?/g,
    (match, importPath) => {
      if (importPath.includes('node_modules')) return match;
      return `from '${importPath}.js';`;
    }
  );
  
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`✓ Fixed: ${filepath}`);
  }
}

walkDir(sourceDir);
console.log('Done!');
