import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { generateNarrationAudio } from './ttsService.js';
import { ensureDir, getOutputDir, getTimestamp } from '../utils/fileUtils.js';

ffmpeg.setFfmpegPath(ffmpegPath);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function makeSceneImage(scene, targetPath, index) {
  const bgColors = ['#6C63FF', '#FF7F50', '#24C6DC', '#F9A826', '#2ECC71', '#E84393'];
  const bg = bgColors[index % bgColors.length];
  const svg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)"/>
      <circle cx="190" cy="150" r="80" fill="rgba(255,255,255,0.18)"/>
      <circle cx="1120" cy="550" r="120" fill="rgba(255,255,255,0.12)"/>
      <rect x="90" y="80" width="1100" height="560" rx="28" fill="rgba(15,23,42,0.16)" stroke="rgba(255,255,255,0.18)"/>
      <text x="640" y="240" text-anchor="middle" font-size="52" font-family="Arial" font-weight="700" fill="#F8FAFC">${escapeXml(scene.title)}</text>
      <text x="640" y="390" text-anchor="middle" font-size="30" font-family="Arial" fill="#E2E8F0">${escapeXml(scene.text)}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(targetPath);
}

export async function generateVideoFromScript(scriptData, options = {}) {
  const { title = scriptData.title || 'Kids Story' } = options;
  const outputDir = path.join(getOutputDir(), `video-${getTimestamp()}`);
  const sceneDir = path.join(outputDir, 'scenes');
  await ensureDir(sceneDir);

  const scenes = Array.isArray(scriptData.scenes) && scriptData.scenes.length ? scriptData.scenes : [
    { title: 'Hello', text: 'A joyful adventure begins.' },
    { title: 'Learning', text: 'Curiosity brings new ideas.' },
    { title: 'Fun', text: 'A playful moment appears.' },
    { title: 'Happy End', text: 'The day ends with smiles.' }
  ];

  const imagePaths = [];

  for (let i = 0; i < scenes.length; i += 1) {
    const scene = scenes[i];
    const imagePath = path.join(sceneDir, `scene-${String(i + 1).padStart(3, '0')}.png`);
    imagePaths.push(imagePath);
    await makeSceneImage(scene, imagePath, i);
  }

  const narrationOutput = path.join(outputDir, 'narration.wav');
  const narration = await generateNarrationAudio(scriptData.scriptText || scenes.map((scene) => `${scene.title}: ${scene.text}`).join('\n'), narrationOutput);

  const videoPath = path.join(outputDir, `${String(title).trim().replace(/\s+/g, '-').toLowerCase() || 'kids-story'}.mp4`);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(sceneDir, '*.png'))
      .inputOptions(['-framerate 1/2', '-pattern_type glob'])
      .input(narration.audioPath)
      .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-c:a aac', '-shortest'])
      .output(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const scriptFile = path.join(outputDir, 'story.json');
  await fs.writeFile(scriptFile, JSON.stringify({ ...scriptData, title, scenes }, null, 2), 'utf8');

  return {
    outputDir,
    videoPath,
    narrationPath: narration.audioPath,
    transcriptPath: narration.transcriptPath,
    scriptPath: scriptFile,
    imagePaths,
    title
  };
}
