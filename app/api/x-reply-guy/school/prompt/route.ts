import { NextResponse } from 'next/server';
import { getReplies } from '@/lib/x-reply-guy-db';

export async function GET() {
  try {
    const replies = getReplies(500);

    // Filter to only rated replies
    const ratedReplies = replies.filter(r => r.school_rating);

    if (ratedReplies.length === 0) {
      return NextResponse.json({
        prompt: 'No rated replies yet. Rate some replies in Reply Agent School first.'
      });
    }

    // Group by rating
    const good = ratedReplies.filter(r => r.school_rating === 'good');
    const bad = ratedReplies.filter(r => r.school_rating === 'bad');

    // Build the training prompt
    let prompt = `# Reply Agent Training Data

Based on human feedback, here are examples of good and bad replies.

## GOOD REPLIES (${good.length} examples)
These replies performed well and should be emulated:

`;

    good.slice(0, 20).forEach((r, i) => {
      prompt += `${i + 1}. "${r.reply_text}"`;
      if (r.school_comment) prompt += ` [Note: ${r.school_comment}]`;
      if (r.impressions) prompt += ` (${r.impressions.toLocaleString()} views)`;
      prompt += '\n';
    });

    prompt += `

## BAD REPLIES (${bad.length} examples)
These replies underperformed and should be avoided:

`;

    bad.slice(0, 20).forEach((r, i) => {
      prompt += `${i + 1}. "${r.reply_text}"`;
      if (r.school_comment) prompt += ` [Issue: ${r.school_comment}]`;
      prompt += '\n';
    });

    prompt += `

## INSTRUCTIONS
When generating replies:
1. Follow the patterns in GOOD REPLIES
2. Avoid the patterns in BAD REPLIES
3. Keep replies short (12-15 words max)
4. Use lowercase, no emojis
5. Be witty but not try-hard
`;

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Prompt generation error:', error);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
