#!/usr/bin/env node
/**
 * Adds #include <utility> to iOS .mm/.cpp files that use std::move
 * but are missing the include. Newer Xcode/Clang versions require it explicitly.
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

const filesToPatch = [
  '@react-native-community/datetimepicker/ios/fabric/RNDateTimePickerComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/AddressSheetViewComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/AddToWalletButtonComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/ApplePayButtonComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/AuBECSDebitFormComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/CardFieldComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/CardFormComponentView.mm',
  '@stripe/stripe-react-native/ios/NewArch/NavigationBarComponentView.mm',
];

let patched = 0;
for (const relPath of filesToPatch) {
  const fullPath = path.join(nodeModules, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  skip (not found): ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes('#include <utility>')) {
    console.log(`  ok (already patched): ${relPath}`);
    continue;
  }
  // Insert after the first #import or #include line
  content = content.replace(/^(#(?:import|include)\s.+)$/m, '$1\n#include <utility>');
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  patched: ${relPath}`);
  patched++;
}

console.log(`\nDone. Patched ${patched} file(s).`);
