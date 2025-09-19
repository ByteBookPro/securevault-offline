// Simple build script for SecureVault Browser Extension

const fs = require('fs');
const path = require('path');

console.log('Building SecureVault Browser Extension...');

// Create build directory
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(buildDir, 'manifest.json')
);

// Create src directory in build
const srcBuildDir = path.join(buildDir, 'src');
if (!fs.existsSync(srcBuildDir)) {
  fs.mkdirSync(srcBuildDir, { recursive: true });
}

// Copy source files
const sourceFiles = [
  'src/background.js',
  'src/content.js', 
  'src/popup.html',
  'src/popup.js'
];

sourceFiles.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(buildDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Source file not found: ${file}`);
  }
});

// Create icons directory in build
const iconsBuildDir = path.join(buildDir, 'icons');
if (!fs.existsSync(iconsBuildDir)) {
  fs.mkdirSync(iconsBuildDir, { recursive: true });
}

// Copy icon files
const iconFiles = ['icon16.svg', 'icon48.svg', 'icon128.svg'];
iconFiles.forEach(iconFile => {
  const srcPath = path.join(__dirname, 'icons', iconFile);
  const destPath = path.join(iconsBuildDir, iconFile);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${iconFile}`);
  } else {
    console.warn(`Icon file not found: ${iconFile}`);
  }
});

console.log('Build completed successfully!');
console.log(`Extension ready in: ${buildDir}`);
console.log('\nTo install:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the build folder');