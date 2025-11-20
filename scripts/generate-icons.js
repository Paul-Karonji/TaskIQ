/**
 * PWA Icon Generator Script
 * Generates all required PWA icons from a base image
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('sharp is not installed. Installing...');
  require('child_process').execSync('npm install --no-save sharp', { stdio: 'inherit' });
  sharp = require('sharp');
}

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const SOURCE_IMAGE = path.join(__dirname, '..', 'public', 'og-image.png');

// Icon sizes to generate
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.log('⚠️  Source image not found. Creating a default icon...');
    await createDefaultIcon();
  }

  // Generate regular icons
  for (const size of SIZES) {
    try {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 16, g: 185, b: 129, alpha: 1 } // #10B981
        })
        .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));

      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size}:`, error.message);
    }
  }

  // Generate maskable icons (with padding)
  for (const size of [192, 512]) {
    try {
      const padding = Math.floor(size * 0.1); // 10% padding
      await sharp(SOURCE_IMAGE)
        .resize(size - padding * 2, size - padding * 2, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 16, g: 185, b: 129, alpha: 1 }
        })
        .toFile(path.join(ICONS_DIR, `icon-${size}x${size}-maskable.png`));

      console.log(`✅ Generated icon-${size}x${size}-maskable.png`);
    } catch (error) {
      console.error(`❌ Error generating maskable ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 All icons generated successfully!');
}

async function createDefaultIcon() {
  // Create a simple default icon with the DueSync brand color
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#10B981"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">DS</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(SOURCE_IMAGE);

  console.log('✅ Created default source icon\n');
}

// Run the generator
generateIcons().catch(console.error);
