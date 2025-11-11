/**
 * AI Insights API Endpoint
 *
 * This serverless function securely handles AI analysis of customer feedback
 * using the Anthropic Claude API. It keeps the API key secure on the server side.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { feedbackData, npsData, venueName, dateFrom, dateTo } = req.body;

    // Validate required fields
    if (!feedbackData || !npsData || !venueName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Anthropic API key from environment
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured. Please contact support.' });
    }

    // Prepare feedback summary for AI
    const feedbackSummary = prepareFeedbackSummary(feedbackData, npsData, venueName, dateFrom, dateTo);

    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: feedbackSummary,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(500).json({
        error: 'Failed to generate insights. Please try again.'
      });
    }

    const result = await response.json();
    const insight = result.content[0].text;

    return res.status(200).json({ insight });

  } catch (error) {
    console.error('Error in AI insights endpoint:', error);
    return res.status(500).json({
      error: 'An error occurred while generating insights. Please try again.'
    });
  }
}

/**
 * Prepare feedback data summary for AI analysis
 */
function prepareFeedbackSummary(feedbackData, npsData, venueName, dateFrom, dateTo) {
  // Count feedback by rating
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbackData.forEach(item => {
    if (item.rating >= 1 && item.rating <= 5) {
      ratingCounts[item.rating]++;
    }
  });

  // Calculate NPS score
  const npsScores = npsData.map(item => item.score).filter(score => score !== null);
  let npsScore = null;
  if (npsScores.length > 0) {
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    npsScore = Math.round(((promoters - detractors) / npsScores.length) * 100);
  }

  // Collect all text feedback
  const feedbackTexts = [];
  feedbackData.forEach(item => {
    if (item.questions && item.questions.question) {
      feedbackTexts.push({
        question: item.questions.question,
        rating: item.rating,
        feedback: item.additional_feedback || null,
      });
    } else if (item.additional_feedback) {
      feedbackTexts.push({
        question: 'General feedback',
        rating: item.rating,
        feedback: item.additional_feedback,
      });
    }
  });

  // Collect NPS comments
  const npsComments = npsData
    .filter(item => item.comment && item.comment.trim() !== '')
    .map(item => ({
      score: item.score,
      comment: item.comment,
    }));

  // Build the prompt for Claude
  const prompt = `You are an expert restaurant/hospitality consultant analyzing customer feedback for "${venueName}" from ${dateFrom} to ${dateTo}.

## Feedback Summary:
- Total feedback submissions: ${feedbackData.length}
- Rating distribution: 5★ (${ratingCounts[5]}), 4★ (${ratingCounts[4]}), 3★ (${ratingCounts[3]}), 2★ (${ratingCounts[2]}), 1★ (${ratingCounts[1]})
- NPS responses: ${npsData.length}${npsScore !== null ? ` (NPS Score: ${npsScore})` : ''}

## Detailed Feedback:
${feedbackTexts.slice(0, 50).map((item, idx) =>
  `${idx + 1}. ${item.question} (Rating: ${item.rating}/5)${item.feedback ? `\n   Response: "${item.feedback}"` : ''}`
).join('\n\n')}

${npsComments.length > 0 ? `\n## NPS Comments:
${npsComments.slice(0, 20).map((item, idx) =>
  `${idx + 1}. Score: ${item.score}/10\n   Comment: "${item.comment}"`
).join('\n\n')}` : ''}

Please analyze this feedback and provide 2-3 concise, actionable insights. Focus on:
1. The most critical area needing improvement (if any)
2. What customers appreciate most
3. One specific, actionable recommendation

Keep your response under 200 words and in a friendly, professional tone. Start directly with the insights without preamble.`;

  return prompt;
}
