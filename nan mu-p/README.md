# 🎓 AI FAQ Assistant — Naan Mudhalvan Academic Project

An intelligent, full-stack Academic FAQ Assistant and Knowledge Management System built for students, faculty, and administrators. Powered by **Node.js, Express, MongoDB, and an intelligent NLP/keyword matching AI engine**.

---

## 🌟 Key Features

### 🤖 1. Intelligent AI FAQ Search & Assistant
- **Contextual Matching**: Natural language query matching using keyword tokenization, TF-IDF inspired relevance scoring, and category prioritization.
- **Instant Answers**: Provides direct answers with confidence ratings and related follow-up suggestions.
- **Categorized Knowledge Base**: 9 pre-configured academic domains:
  - *General, College, Courses, Exams, Fees, Admission, Placements, Scholarships, and Technical Support*.

### 🔐 2. Authentication & Role-Based Access Control (RBAC)
- **JWT (JSON Web Token)** secure session handling.
- **Password Hashing** with `bcryptjs`.
- Distinct roles:
  - **Student / User**: Search FAQs, ask AI assistant, filter by categories, view personalized dashboard.
  - **Administrator**: Full CRUD access to FAQs, categories, analytics, and user account management.

### 📊 3. Interactive Dashboards & Admin Management
- **Student Dashboard**: Quick access to top queries, category browsing, and interactive search.
- **Admin Control Panel**: Add, edit, and delete FAQs and categories with real-time feedback.
- **Auto-Seeding & Zero-Config Setup**: Automatically initializes default categories, admin/student accounts, and comprehensive sample questions on first run.
- **MongoDB In-Memory Fallback**: Seamless fallback to `mongodb-memory-server` if local MongoDB is not running.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18+) |
| **Server Framework** | Express.js 4.x |
| **Database** | MongoDB & Mongoose ODM (with in-memory fallback) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs, CORS |
| **Frontend UI** | HTML5, Modern Vanilla CSS, Bootstrap 5, FontAwesome 6 |
| **Typography** | Plus Jakarta Sans (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Optional: the app automatically provides an in-memory database fallback)

### Installation & Setup

1. **Navigate to the Project Directory**:
   ```bash
   cd "e:\nan mu-p"
   ```

2. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Verify or edit `.env` in the root folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai_faq_assistant
   JWT_SECRET=naan_mudhalvan_ai_faq_secret_key_2026_super_secure
   NODE_ENV=development
   ```

4. **Start the Application**:
   ```bash
   npm start
   ```
   *For development with auto-reload:*
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Open [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 🔑 Default Login Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` | Full Admin Dashboard & CRUD |
| **Student** | `student@example.com` | `Student@123` | AI Assistant & Student Portal |

> *Note: You can also register a new student account using the Registration page.*

---

## 📂 Project Directory Structure

```text
nan mu-p/
├── public/                     # Frontend client assets
│   ├── css/
│   │   └── style.css           # Custom modern responsive styling
│   ├── js/
│   │   ├── admin.js            # Admin CRUD & management handlers
│   │   ├── ai.js               # AI assistant query & chat UI
│   │   ├── auth.js             # Login, registration & JWT handler
│   │   ├── dashboard.js        # Student dashboard logic
│   │   └── main.js             # Shared navigation & global functions
│   ├── admin.html              # Admin panel interface
│   ├── ai-assistant.html       # AI interactive chat interface
│   ├── dashboard.html          # Student dashboard view
│   ├── index.html              # Landing page & FAQ explorer
│   ├── login.html              # User & admin login page
│   └── register.html           # New student registration page
├── src/                        # Backend application source code
│   ├── config/
│   │   └── db.js               # MongoDB connection & memory fallback
│   ├── controllers/            # Request handlers
│   │   ├── aiController.js     # AI query processing
│   │   ├── authController.js   # User registration & login
│   │   ├── categoryController.js # Category operations
│   │   ├── faqController.js    # FAQ CRUD operations
│   │   └── userController.js   # User management
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & role validation
│   │   └── errorMiddleware.js  # Centralized error handler
│   ├── models/                 # Mongoose schemas
│   │   ├── Category.js
│   │   ├── FAQ.js
│   │   └── User.js
│   ├── routes/                 # Express API routes
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── faqRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── aiEngine.js         # Keyword tokenization & matching algorithm
│   ├── app.js                  # Express middleware & route configuration
│   ├── seed.js                 # Standalone database seed script
│   └── server.js               # Server entry point & auto-seeder
├── .env                        # Local environment configuration
├── .env.example                # Sample environment template
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Fetch current user profile (Protected)

### AI Assistant (`/api/ai`)
- `POST /api/ai/ask` — Submit query to AI engine and get matched answers + confidence score

### FAQs (`/api/faqs`)
- `GET /api/faqs` — List all FAQs (supports `?category=` and `?search=`)
- `GET /api/faqs/:id` — Get FAQ by ID
- `POST /api/faqs` — Create a new FAQ (Admin only)
- `PUT /api/faqs/:id` — Update an existing FAQ (Admin only)
- `DELETE /api/faqs/:id` — Delete an FAQ (Admin only)

### Categories (`/api/categories`)
- `GET /api/categories` — Retrieve all categories
- `POST /api/categories` — Create category (Admin only)
- `DELETE /api/categories/:id` — Remove category (Admin only)

---

## 🎯 Academic Submission / Viva Highlights

When presenting this project for **Naan Mudhalvan**:
1. **Problem Statement**: Students often face delays receiving standard information on admissions, examinations, fees, and campus amenities.
2. **Solution**: A centralized, web-based AI assistant that delivers real-time, verified institutional answers 24/7.
3. **Core Innovation**: Custom AI tokenization and relevance scoring algorithm combined with real-time admin content curation.
4. **Resilience**: Zero-setup demonstration mode with built-in auto-seeding and automated MongoDB fallback.
