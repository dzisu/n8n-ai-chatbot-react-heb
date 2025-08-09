# N8N AI Chatbot React

A modern, responsive AI chatbot interface built with React, TypeScript, and Tailwind CSS that integrates with n8n workflows via webhooks.

## Features

- 🤖 **AI Integration**: Connect to any AI service through n8n webhooks
- 💬 **Multi-Session Chat**: Create, manage, and switch between multiple chat sessions
- 🎨 **Modern UI**: Beautiful gradient design with dark theme
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 💾 **Persistent Storage**: Chat sessions are saved in localStorage
- 📥 **Export Functionality**: Download chat sessions as JSON files
- ⚡ **Real-time Updates**: Live typing indicators and smooth message flow
- 🔧 **Configurable**: Easy webhook URL configuration

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **N8N** webhook integration

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatHeader.tsx   # Header component
│   ├── ChatInput.tsx    # Message input component
│   ├── ChatMessages.tsx # Messages display component
│   ├── ChatSidebar.tsx  # Sidebar with sessions and settings
│   ├── EmptyState.tsx   # Empty state component
│   ├── MessageBubble.tsx # Individual message component
│   └── TypingIndicator.tsx # Typing indicator component
├── hooks/               # Custom React hooks
│   ├── useChat.ts       # Chat functionality hook
│   └── useChatSessions.ts # Session management hook
├── services/            # Service layer
│   ├── n8nService.ts    # N8N API integration
│   └── storageService.ts # Local storage management
├── types/               # TypeScript type definitions
│   └── chat.ts          # Chat-related types
├── N8NChatbot.tsx       # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- An n8n instance with a webhook endpoint

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd n8n-ai-chatbot-react
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Configuration

### N8N Webhook Setup

1. **Create an n8n workflow** with a webhook trigger
2. **Configure your AI service** (OpenAI, Google AI, etc.) in the workflow
3. **Set the webhook URL** in the chatbot interface
4. **Test the connection** by sending a message

### Example N8N Workflow Structure

```
Webhook Trigger → AI Service (OpenAI/Google AI) → Response
```

The webhook should:

- Accept POST requests with JSON payload: `{message: string, sessionId: string, timestamp: string}`
- Return JSON response: `{response: string}` or `{message: string}`

## Testing

### Manual Testing

1. **Start the application** (`npm run dev`)
2. **Configure webhook URL** in the sidebar
3. **Send test messages** to verify AI responses
4. **Test session management**:
   - Create new sessions
   - Switch between sessions
   - Delete sessions
5. **Test export functionality**
6. **Test responsive design** on different screen sizes

### Type Checking

```bash
npm run type-check
```

## API Integration

The application expects your n8n webhook to:

**Request Format:**

```json
{
  "message": "User's message",
  "sessionId": "unique-session-id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response Format:**

```json
{
  "response": "AI's response message"
}
```

## Features Details

### Chat Sessions

- Create multiple independent chat sessions
- Automatic session title generation from first message
- Persistent storage across browser sessions
- Session switching with message history preservation

### Error Handling

- Network error handling with user-friendly messages
- Graceful degradation when webhook is unavailable
- Input validation and sanitization

### UI/UX Features

- Smooth scrolling to new messages
- Loading indicators during AI processing
- Responsive design for all screen sizes
- Keyboard shortcuts (Enter to send)
- Auto-focus on input field

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Webhook connection failed:**

   - Verify your n8n instance is running
   - Check the webhook URL is correct
   - Ensure CORS is properly configured in n8n

2. **Messages not appearing:**

   - Check browser console for errors
   - Verify the webhook response format
   - Check network tab for API calls

3. **Sessions not saving:**
   - Ensure localStorage is enabled in your browser
   - Check for browser storage quota limits

### Support

For issues and questions, please open an issue in the repository.
