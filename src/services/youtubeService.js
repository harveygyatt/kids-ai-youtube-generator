import fs from 'node:fs/promises';
import { google } from 'googleapis';
import { env } from '../config/env.js';

export async function uploadVideoToYouTube(filePath, metadata = {}) {
  const { title = 'Kids Story', description = 'A kids story created with AI.', privacyStatus = 'private' } = metadata;

  if (!env.YOUTUBE_CLIENT_ID || !env.YOUTUBE_CLIENT_SECRET || !env.YOUTUBE_REFRESH_TOKEN) {
    throw new Error('Missing YouTube credentials. Add YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN to your .env file.');
  }

  const oauth2Client = new google.auth.OAuth2(
    env.YOUTUBE_CLIENT_ID,
    env.YOUTUBE_CLIENT_SECRET,
    env.YOUTUBE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: env.YOUTUBE_REFRESH_TOKEN });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const fileContents = await fs.readFile(filePath);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    media: {
      mimeType: 'video/mp4',
      body: fileContents
    },
    requestBody: {
      snippet: {
        title,
        description,
        categoryId: '27'
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false
      }
    }
  });

  return response.data;
}
