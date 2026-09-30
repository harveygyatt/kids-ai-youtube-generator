import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import { env } from '../config/env.js';

function getDurationFromText(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(12, Math.ceil(wordCount / 2.5));
}

export async function generateNarrationAudio(scriptText, outputFilePath) {
  const duration = getDurationFromText(scriptText);

  await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

  const ffmpegArgs = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=22050:cl=mono',
    '-t',
    String(duration),
    '-q:a',
    '9',
    outputFilePath
  ];

  const result = spawnSync(ffmpegPath, ffmpegArgs, {
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  const transcriptPath = `${outputFilePath}.txt`;
  await fs.writeFile(transcriptPath, scriptText, 'utf8');

  return {
    audioPath: outputFilePath,
    transcriptPath,
    duration
  };
}
