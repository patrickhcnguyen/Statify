const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate-gradient-colors', async (req, res) => {
  const { genres } = req.body;
  
  if (!genres || genres.length !== 3) {
    return res.status(400).json({ error: 'Exactly 3 genres are required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Create a color gradient based on the moods of these 3 spotify genres and give me one hex code for each genre [${genres.join(', ')}]. Only respond with the three hex codes separated by commas, nothing else.`
        }
      ]
    });

    const colors = completion.choices[0].message.content.split(',').map(color => color.trim());

    // Send both the raw colors and generate the gradient
    res.json({ colors });

  } catch (error) {
    console.error('Error generating colors:', error);
    res.status(500).json({ error: 'Failed to generate colors' });
  }
});

module.exports = router; 