# NicheHunter AI

A content intelligence platform that reverse-engineers videos to extract retention mechanics, hook strategies, script structures, visual patterns, and persona traits using the **Glass Engine™** heuristic analysis system.

## Features

- **Hook Analysis**: Detects 6 hook types (question, statistic, controversy, story, curiosity-gap, direct-challenge)
- **Retention Analysis**: Segment scoring, pattern interrupts, open loop detection
- **Structure Analysis**: Script framework identification (PAS, AIDA, Hook-Value-CTA)
- **Visual Analysis**: Frame color analysis, face presence, text overlay detection
- **Persona Modeling**: 5 archetypes (Teacher, Entertainer, Authority, Friend, Provocateur)
- **Platform Recommendations**: Optimized tips for YouTube, TikTok, Instagram Reels
- **Export Options**: JSON, Markdown, and shareable summaries

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Prisma + SQLite
- **Authentication**: NextAuth.js
- **Video Processing**: FFmpeg
- **Transcription**: Whisper (with mock fallback)

## Prerequisites

- Node.js 18+
- npm or yarn
- FFmpeg (optional, for video processing)
- Python 3.8+ with Whisper (optional, for transcription)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd NicheHunter-AI
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Auth secret key | Required |
| `NEXTAUTH_URL` | App URL for auth | `http://localhost:3000` |
| `WHISPER_MODEL` | Whisper model size | `base` |
| `ENABLE_MOCK_TRANSCRIPTION` | Use mock transcription | `true` |
| `MAX_VIDEO_DURATION` | Max video length (seconds) | `600` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `104857600` |

### Installing FFmpeg (Optional)

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Installing Whisper (Optional)

```bash
pip install openai-whisper
```

## Project Structure

```
NicheHunter-AI/
├── app/
│   ├── api/              # API routes
│   ├── analysis/         # Analysis pages
│   ├── components/       # React components
│   │   ├── analysis/     # Analysis display components
│   │   ├── landing/      # Landing page components
│   │   └── ui/           # Reusable UI components
│   └── page.tsx          # Home page
├── lib/
│   ├── glass-engine/     # Heuristic analysis modules
│   ├── output/           # Output formatting & export
│   ├── video/            # Video processing utilities
│   └── utils/            # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Glass Engine™

The Glass Engine is a deterministic heuristic analysis system that evaluates content without machine learning:

### Hook Detection (`lib/glass-engine/hooks.ts`)
- Pattern matching for 6 hook types
- Keyword and regex-based detection
- Confidence scoring

### Retention Analysis (`lib/glass-engine/retention.ts`)
- Segment-based engagement scoring
- Pattern interrupt detection
- Open loop tracking

### Structure Analysis (`lib/glass-engine/structure.ts`)
- Section detection (hook, problem, solution, CTA)
- Framework classification

### Visual Analysis (`lib/glass-engine/visual.ts`)
- Frame color extraction
- Face presence estimation
- Text overlay detection

### Persona Analysis (`lib/glass-engine/persona.ts`)
- Archetype classification
- Speaking trait analysis
- Authority/relatability scoring

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Start new analysis |
| `/api/analysis` | GET | List user analyses |
| `/api/analysis/[id]` | GET | Get analysis details |
| `/api/analysis/[id]/export` | GET | Export analysis (JSON/MD) |
| `/api/upload` | POST | Upload video file |
| `/api/status` | GET | Health check |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

**Note**: Video processing requires serverless function timeout extension.

### Self-Hosted

```bash
npm run build
npm start
```

For production SQLite, consider using Turso or LiteFS.

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Database studio
npx prisma studio
```

## Limitations (MVP)

- Video processing limited to 10 minutes
- Mock transcription enabled by default
- Single-user mode (no team features)
- SQLite database (not horizontally scalable)

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with the **Glass Engine™** heuristic analysis system.
