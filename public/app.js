const API_URL = 'http://localhost:3000/api/todos';
let todos = [];

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todosList = document.getElementById('todosList');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// ==================== API FUNCTIONS ====================

// Fetch all todos from the server
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');

        todos = await response.json();
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error fetching todos:', error);
        showError('Failed to load todos. Please refresh the page.');
    }
}

// Add a new todo
async function addTodo() {
    const task = todoInput.value.trim();

    // Validate input
    if (!task) {
        showError('Please enter a task!');
        todoInput.focus();
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add todo');
        }

        const newTodo = await response.json();
        todos.unshift(newTodo); // Add to the beginning

        // Clear input and update UI
        todoInput.value = '';
        hideError();
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error adding todo:', error);
        showError(error.message || 'Failed to add todo. Please try again.');
    }
}

// Update a todo (toggle completion or edit text)
async function updateTodo(id, updates) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update todo');
        }

        const updatedTodo = await response.json();

        // Update local state
        const index = todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
            updateStats();
        }

    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    }
}

// Delete a todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete todo');
        }

        // Remove from local state
        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
        updateStats();

    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

// ==================== UI FUNCTIONS ====================

// Render all todos
function renderTodos() {
    // Clear the list
    todosList.innerHTML = '';

    // Show/hide empty state
    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Render each todo
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todosList.appendChild(todoItem);
    });
}

// Create a todo element
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = `todo-checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.addEventListener('click', () => toggleComplete(todo.id, todo.completed));

    // Text
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.task;

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => startEditing(li, todo));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => confirmDelete(todo.id, li));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);

    return li;
}

// Toggle todo completion
async function toggleComplete(id, currentStatus) {
    await updateTodo(id, { completed: currentStatus ? 0 : 1 });
}

// Start editing a todo
function startEditing(todoItem, todo) {
    const textSpan = todoItem.querySelector('.todo-text');
    const actions = todoItem.querySelector('.todo-actions');

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-text-input';
    input.value = todo.task;

    // Replace text with input
    todoItem.replaceChild(input, textSpan);
    input.focus();
    input.select();

    // Clear actions
    actions.innerHTML = '';

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'icon-btn save-btn';
    saveBtn.innerHTML = '✓';
    saveBtn.title = 'Save';

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'icon-btn cancel-btn';
    cancelBtn.innerHTML = '✕';
    cancelBtn.title = 'Cancel';

    const saveEdit = async () => {
        const newTask = input.value.trim();
        if (!newTask) {
            showError('Task cannot be empty!');
            input.focus();
            return;
        }

        if (newTask !== todo.task) {
            await updateTodo(todo.id, { task: newTask });
        } else {
            renderTodos(); // Just re-render if no change
        }
    };

    const cancelEdit = () => {
        renderTodos();
    };

    saveBtn.addEventListener('click', saveEdit);
    cancelBtn.addEventListener('click', cancelEdit);

    // Save on Enter, cancel on Escape
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
}

// Confirm and delete todo
function confirmDelete(id, todoItem) {
    // Add removing animation
    todoItem.classList.add('removing');

    // Delete after animation
    setTimeout(async () => {
        await deleteTodo(id);
    }, 250);
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(hideError, 3000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// ==================== EVENT LISTENERS ====================

// Add todo on button click
addBtn.addEventListener('click', addTodo);

// Add todo on Enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Hide error when user starts typing
todoInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('show')) {
        hideError();
    }
});

// ==================== INITIALIZATION ====================

// Load todos when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
});
