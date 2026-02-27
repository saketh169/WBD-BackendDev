# WBD - Development

This project consists of a backend and frontend setup. The backend is a Node.js-based server, while the frontend is a React application.

##  How to Run the Application

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally or MongoDB Atlas connection)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - **Backend**: Copy `backend/.env.sample` to `backend/.env` and fill in your MongoDB URI, JWT secret, email credentials, Cloudinary keys, and Google AI API key
   - **Frontend**: Copy `frontend/.env.example` to `frontend/.env` and configure any required API endpoints

4. **Run the backend server:**
   ```bash
   nodemon src/server.js
   ```

   The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
nodemon src/server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Once both servers are running, open your browser and navigate to `http://localhost:5173` to access the application.

## 🚀 Quick Start

For experienced developers:

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment files
cp backend/.env.sample backend/.env
cp frontend/.env.example frontend/.env

# Start both servers (in separate terminals)
cd backend && npm start
cd frontend && npm run dev
```

---

## 📁 Project Structure

This project consists of a backend and frontend setup:

- **`backend/`**: Root directory for the backend.
  - **`.env`**: Environment variables file.
  - **`.env.sample`**: Sample environment variables file.
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`.prettierignore`**: Files to ignore for Prettier formatting.
  - **`.prettierrc`**: Prettier configuration for code formatting.
  - **`logs/`**: Directory for log files (auto-created).
  - **`node_modules/`**: Contains backend dependencies.
  - **`package-lock.json`**: Locks dependency versions.
  - **`package.json`**: Manages dependencies and scripts.
  - **`public/`**: Holds static files served by the backend.
    - **`temp/`**: Temporary file storage.
  - **`Readme.md`**: Backend documentation.
  - **`scripts/`**: Utility and seeding scripts.
    - **`seedChatbot.js`**: Chatbot data seeding script.
    - **`seedDietitians.js`**: Dietitian data seeding script.
    - **`seedSettings.js`**: Settings data seeding script.
  - **`src/`**: Contains backend source code.
    - **`controllers/`**: Request handlers and business logic.
    - **`middlewares/`**: Express middleware functions.
    - **`models/`**: MongoDB data models/schemas.
    - **`routes/`**: API route definitions.
    - **`services/`**: Business logic services.
    - **`utils/`**: Utility functions and helpers.
      - **`db.js`**: Database connection utility.
      - **`.env`**: Environment variables file.
    - **`server.js`**: Main server entry point.

- **`frontend/`**: Root directory for the frontend.
  - **`.env`**: Environment variables file.
  - **`.env.example`**: Example environment variables file.
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`eslint.config.js`**: ESLint configuration for linting.
  - **`index.css`**: Main CSS file.
  - **`index.html`**: Main HTML file.
  - **`node_modules/`**: Contains frontend dependencies.
  - **`package-lock.json`**: Locks dependency versions.
  - **`package.json`**: Manages dependencies and scripts.
  - **`public/`**: Holds static files.
  - **`README.md`**: Frontend documentation.
  - **`src/`**: Contains React source code.
    - **`App.jsx`**: Main App component.
    - **`Layout.jsx`**: Layout wrapper component.
    - **`main.jsx`**: React entry point.
    - **`components/`**: Reusable React components.
      - **`extras/`**: Extra utility components.
      - **`Footer/`**: Footer component.
      - **`Header/`**: Header component.
      - **`Navbar/`**: Navigation bar component.
      - **`Sidebar/`**: Sidebar navigation component.
    - **`contexts/`**: React context providers for state management.
    - **`hooks/`**: Custom React hooks.
    - **`middleware/`**: Middleware functions.
    - **`pages/`**: Page components.
      - **`Activities/`**: Activities page.
      - **`Admin/`**: Admin dashboard pages.
      - **`Appointments/`**: Appointments management.
      - **`Auth/`**: Authentication pages (Login, Register).
      - **`Blog/`**: Blog pages.
      - **`Chat/`**: Chat interface pages.
      - **`ChatBot/`**: AI ChatBot page.
      - **`Consultations/`**: Consultation booking pages.
      - **`Corporate/`**: Corporate/Organization pages.
      - **`Dashboards/`**: User and admin dashboards.
      - **`Error/`**: Error pages (404, 500, etc.).
      - **`HomePages/`**: Home landing pages.
      - **`LabReports/`**: Lab reports page.
      - **`MealPlans/`**: Meal plans and diet pages.
      - **`Payments/`**: Payment processing pages.
      - **`Schedules/`**: Scheduling pages.
      - **`Status/`**: Status/Progress pages.
      - **`Verify/`**: Email/Account verification pages.
    - **`redux/`**: Redux store setup.
      - **`slices/`**: Redux slice definitions.
      - **`store.js`**: Redux store configuration.
    - **`Routes/`**: Routing configuration.
      - **`Routes.jsx`**: Route definitions.
    - **`styles/`**: CSS and styling files.
    - **`utils/`**: Utility functions and helpers.
      - **`axiosInterceptor.js`**: Axios request/response interceptors.
      - **`toastNotifications.js`**: Toast notification utilities.
  - **`vite.config.js`**: Vite build configuration.
