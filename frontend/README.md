# PDF Password Cracker - Frontend

React SPA frontend for the PDF password cracker application.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components (light mode only)

## Development

```bash
# Install dependencies
npm install

# Start dev server (proxies API requests to localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

1. **File Upload** - Drag-and-drop or click to upload password-protected PDFs
2. **Status Polling** - Automatically polls backend every 2 seconds for processing status
3. **Download** - Download decrypted PDF when ready

## API Integration

The frontend communicates with the backend API at `/api/pdf`:

- `POST /api/pdf/upload` - Upload PDF file
- `GET /api/pdf/status/:filename` - Get processing status
- `GET /api/pdf/results/:filename` - Download decrypted PDF

## Environment Variables

Create a `.env` file to override the API base URL:

```
VITE_API_BASE_URL=http://localhost:8080/api/pdf
```

By default, it uses relative paths (`/api/pdf`).
