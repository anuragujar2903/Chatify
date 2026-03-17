# 💬 Chatify — AI-Powered Real-Time Chat Application

<div align="center">

A full-stack real-time chat application built with the **MERN stack** (MongoDB, Express, React, Node.js) featuring **AI-powered chat intelligence** using Groq's Llama 3.1 model.

**Real-time messaging** · **AI Summarization** · **Smart Replies** · **Sentiment Analysis** · **Voice-to-Text**

</div>

---

## ✨ Features

### 💬 Core Chat
| Feature | Description |
|---------|-------------|
| **Real-time messaging** | Instant message delivery via Socket.IO |
| **Image sharing** | Upload & send images via Cloudinary CDN |
| **Online status** | See who's online in real-time |
| **Typing indicators** | Know when someone is typing |
| **Notification sounds** | Audio alerts for new messages |

### 🤖 AI-Powered Features (Groq + Llama 3.1)
| Feature | Description |
|---------|-------------|
| **✨ Chat Summarization** | Summarize entire conversations in 10+ languages |
| **⚡ Smart Replies** | Gmail-style AI reply suggestions after every message |
| **😊 Sentiment Analysis** | Real-time mood detection with emoji indicators |
| **🔍 AI Chat Search** | Ask natural language questions about chat history |
| **📋 Meeting Notes** | Auto-generate structured meeting minutes with agenda, decisions & action items |
| **🎙️ Voice-to-Text** | Browser speech recognition → text input |
| **🔑 Keyword Highlights** | Auto-highlight dates, deadlines, and tasks in messages |

### 🔐 Security & Auth
| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure cookie-based auth |
| **Password hashing** | bcrypt with salt rounds |
| **Rate limiting** | Arcjet-powered API protection |
| **Socket auth** | WebSocket connections require JWT |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Pages   │  │Components│  │  Store   │  │ Hooks  │  │
│  │ Chat     │  │ ChatHead │  │ Zustand  │  │ Sound  │  │
│  │ Login    │  │ MsgInput │  │ authStore│  │        │  │
│  │ Signup   │  │ AI Modal │  │ chatStore│  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│         │              │            │                    │
│         └──────────────┼────────────┘                    │
│                        │ HTTP (Axios) + WebSocket        │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   SERVER (Express + Node.js)                │
│  ┌────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ Middleware  │  │ Controllers │  │     Libraries      │  │
│  │ JWT Auth   │  │ auth.ctrl   │  │ Socket.IO (RT)     │  │
│  │ Arcjet RL  │  │ message.ctrl│  │ Cloudinary (imgs)  │  │
│  │ Socket Auth│  │  - send     │  │ Groq SDK (AI)      │  │
│  └────────────┘  │  - summarize│  │ Resend (emails)    │  │
│                  │  - smartReply│  │ Mongoose (DB)      │  │
│                  │  - sentiment│  │ bcrypt (hash)       │  │
│                  │  - aiSearch │  │ JWT (tokens)        │  │
│                  │  - notes    │  └────────────────────┘  │
│                  └─────────────┘                           │
│         │                              │                   │
└─────────┼──────────────────────────────┼───────────────────┘
          │                              │
          ▼                              ▼
   ┌─────────────┐              ┌──────────────┐
   │  MongoDB    │              │  Groq Cloud  │
   │  Atlas      │              │  Llama 3.1   │
   │  Users      │              │  8B Instant  │
   │  Messages   │              └──────────────┘
   └─────────────┘
