# 📚 Library Management REST API

A clean, beginner-friendly, viva-ready **Library Management REST API** built with Node.js, Express.js, Firebase Admin SDK (Firestore), JWT authentication, bcrypt password hashing, input validation, rate limiting, and Swagger documentation.

---

## 📌 Project Overview

This API manages a college library system supporting two primary roles: **Students** and **Librarians**.

* **Students** can browse/search books, borrow available copies, view their active/past loan history, return borrowed books, and update their profile.
* **Librarians** have full administrative control to manage the book catalog (add, update, delete books), view all system transactions, and manage user accounts (view users, update roles, delete accounts).

---

## 🛠️ Technology Stack

* **Node.js** - JavaScript Runtime Environment
* **Express.js** - Web Framework for REST API
* **Firebase Admin SDK & Firestore** - NoSQL Cloud Database
* **JWT (jsonwebtoken)** - Token-based authentication
* **bcrypt** - Password hashing algorithm
* **express-validator** - Input validation & sanitization
* **express-rate-limit** - API rate limiting (100 requests per 15 mins)
* **Helmet** - Security HTTP headers middleware
* **CORS** - Cross-Origin Resource Sharing
* **Swagger UI & OpenAPI 3.0** - Interactive API Documentation

---

## 📁 Project Structure

```text
library-management-api/
│
├── server.js                 # Express server initialization & middleware stack
├── package.json              # Project dependencies & npm scripts
├── .env                      # Local environment configuration
├── .env.example              # Template for environment variables
├── .gitignore                # Git ignored files
├── README.md                 # Project guide & viva reference
│
├── src/
│   ├── config/
│   │   ├── firebase.js       # Firebase Admin & Firestore initialization
│   │   └── swagger.js        # Swagger UI setup
│   │
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   ├── role.js           # Role-based access control (Student / Librarian)
│   │   ├── logger.js         # Request logger middleware
│   │   ├── rateLimiter.js    # Rate limiting middleware
│   │   ├── validator.js      # Express validation error formatter
│   │   └── errorHandler.js   # Centralized global error handler
│   │
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth routes
│   │   ├── bookRoutes.js     # /api/books routes
│   │   ├── transactionRoutes.js # /api/transactions routes
│   │   └── userRoutes.js     # /api/users routes
│   │
│   ├── controllers/
│   │   ├── authController.js        # Auth logic (register, login, profile)
│   │   ├── bookController.js        # Catalog & search controllers
│   │   ├── transactionController.js # Borrow & return controllers
│   │   └── userController.js        # User administration controllers
│   │
│   ├── models/
│   │   ├── userModel.js      # User collection data operations
│   │   ├── bookModel.js      # Book collection data operations
│   │   └── transactionModel.js # Transaction collection data operations
│   │
│   └── utils/
│       ├── jwt.js            # JWT signing & verification helpers
│       └── validation.js     # express-validator rule chains
│
└── docs/
    └── swagger.yaml          # OpenAPI 3.0 API Specification
```

---

## ⚡ Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=3000

JWT_SECRET=super_secret_jwt_key_library_management_2026
JWT_EXPIRES_IN=1d

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

---

## 🌐 Firebase Firestore Setup Guide

Follow these steps to connect your API to Google Firebase Firestore:

