import { generateKidsStory } from '../services/openaiService.js';
import { generateVideoFromScript } from '../services/videoService.js';
import { parseArgs } from '../utils/fileUtils.js';

async function main() {
  const args = parseArgs(process.argv);
  const topic = args.topic || 'space';
  const ageGroup = args['age-group'] || '4-8';
  const title = args.title || 'A Happy Adventure';

  console.log('Generating kids story...');
  const story = await generateKidsStory({ topic, ageGroup, title });

  console.log('Rendering video...');
  const result = await generateVideoFromScript(story, { title: story.title });

  console.log('Video generation complete.');
  console.log(JSON.stringify({
    title: story.title,
    videoPath: result.videoPath,
    outputDir: result.outputDir,
    narrationPath: result.narrationPath,
    scriptPath: result.scriptPath
  }, null, 2));
}

main().catch((error) => {
  console.error('Video generation failed:', error);
  process.exit(1);
});