```

---

## 📁 Project Structure

```
chatify-master/
├── package.json                # Root: build & start scripts
│
├── backend/
│   ├── .env                    # Environment variables
│   ├── .env.example            # Template for env vars
│   ├── package.json
│   └── src/
│       ├── server.js           # Express app entry point
│       ├── controllers/
│       │   ├── auth.controller.js      # signup, login, logout, updateProfile
│       │   └── message.controller.js   # send, summarize, smartReplies,
│       │                               # sentiment, aiSearch, meetingNotes
│       ├── models/
│       │   ├── User.js         # email, fullName, password, profilePic
│       │   └── Message.js      # senderId, receiverId, text, image
│       ├── routes/
│       │   ├── auth.route.js   # /api/auth/*
│       │   └── message.route.js # /api/messages/*
│       ├── middleware/
│       │   ├── auth.middleware.js       # JWT verification
│       │   ├── arcjet.middleware.js     # Rate limiting
│       │   └── socket.auth.middleware.js # WebSocket JWT auth
│       ├── lib/
│       │   ├── socket.js       # Socket.IO server + online users
│       │   ├── db.js           # MongoDB connection
│       │   ├── env.js          # Centralized env config
│       │   ├── cloudinary.js   # Image upload config
│       │   ├── arcjet.js       # Rate limiter config
│       │   ├── resend.js       # Email service config
│       │   └── utils.js        # JWT token generator
│       └── emails/
│           └── emailHandlers.js # Welcome email templates
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Router + auth guard
│       ├── index.css           # Global styles
│       ├── pages/
│       │   ├── ChatPage.jsx    # Main chat page
│       │   ├── LoginPage.jsx   # Login form
│       │   └── SignUpPage.jsx  # Registration form
│       ├── store/
│       │   ├── useAuthStore.js # Auth state (Zustand)
│       │   └── useChatStore.js # Chat + AI state (Zustand)
│       ├── components/
│       │   ├── ChatContainer.jsx         # Message list + keyword highlights
│       │   ├── ChatHeader.jsx            # User info + AI action buttons
│       │   ├── MessageInput.jsx          # Text input + image + voice
│       │   ├── SmartReplies.jsx          # ⚡ AI quick reply chips
│       │   ├── SentimentBanner.jsx       # 😊 Mood indicator banner
│       │   ├── SummaryModal.jsx          # ✨ Chat summary modal
│       │   ├── AIChatSearch.jsx          # 🔍 AI search modal
│       │   ├── MeetingNotesModal.jsx     # 📋 Meeting notes modal
│       │   ├── VoiceRecorder.jsx         # 🎙️ Speech-to-text button
│       │   ├── ChatsList.jsx             # Chat partner list
│       │   ├── ContactList.jsx           # All contacts list
│       │   ├── ActiveTabSwitch.jsx       # Chats/Contacts tab toggle
│       │   ├── ProfileHeader.jsx         # User profile section
│       │   └── ...                       # Loading skeletons, placeholders
│       ├── hooks/
│       │   └── useKeyboardSound.js       # Typing sound effects
│       └── lib/
│           └── axios.js                  # Axios instance config
```

---

## 🔗 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/signup` | Create new account | ❌ |
| `POST` | `/login` | Login & get JWT cookie | ❌ |
| `POST` | `/logout` | Clear JWT cookie | ❌ |
| `PUT` | `/update-profile` | Upload profile picture | ✅ |
| `GET` | `/check` | Verify auth status | ✅ |

### Message Routes (`/api/messages`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/contacts` | Get all users | ✅ |
| `GET` | `/chats` | Get chat partners | ✅ |
| `GET` | `/:id` | Get messages with user | ✅ |
| `POST` | `/send/:id` | Send message | ✅ |
| `POST` | `/summarize/:id` | AI chat summary | ✅ |
| `POST` | `/smart-replies/:id` | AI reply suggestions | ✅ |
| `POST` | `/sentiment/:id` | AI sentiment analysis | ✅ |
| `POST` | `/ai-search/:id` | AI chat search | ✅ |
| `POST` | `/meeting-notes/:id` | AI meeting notes | ✅ |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Authenticate & register socket |
| `newMessage` | Server → Client | Real-time message delivery |
| `getOnlineUsers` | Server → Client | Updated online users list |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20.0.0 or higher
- **MongoDB** (Atlas or local)
- **Cloudinary** account (image uploads)
- **Groq** API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chatify.git
cd chatify-master
```

### 2. Setup backend environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your values:
```env
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatify
NODE_ENV=development
JWT_SECRET=your_super_secret_key
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_secret
ARCJET_KEY=ajkey_xxxxxxxxxxxx
ARCJET_ENV=development
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

### 3. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
> Starts on `http://localhost:3000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> Starts on `http://localhost:5173`

### 5. Production build
```bash
# From root directory
npm run build   # Builds both backend & frontend
npm start       # Serves production build
```

---

## 🧠 AI Features Flow

```
User clicks AI button
        │
        ▼
  Frontend Store
  (useChatStore.js)
        │ POST /api/messages/{action}/:userId
        ▼
  Backend Controller
  (message.controller.js)
        │
        ├─ 1. Fetch messages from MongoDB
        ├─ 2. Format as transcript
        ├─ 3. Send to Groq API (Llama 3.1 8B)
        └─ 4. Parse response → return JSON
               │
               ▼
        Frontend renders
        premium UI modal
```

### AI Model Details
| Property | Value |
|----------|-------|
| **Provider** | Groq Cloud |
| **Model** | `llama-3.1-8b-instant` |
| **Latency** | ~300-500ms (Groq is the fastest LLM API) |
| **Cost** | Free tier available |
| **Languages** | 10 supported (English, Hindi, Spanish, French, German, Japanese, Chinese, Korean, Arabic, Portuguese) |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.IO** | Real-time bidirectional communication |
| **Groq SDK** | AI inference (Llama 3.1) |
| **JWT + bcrypt** | Authentication & password hashing |
| **Cloudinary** | Image upload & CDN |
| **Arcjet** | Rate limiting & bot protection |
| **Resend** | Transactional emails |
| **Nodemon** | Hot reload in development |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **Zustand** | State management |
| **Tailwind CSS** | Utility-first styling |
| **DaisyUI** | UI components (chat bubbles, avatars) |
| **Socket.IO Client** | Real-time connection |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notification toasts |
| **Axios** | HTTP client |

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**Built with ❤️ using the MERN Stack + AI**

</div>
