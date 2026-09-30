# Kids AI YouTube Generator

A Node.js starter project for making kid-friendly AI-powered YouTube videos using:
- OpenAI story generation
- FFmpeg video rendering
- optional YouTube upload integration

## Features
- Generates kid-friendly story scripts by topic
- Creates a short animated slideshow video
- Uses a silent placeholder narration when no TTS service is configured
- Prepares upload metadata for YouTube
- Basic Express API for automation

## Stack
- Node.js + Express
- OpenAI API
- FFmpeg
- Google YouTube API
- Sharp for image generation

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Add your API keys to `.env`.

4. Generate a video:

```bash
npm run generate-video -- --topic "space" --age-group "4-8" --title "The Moon Bunny"
```

5. Start the API:

```bash
npm run dev
```

6. Upload a video:

```bash
npm run upload-video -- --file output/your-video.mp4 --title "The Moon Bunny"
```

## API endpoints

### Health check

```bash
GET /health
```

### Generate a video

```bash
POST /generate-video
Content-Type: application/json

{
  "topic": "dinosaurs",
  "ageGroup": "5-8",
  "title": "Dino Daydream"
}
```

Returns:
- the generated story script
- output file path
- link to the video artifact

## Notes

This project is designed as a starter MVP. To make it production-quality, you can add:
- real TTS voices from ElevenLabs or Google Cloud
- AI image generation from DALL-E or Stability
- more advanced scene transitions
- watermarking and thumbnail generation
- YouTube publishing automation