1. **Create Firebase Project**:
   * Go to [Firebase Console](https://console.firebase.google.com/).
   * Click **Add project** and follow instructions.

2. **Enable Firestore Database**:
   * In the left sidebar, navigate to **Build > Firestore Database**.
   * Click **Create database** and select **Start in production mode** or **test mode**.

3. **Generate Service Account Credentials**:
   * Go to **Project Settings ⚙️ > Service accounts**.
   * Select **Node.js** and click **Generate new private key**.
   * A JSON file containing your service account keys will download.

4. **Update `.env`**:
   * `FIREBASE_PROJECT_ID`: `"project_id"` value from JSON.
   * `FIREBASE_CLIENT_EMAIL`: `"client_email"` value from JSON.
   * `FIREBASE_PRIVATE_KEY`: `"private_key"` value from JSON (keep quotes and newline `\n` format intact).

---

## 📖 API Documentation (Swagger UI)

Interactive OpenAPI documentation is mounted at:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

### How to Authenticate in Swagger UI:
1. Register/Login using `/api/auth/login`.
2. Copy the returned `token`.
3. Click the green **Authorize 🔓** button at the top right of the Swagger UI page.
4. Enter token as: `Bearer <YOUR_JWT_TOKEN>`.
5. Click **Authorize**. All protected endpoints can now be executed directly from the browser!

---

## 🔐 API Endpoint Reference Table

| Method | Endpoint | Description | Auth Required | Allowed Role |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student or librarian | ❌ Public | Anyone |
| `POST` | `/api/auth/login` | Login & receive JWT token | ❌ Public | Anyone |
| `GET` | `/api/auth/profile` | View logged-in user profile | ✅ Yes | Student / Librarian |
| `PUT` | `/api/auth/profile` | Update profile (name, email, password) | ✅ Yes | Student / Librarian |
| `GET` | `/api/books` | List books (filters: category, author, status) | ❌ Public | Anyone |
| `GET` | `/api/books/search` | Search books (`?q=term`) | ❌ Public | Anyone |
| `GET` | `/api/books/:id` | Get book details by ID | ❌ Public | Anyone |
| `POST` | `/api/books` | Add new book to catalog | ✅ Yes | 👑 Librarian |
| `PUT` | `/api/books/:id` | Update book details / quantity | ✅ Yes | 👑 Librarian |
| `DELETE` | `/api/books/:id` | Delete book from catalog | ✅ Yes | 👑 Librarian |
| `POST` | `/api/books/:id/borrow` | Borrow book (14-day loan period) | ✅ Yes | 🎓 Student |
| `POST` | `/api/books/:id/return` | Return borrowed book | ✅ Yes | 🎓 Student |
| `GET` | `/api/transactions/my` | View personal borrowing history | ✅ Yes | Student / Librarian |
| `GET` | `/api/transactions` | View all system transactions | ✅ Yes | 👑 Librarian |
| `GET` | `/api/users` | List all registered users | ✅ Yes | 👑 Librarian |
| `GET` | `/api/users/:id` | Get user account details | ✅ Yes | 👑 Librarian |
| `PUT` | `/api/users/:id/role` | Change user role (`student`/`librarian`) | ✅ Yes | 👑 Librarian |
| `DELETE` | `/api/users/:id` | Delete user account | ✅ Yes | 👑 Librarian |

---

## 🧪 Postman & Manual Testing Workflow

1. **Register Librarian**:
   `POST /api/auth/register` with body:
   ```json
   {
     "name": "Admin Librarian",
     "email": "librarian@library.com",
     "password": "password123",
     "role": "librarian"
   }
   ```

2. **Login Librarian**:
   `POST /api/auth/login` with body:
   ```json
   {
     "email": "librarian@library.com",
     "password": "password123"
   }
   ```
   Save the returned `token`.

3. **Add Books (as Librarian)**:
   `POST /api/books` with header `Authorization: Bearer <TOKEN>`:
   ```json
   {
     "title": "The Alchemist",
     "author": "Paulo Coelho",
     "isbn": "9780061122415",
     "category": "Fiction",
     "quantity": 3
   }
   ```

4. **Register & Login Student**:
   Register a student account (`role: "student"`), login, and save the student token.

5. **Borrow Book (as Student)**:
   `POST /api/books/<BOOK_ID>/borrow` with Student `Bearer <TOKEN>`.
   Quantity decreases by 1, transaction created with 14 days due date.

6. **Return Book (as Student)**:
   `POST /api/books/<BOOK_ID>/return` with Student `Bearer <TOKEN>`.
   Quantity increases by 1, transaction marked `returned`.

---

## 🎓 Viva Questions & Key Explanations

1. **Why use JWT authentication?**
   JWT is stateless; the server does not need session storage. The client sends the token in the `Authorization: Bearer <token>` header, and the server verifies its signature.

2. **How is password security handled?**
   Passwords are never stored in plain text. `bcrypt` adds a unique salt and hashes the password before storing in Firestore.

3. **How does quantity and status consistency work?**
   When quantity > 0, status is `available`. When quantity reaches 0 upon borrowing, status updates to `borrowed`. When returned, status becomes `available`. Atomic Firestore transactions guarantee quantity updates stay safe.

4. **How are roles enforced?**
   Higher-order middleware `requireRole('librarian')` checks the authenticated user's role extracted from the verified JWT payload (`req.user.role`). If unauthorized, it halts execution with `403 Forbidden`.
