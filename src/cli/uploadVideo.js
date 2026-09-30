import { uploadVideoToYouTube } from '../services/youtubeService.js';
import { parseArgs } from '../utils/fileUtils.js';

async function main() {
  const args = parseArgs(process.argv);
  const filePath = args.file || args.path;
  const title = args.title || 'Kids Story Video';
  const description = args.description || 'A kid-friendly AI-generated video.';

  if (!filePath) {
    throw new Error('Please provide a video file path with --file');
  }

  const result = await uploadVideoToYouTube(filePath, {
    title,
    description,
    privacyStatus: args.private === true ? 'private' : 'unlisted'
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('YouTube upload failed:', error.message);
  process.exit(1);
});
