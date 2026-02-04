# FDFED-React

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
   - Create a `.env` file in `backend/src/utils/` directory
   - Add your environment variables (MongoDB URI, JWT secrets, API keys, etc.)

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

---

## 📁 Project Structure

This project consists of a backend and frontend setup:

- **`backend/`**: Root directory for the backend.

  - **`node_modules/`**: Contains backend dependencies.
  - **`public/`**: Holds static files served by the backend.
  - **`src/`**: Contains backend source code.
    - **`controllers/`**: Houses logic for handling requests.
    - **`db/`**: Database-related files or configurations.
    - **`middlewares/`**: Middleware functions for request processing.
    - **`models/`**: Data models (e.g., for database schemas).
    - **`routes/`**: Defines API endpoints.
    - **`utils/`**: Utility functions or helpers.
    - **`app.js`**: Main application file.
    - **`constants.js`**: Constant values used across the backend.
    - **`index.js`**: Entry point for the backend server.
  - **`.env` and `.env-sample`**: Environment variable files.
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`.prettierrc` and `.prettierrignore`**: Prettier configuration for code formatting.
  - **`package-lock.json` and `package.json`**: Manage dependencies and scripts.
  - **`Readme.md`**: Project documentation.

- **`frontend/`**: (Based on the previous image, as no new `frontend` details are provided.)
  - **`node_modules/`**: Contains frontend dependencies.
  - **`public/`**: Holds static files like `index.html`.
  - **`src/`**: Contains React source code (e.g., components, styles).
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`eslint.config.js`**: Linting configuration.
  - **`index.html`**: Main HTML file.
  - **`package-lock.json` and `package.json`**: Manage frontend dependencies.
