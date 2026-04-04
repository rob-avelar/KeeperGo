#!/usr/bin/env node
/**
 * Adds #include <utility> to iOS .mm files that use std::move/std::forward
 * but are missing the include. Required for Xcode 16+ / newer Clang.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Works both in monorepo root (EAS) and in apps/mobile directly
const candidates = [
  path.resolve(__dirname, '../../..', 'node_modules'),
  path.resolve(__dirname, '..', 'node_modules'),
];
const nodeModules = candidates.find(p => fs.existsSync(p)) || candidates[0];

console.log(`Scanning node_modules at: ${nodeModules}`);

function findFiles(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip react-native core and hermes (they handle utility correctly)
      if (entry.name === 'react-native' || entry.name === 'hermes-engine' || entry.name === 'boost') continue;
      findFiles(full, ext, results);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const mmFiles = findFiles(nodeModules, '.mm');

let patched = 0;
for (const filePath of mmFiles) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

  if (!content.includes('std::move') && !content.includes('std::forward')) continue;
  if (content.includes('#include <utility>')) continue;

  // Insert after the first #import or #include line
  const patched_content = content.replace(/^(#(?:import|include)\s.+)$/m, '$1\n#include <utility>');
  if (patched_content === content) continue;

  try {
    fs.writeFileSync(filePath, patched_content, 'utf8');
    console.log(`  patched: ${path.relative(nodeModules, filePath)}`);
    patched++;
  } catch { continue; }
}

console.log(`\nDone. Patched ${patched} file(s).`);
