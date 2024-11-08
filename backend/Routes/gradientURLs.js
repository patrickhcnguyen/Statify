const express = require('express');
const router = express.Router();
const GradientMaker = require('../ImageMaker/gradient');

const gradientMaker = new GradientMaker(2048);

// Generate gradient images and return URLs
router.post('/generate-gradients', async (req, res) => {
  try {
    const { color1, color2, color3 } = req.body;
    const gradientId = Date.now().toString(); // Simple unique ID
    
    const { radialBuffer, conicBuffer, cssGradient, colorStops } = 
      await gradientMaker.generateGradientBuffers(color1, color2, color3);

    // Store buffers in memory (in production, store in a database or file storage)
    global.gradientBuffers = global.gradientBuffers || {};
    global.gradientBuffers[`${gradientId}-radial`] = radialBuffer;
    global.gradientBuffers[`${gradientId}-conic`] = conicBuffer;

    // Return URLs that point to our image serving endpoints
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      radialUrl: `${baseUrl}/gradients/${gradientId}-radial`,
      conicUrl: `${baseUrl}/gradients/${gradientId}-conic`,
      cssGradient,
      colorStops
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve gradient images
router.get('/:id', (req, res) => {
  const buffer = global.gradientBuffers[req.params.id];
  if (!buffer) {
    return res.status(404).send('Gradient not found');
  }
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(buffer);
});

module.exports = router; 