# Todo List Application

A beautiful, modern todo list web application with full CRUD operations, built with HTML, CSS, JavaScript, and SQLite.

## ✨ Features

- ✅ **Create** new todos with a clean, intuitive interface
- 📖 **Read** all todos with persistent storage
- ✏️ **Update** todo text and completion status
- 🗑️ **Delete** todos with smooth animations
- 💾 **SQLite Database** for data persistence
- 🎨 **Premium UI** with glassmorphism effects
- 📊 **Real-time Statistics** (Total, Active, Completed)
- ⚡ **No Page Reloads** - Dynamic UI updates
- 🎯 **Error Handling** for better UX

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the project directory:
   ```bash
   cd TodoApp
   ```

2. Install backend dependencies:
   ```bash
   npm run install-backend
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The server will run on port 3000 and automatically serve the frontend files.

## 📁 Project Structure

```
TodoApp/
├── backend/
│   ├── server.js          # Express server with API routes
│   ├── database.js        # SQLite database initialization
│   ├── todos.db          # SQLite database file (auto-generated)
│   └── package.json      # Backend dependencies
├── public/
│   ├── index.html        # Main UI
│   ├── styles.css        # Premium styling
│   └── app.js            # Frontend JavaScript
├── package.json          # Root package.json
└── README.md            # This file
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api/todos`

- `POST /api/todos` - Create a new todo
- `GET /api/todos` - Get all todos
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## 🎨 Design Features

- **Glassmorphism Effects** - Modern, translucent UI elements
- **Smooth Animations** - Hover effects and transitions
- **Gradient Backgrounds** - Eye-catching color schemes
- **Responsive Design** - Works on all screen sizes
- **Google Fonts** - Professional typography with Inter font

## 🛠️ Technologies Used

**Backend:**
- Node.js
- Express.js
- better-sqlite3
- CORS

**Frontend:**
- HTML5
- CSS3 (with modern features)
- Vanilla JavaScript (ES6+)

## 📝 Usage

1. **Add a Todo**: Type your task in the input field and click "Add Task" or press Enter
2. **Complete a Todo**: Click the checkbox next to the task
3. **Edit a Todo**: Click the edit icon (✏️), modify the text, and save
4. **Delete a Todo**: Click the delete icon (🗑️)

## 🔍 Testing

To verify all features work correctly:

1. **CREATE**: Add several todos
2. **READ**: Refresh the page - todos should persist
3. **UPDATE**: Edit todo text and toggle completion
4. **DELETE**: Remove todos

All operations update the UI instantly without page reloads!

## 📄 License

ISC

