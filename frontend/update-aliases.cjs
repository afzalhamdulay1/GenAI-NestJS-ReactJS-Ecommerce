const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    function replacer(match, importPath) {
        if (!importPath.startsWith('.')) return match;
        const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
        if (absoluteImportPath.startsWith(srcDir)) {
            const relativeToSrc = path.relative(srcDir, absoluteImportPath).replace(/\\/g, '/');
            return match.replace(importPath, `@/${relativeToSrc}`);
        }
        return match;
    }

    let newContent = content
        .replace(/from\s+['"]([^'"]+)['"]/g, replacer)
        .replace(/import\s+['"]([^'"]+)['"]/g, replacer)
        .replace(/import\(['"]([^'"]+)['"]\)/g, replacer);

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${path.relative(__dirname, filePath)}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walk(srcDir);
