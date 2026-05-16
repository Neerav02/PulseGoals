const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/auth');

// POST /api/ai/review — AI Goal Quality Review via Grok API
router.post('/review', authGuard, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Goal title is required.' });

    const apiKey = process.env.GROK_API_KEY;
    
    const getDemoResponse = () => ({
      score: 72,
      suggestions: [
        'Add specific measurable metrics to make this goal quantifiable',
        'Include a clear timeline or deadline for completion',
        'Specify the expected business impact or outcome'
      ],
      verdict: 'Needs Work',
      isDemo: true,
    });

    // If no API key configured, return a helpful default
    if (!apiKey || apiKey === 'your-grok-api-key') {
      return res.json(getDemoResponse());
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          {
            role: 'system',
            content: `You are a goal quality reviewer. A user has written an employee performance goal. 
Evaluate if it is SMART (Specific, Measurable, Achievable, Relevant, Time-bound). 
Reply ONLY with a JSON object: 
{ "score": 0-100, "suggestions": ["tip1", "tip2", "tip3"], "verdict": "Strong" | "Needs Work" | "Weak" }
No extra text, no markdown, just raw JSON.`
          },
          {
            role: 'user',
            content: `Goal Title: ${title}\nDescription: ${description || 'No description provided.'}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status);
      // Fallback to demo response if API fails (e.g. invalid key)
      return res.json(getDemoResponse());
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch {
      console.error('Failed to parse AI response:', content);
      res.json({
        score: 60,
        suggestions: ['AI returned an unexpected format — please try again'],
        verdict: 'Needs Work',
      });
    }
  } catch (err) {
    console.error('AI review error:', err);
    // Fallback on any throw
    res.json(getDemoResponse());
  }
});

module.exports = router;
