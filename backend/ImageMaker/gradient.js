const sharp = require('sharp');
const path = require('path');

class GradientMaker {
  constructor(size = 2048) {
    this.size = Math.max(640, Math.min(10000, size));
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // Convert RGB to hex
  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('');
  }

  // Generate intermediate colors
  interpolateColors(color1, color2, color3, steps = 10) {
    const colors = [];
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    const rgb3 = this.hexToRgb(color3);

    // First half - color1 to color2
    for (let i = 0; i < steps / 2; i++) {
      const fraction = i / (steps / 2 - 1);
      const r = rgb1.r + (rgb2.r - rgb1.r) * fraction;
      const g = rgb1.g + (rgb2.g - rgb1.g) * fraction;
      const b = rgb1.b + (rgb2.b - rgb1.b) * fraction;
      colors.push(this.rgbToHex(r, g, b));
    }

    // Second half - color2 to color3
    for (let i = 0; i < steps / 2; i++) {
      const fraction = i / (steps / 2 - 1);
      const r = rgb2.r + (rgb3.r - rgb2.r) * fraction;
      const g = rgb2.g + (rgb3.g - rgb2.g) * fraction;
      const b = rgb2.b + (rgb3.b - rgb2.b) * fraction;
      colors.push(this.rgbToHex(r, g, b));
    }

    // Log all color stops
    console.log('Color stops used in gradients:');
    colors.forEach((color, index) => {
      console.log(`Stop ${index}: ${color}`);
    });

    // Log the CSS radial-gradient format
    console.log('\nRadial gradient CSS:');
    console.log(`background: radial-gradient(circle at 50% 50%, ${colors.join(', ')});`);

    return colors;
  }

  async generateGradients(color1, color2, color3) {
    const outputDir = path.join(__dirname, 'output');
    const colors = this.interpolateColors(color1, color2, color3);
    
    // Create color stops string for SVG
    const colorStops = colors
      .map((color, index) => 
        `<stop offset="${(index * 100 / (colors.length - 1))}%" stop-color="${color}"/>`
      )
      .join('\n        ');

    // Radial gradient with interpolated colors
    const radialSvg = `
      <svg width="${this.size}" height="${this.size}">
        <defs>
          <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
            ${colorStops}
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
      </svg>
    `;
    
    // Conic gradient with interpolated colors
    const conicSvg = `
      <svg width="${this.size}" height="${this.size}">
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            ${colorStops}
          </linearGradient>
        </defs>
        <path d="M ${this.size/2} ${this.size/2} L ${this.size} ${this.size/2} A ${this.size/2} ${this.size/2} 0 1 1 ${this.size} ${this.size/2-1} Z" fill="url(#gradient)"/>
      </svg>
    `;

    // Convert SVGs to JPEGs
    await Promise.all([
      sharp(Buffer.from(radialSvg))
        .jpeg({ quality: 100 })
        .toFile(path.join(outputDir, 'radial_gradient.jpg')),
      
      sharp(Buffer.from(conicSvg))
        .jpeg({ quality: 100 })
        .toFile(path.join(outputDir, 'conic_gradient.jpg'))
    ]);
  }
}

module.exports = GradientMaker;
