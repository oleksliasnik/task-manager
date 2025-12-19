# Task Manager 

A modern, full-stack Task Management application featuring a responsive Vue 3 frontend and a robust Node.js/Express backend. Designed for seamless task management with administrative oversight.

## Project Structure

- **`/client`**: Vue 3 + Vite + TypeScript frontend.
- **`/server`**: Node.js + Express + TypeScript + MongoDB backend.
- **[`/docs/api.md`](./docs/api.md)**: Detailed API documentation.

## Tech Stack

| Frontend | Backend |
| :--- | :--- |
| **Vue 3** (Composition API) | **Node.js** & **Express 5** |
| **TypeScript** | **TypeScript** |
| **Pinia** (State Management) | **MongoDB** & **Mongoose** |
| **Vite** (Build Tool) | **Supabase Storage** (Avatars) |
| **Vue Router** | **JWT & BCrypt** (Auth) |

## Key Features

- **Interactive Dashboard**: Drag-and-drop task reordering and filtering.
- **Authentication**: Secure registration, login, and profile management with avatar uploads.
- **Task Management**: Full CRUD operations with status tracking (Pending/Completed).
- **Admin Interface**: Comprehensive management of all users and tasks across the system.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Quick Start

### Prerequisites
- **Node.js** (v20+)
- **MongoDB** instance (Atlas or Local)
- **Supabase** project (for avatar storage)

### Installation & Setup

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd task-manager
   # Install dependencies in both folders
   cd client && npm install
   cd ../server && npm install
   ```

2. **Backend Configuration**:
   Create a `.env` file in `/server` with your credentials:
   ```env
   DB_USER=...
   DB_PASSWORD=...
   DB_CLUSTER=...
   DB_NAME=task-manager
   JWT_SECRET=...
   SUPABASE_URL=...
   SUPABASE_KEY=...
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Configuration**:
   Create a `.env.local` file in `/client` (or use `.env`):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Run the Apps**:
   In two separate terminals:
   - **Frontend**: `cd client && npm run dev` (development) or `npm run build && npm start` (production preview)
   - **Backend**: `cd server && npm run dev` (development) or `npm run build && npm start` (production)

## License

This project is [ISC](LICENSE) licensed.
