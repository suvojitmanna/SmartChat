# SmartChat - AI-Powered Chat & Image Generation

A full-stack MERN application that combines real-time chat functionality with AI-powered utilities like text generation and image creation. Built with modern technologies and designed for seamless user experience.</br>
👉 Live Preview: https://smart-chat-client.vercel.app

## 🌟 Features

- **🤖 AI Chat Assistant** - Powered by Google's Generative AI for intelligent conversations
- **🎨 Image Generation** - Generate and share images using AI
- **🏘️ Community Gallery** - Browse and explore images created by the community
- **💳 Credit System** - Flexible credit-based pricing model with multiple plans
- **🔐 Secure Authentication** - User registration and login with JWT tokens
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🌙 Dark Mode** - Built-in dark mode toggle for comfortable viewing
- **⚡ Real-time Updates** - WebSocket-enabled for instant messaging
- **✨ Rich Text Editing** - Markdown support with syntax highlighting for code blocks

## 🛠️ Tech Stack

### Frontend

- **React 19.2.0** - UI library
- **Vite 7.2.4** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **React Markdown** - Markdown rendering
- **Prismjs** - Syntax highlighting
- **Moment.js** - Date/time formatting
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend

- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **Google Generative AI** - AI capabilities (@google/genai, @google/generative-ai)
- **JWT** - Secure authentication
- **BCryptjs** - Password hashing
- **Stripe** - Payment processing
- **ImageKit** - Image hosting and optimization
- **Svix** - Webhook management
- **CORS** - Cross-origin support

## 📁 Project Structure

```
SmartChat/
├── client/                  # React frontend
│   ├── src/
│   │   ├── component/      # React components
│   │   │   ├── ChatBox.jsx
│   │   │   ├── Message.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Credits.jsx
│   │   │   └── Loading.jsx
│   │   ├── context/        # React Context
│   │   │   └── Appcontext.jsx
│   │   ├── assets/         # Static assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                  # Express backend
    ├── config/             # Configuration files
    │   ├── db.js
    │   ├── imageKit.js
    │   └── openAi.js
    ├── controller/         # Route controllers
    │   ├── chatController.js
    │   ├── creditController.js
    │   ├── messageController.js
    │   ├── usercontroller.js
    │   └── webhook.js
    ├── middlewares/        # Express middlewares
    │   └── auth.js
    ├── models/             # Mongoose models
    │   ├── chat.js
    │   ├── transition.js
    │   └── user.js
    ├── routes/             # API routes
    │   ├── chatRoutes.js
    │   ├── creditRoutes.js
    │   ├── messageRoutes.js
    │   └── userRoutes.js
    ├── index.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Google Generative AI API key
- Stripe account (for payments)
- ImageKit account (for image storage)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartChat
```

#### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_generative_ai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
SVIX_WEBHOOK_SECRET=your_svix_webhook_secret
PORT=5000
```

#### 3. Setup Frontend

```bash
cd ../client
npm install
```

Create a `.env.local` file in the client directory:

```env
VITE_API_URL=http://localhost:5000
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### Running the Application

#### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

#### Production Build

**Frontend:**

```bash
cd client
npm run build
```

**Backend:**

```bash
cd server
npm start
```

## 📖 API Documentation

### Authentication Routes

- `POST /api/user/register` - Register a new user
- `POST /api/user/login` - Login user
- `POST /api/user/logout` - Logout user

### Chat Routes

- `GET /api/chat` - Get all chats for the user
- `POST /api/chat` - Create a new chat
- `DELETE /api/chat/:id` - Delete a chat

### Message Routes

- `GET /api/message/:chatId` - Get messages for a chat
- `POST /api/message` - Send a new message
- `POST /api/message/generate` - Generate AI message

### Credit Routes

- `GET /api/credit` - Get user credits
- `POST /api/credit/buy` - Purchase credits (Stripe integration)

## 🎨 UI Features

- **Modern Design** - Clean, intuitive interface with glassmorphism effects
- **Gradient Backgrounds** - Beautiful gradient overlays
- **Smooth Animations** - Fade-in effects and transitions
- **Responsive Grid** - Flexible layout that adapts to screen size
- **Interactive Components** - Hover effects and active states
- **Accessibility** - Semantic HTML and keyboard navigation

## 💳 Credit System

Users can purchase different credit plans:

- **Free Tier** - Limited credits for trying the service
- **Standard** - Mid-tier pricing with reasonable credits
- **Pro** - Premium tier with maximum credits and priority support

## 🔐 Authentication

- User registration and login with email/password
- JWT-based session management
- Secure password hashing with bcryptjs
- Protected API routes with auth middleware

## 🌙 Theme Support

The application includes built-in dark mode with:

- System preference detection
- Manual toggle in settings
- Persistent theme preference
- Smooth transitions between themes

## 📱 Responsive Breakpoints

- **Mobile** - Below 640px (max-sm)
- **Tablet** - 640px to 1024px (md, lg)
- **Desktop** - 1024px and above (xl, 2xl)

## 🧪 Testing

```bash
cd client
npm run lint
```

## 📦 Deployment

### Frontend (Vercel)

The project includes a `vercel.json` configuration for easy deployment to Vercel.

```bash
vercel deploy
```

### Backend

Deploy the server to platforms like Heroku, Railway, or your preferred hosting provider.

## 🔄 Available Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify IP whitelist on MongoDB Atlas

### API Key Issues

- Verify all `.env` keys are correctly set
- Check API key validity and permissions
- Ensure CORS is enabled for frontend URL

### Build Issues

- Clear `node_modules` and reinstall: `npm ci`
- Clear build cache: `rm -rf dist` (client) or `npm cache clean --force`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Author

Built with ❤️ by the SmartChat Team

## 📞 Support

For issues, questions, or feedback, please open an issue on the repository or contact the development team.

---

**Happy Chatting! 🚀**
