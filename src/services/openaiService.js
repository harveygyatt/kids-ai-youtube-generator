import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

function fallbackStory({ topic, ageGroup, title }) {
  const safeTopic = topic || 'friendly adventures';
  const safeAgeGroup = ageGroup || '4-8';
  const safeTitle = title || `The ${safeTopic} Adventure`;

  const scenes = [
    {
      title: 'A Magical Beginning',
      text: `Today, ${safeTopic} is full of wonder. A cheerful explorer begins a new adventure with a bright smile and a brave heart.`
    },
    {
      title: 'A Little Surprise',
      text: `A small discovery appears on the path. It is colorful, helpful, and full of playful ideas that spark curiosity.`
    },
    {
      title: 'Learning Together',
      text: `The explorer learns something new while giggling, exploring, and sharing every exciting moment with friends.`
    },
    {
      title: 'A Happy Ending',
      text: `The adventure ends with warm feelings, a big hug, and a reminder that kindness makes every day brighter.`
    }
  ];

  const storyText = scenes.map((scene) => `${scene.title}: ${scene.text}`).join('\n');

  return {
    title: safeTitle,
    topic: safeTopic,
    ageGroup: safeAgeGroup,
    description: `A playful and educational kids story about ${safeTopic}.`,
    scriptText: storyText,
    scenes
  };
}

export async function generateKidsStory({ topic = 'friendly adventures', ageGroup = '4-8', title = '' } = {}) {
  if (!openai) {
    return fallbackStory({ topic, ageGroup, title });
  }

  try {
    const prompt = `
      Write a short, kid-friendly YouTube story in JSON format.
      Requirements:
      - age group: ${ageGroup}
      - topic: ${topic}
      - title: ${title || `A ${topic} adventure`}
      - output must be a single valid JSON object with keys: title, topic, ageGroup, description, scenes.
      - scenes must be an array of objects with keys: title and text.
      - each scene text should be simple, warm, engaging, and safe for children.
      - include exactly 4 scenes.
      - keep each scene text under 160 characters.
    `;

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: 'You create gentle, safe, and engaging kids story scripts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      topic: parsed.topic || topic,
      ageGroup: parsed.ageGroup || ageGroup,
      title: parsed.title || title || `A ${topic} adventure`,
      scenes: Array.isArray(parsed.scenes) && parsed.scenes.length ? parsed.scenes : fallbackStory({ topic, ageGroup, title }).scenes,
      scriptText: Array.isArray(parsed.scenes)
        ? parsed.scenes.map((scene) => `${scene.title}: ${scene.text}`).join('\n')
        : fallbackStory({ topic, ageGroup, title }).scriptText
    };
  } catch (error) {
    console.warn('OpenAI story generation failed. Using fallback story.', error.message);
    return fallbackStory({ topic, ageGroup, title });
  }
}
