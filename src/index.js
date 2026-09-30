import express from 'express';
import { env } from './config/env.js';
import { generateKidsStory } from './services/openaiService.js';
import { generateVideoFromScript } from './services/videoService.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Kids AI YouTube Generator is running.' });
});

app.post('/generate-video', async (req, res) => {
  try {
    const { topic = 'space', ageGroup = '4-8', title = 'A Happy Adventure' } = req.body;

    const script = await generateKidsStory({ topic, ageGroup, title });
    const result = await generateVideoFromScript(script, { title: script.title });

    res.status(201).json({
      success: true,
      title: script.title,
      topic,
      ageGroup,
      video: {
        outputDir: result.outputDir,
        videoPath: result.videoPath,
        narrationPath: result.narrationPath,
        transcriptPath: result.transcriptPath,
        scriptPath: result.scriptPath
      },
      script
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(env.PORT, () => {
  console.log(`Kids AI YouTube Generator listening on port ${env.PORT}`);
});

export default app;
