#!/usr/bin/env node

// cli/index.js
import { generateComponent } from './generators/componentGenerator.js';
import { generateFeature } from './generators/featureGenerator.js';

const args = process.argv.slice(2);
const command = args[0];
const targetName = args[1];

// Parse flags like --category=layout or --type=ui
const options = {};
args.slice(2).forEach((arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    options[key] = value || true;
  }
});

function printBanner() {
  console.log('\x1b[36m%s\x1b[0m', '================================================');
  console.log('\x1b[36m%s\x1b[0m', '      ⚡ ABC REACT WIREFRAME CODE GENERATOR ⚡       ');
  console.log('\x1b[36m%s\x1b[0m', '================================================\n');
}

function printHelp() {
  printBanner();
  console.log('\x1b[33m%s\x1b[0m', 'Available Commands:\n');
  console.log('  1. Generate a UI / Layout Component:');
  console.log('     \x1b[32mnpm run generate:component <ComponentName>\x1b[0m');
  console.log('     \x1b[32mnpm run generate:component <ComponentName> -- --category=layout\x1b[0m\n');

  console.log('  2. Generate a Complete Feature Module:');
  console.log('     \x1b[32mnpm run generate:feature <feature-name>\x1b[0m\n');

  console.log('  3. Direct CLI execution:');
  console.log('     \x1b[32mnode cli/index.js component Badge\x1b[0m');
  console.log('     \x1b[32mnode cli/index.js feature department-details\x1b[0m\n');
}

switch (command) {
  case 'component':
  case 'components':
  case 'c':
    printBanner();
    generateComponent(targetName, options);
    break;

  case 'feature':
  case 'features':
  case 'f':
    printBanner();
    generateFeature(targetName);
    break;

  case 'help':
  case '--help':
  case '-h':
  default:
    printHelp();
    break;
}
