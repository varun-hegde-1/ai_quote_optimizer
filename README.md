# AI Quote Optimizer

A React-based application for optimizing quotations using AI capabilities.

## Prerequisites

Choose one of the following setup methods:

### For Local Development (npm)

- Node.js 20.x or higher
- npm 9.x or higher

### For Docker

- Docker 20.x or higher
- Docker Compose 2.x or higher

---

## 🔑 API Key Setup

This application uses the **Google Gemini API** for AI-powered features including:

- Live Buyer Sentiment Analysis
- Proposal Draft Generation
- AI Pricing Assistant

### Setting up your API Key

1. **Get a Gemini API Key**

   Visit [Google AI Studio](https://aistudio.google.com/api-keys) and create an API key.

2. **Create the `.env` file**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. **Add your API key**

   Edit the `.env` file and add your API key:

   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Restart the dev server**

   If the dev server is already running, restart it to load the new environment variable.

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

---

## 🚀 Quick Start

### Option 1: Local Development with npm

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai_quote_optimizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

#### Available npm Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint to check code quality         |

---

### Option 2: Docker (Production)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai_quote_optimizer
   ```

2. **Set up your API key** (see [API Key Setup](#-api-key-setup) above)

   ```bash
   cp .env.example .env
   # Edit .env and add your VITE_GEMINI_API_KEY
   ```

3. **Build and run with Docker Compose**

   ```bash
   docker compose up --build
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

#### Docker Commands

| Command                        | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `docker compose up --build`    | Build and start the container                 |
| `docker compose up -d --build` | Build and start in detached mode (background) |
| `docker compose down`          | Stop and remove containers                    |
| `docker compose logs -f`       | View container logs                           |

---

### Option 3: Docker (Development with Hot Reload)

For development with hot reload inside Docker:

```bash
docker compose --profile dev up dev
```

Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
ai_quote_optimizer/
├── src/
│   ├── App.tsx              # Main application component
│   ├── QuotationOptimizer.tsx # Core optimizer component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Example environment variables (copy to .env)
├── Dockerfile               # Docker build configuration
├── docker-compose.yml       # Docker Compose configuration
├── nginx.conf               # Nginx configuration for production
├── package.json             # npm dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Google Gemini API** - AI-powered features (sentiment analysis, proposal generation)
- **Nginx** - Production web server (Docker)

---

## 🐳 Docker Details

The Docker setup uses a multi-stage build:

1. **Build Stage**: Uses Node.js Alpine to install dependencies and build the app
2. **Production Stage**: Uses Nginx Alpine to serve the static files

The production container:

- Serves the app on port 80 (mapped to 3000 on host)
- Includes gzip compression for better performance
- Has proper caching headers for static assets
- Supports SPA routing

---

## 🔧 Troubleshooting

### Port already in use

If port 3000 or 5173 is already in use, you can modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8080:80" # Change 3000 to any available port
```

Or for local development, specify a different port:

```bash
npm run dev -- --port 3001
```

### Docker build fails

Make sure Docker has enough resources allocated and try:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

### Node modules issues

Try removing node_modules and reinstalling:

```bash
rm -rf node_modules
npm install
```

---

## 📝 License

This project is private and proprietary.
