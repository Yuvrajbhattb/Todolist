const express = require('express');
const cors = require('cors');
const path = require('path');
const dbModule = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database before starting server
let dbReady = false;

dbModule.initDatabase().then(() => {
    dbReady = true;
    console.log('✅ Database ready for queries');
}).catch(error => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
});

// Middleware to check if database is ready
function checkDb(req, res, next) {
    if (!dbReady) {
        return res.status(503).json({ error: 'Database not ready' });
    }
    next();
}

// ==================== API ROUTES ====================

// CREATE - Add a new todo
app.post('/api/todos', checkDb, (req, res) => {
    try {
        const { task } = req.body;

        // Validate input
        if (!task || task.trim() === '') {
            return res.status(400).json({ error: 'Task cannot be empty' });
        }

        // Insert into database
        const lastId = dbModule.executeUpdate(
            'INSERT INTO todos (task, completed) VALUES (?, ?)',
            [task.trim(), 0]
        );

        // Return the created todo
        const newTodo = {
            id: lastId,
            task: task.trim(),
            completed: 0
        };

        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// READ - Get all todos
app.get('/api/todos', checkDb, (req, res) => {
    try {
        const todos = dbModule.getAllRows('SELECT * FROM todos ORDER BY id DESC');
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// UPDATE - Update a todo
app.put('/api/todos/:id', checkDb, (req, res) => {
    try {
        const { id } = req.params;
        const { task, completed } = req.body;

        // Enhanced logging for debugging
        console.log('📝 UPDATE Request:');
        console.log('  - ID:', id);
        console.log('  - Body:', JSON.stringify(req.body));

        // Build dynamic update query based on provided fields
        let updates = [];
        let values = [];

        if (task !== undefined) {
            if (task.trim() === '') {
                console.log('❌ Validation failed: Task cannot be empty');
                return res.status(400).json({ error: 'Task cannot be empty' });
            }
            updates.push('task = ?');
            values.push(task.trim());
        }

        if (completed !== undefined) {
            updates.push('completed = ?');
            values.push(completed ? 1 : 0);
        }

        if (updates.length === 0) {
            console.log('❌ Validation failed: No fields to update');
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;

        // Log SQL query details
        console.log('  - SQL:', sql);
        console.log('  - Values:', values);

        dbModule.executeUpdate(sql, values);

        // Fetch and return the updated todo
        const updatedTodo = dbModule.getAllRows('SELECT * FROM todos WHERE id = ?', [id]);

        if (updatedTodo.length === 0) {
            console.log('❌ Todo not found with ID:', id);
            return res.status(404).json({ error: 'Todo not found' });
        }

        console.log('✅ Todo updated successfully:', updatedTodo[0]);
        res.json(updatedTodo[0]);
    } catch (error) {
        console.error('❌ Error updating todo:');
        console.error('  - Error:', error.message);
        console.error('  - Stack:', error.stack);
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

// DELETE - Delete a todo
app.delete('/api/todos/:id', checkDb, (req, res) => {
    try {
        const { id } = req.params;

        // Check if todo exists
        const existing = dbModule.getAllRows('SELECT * FROM todos WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Delete the todo
        dbModule.executeUpdate('DELETE FROM todos WHERE id = ?', [id]);

        res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

// ==================== SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 API endpoints available at http://localhost:${PORT}/api/todos`);
    console.log(`💡 Open your browser to start using the app!`);
});
