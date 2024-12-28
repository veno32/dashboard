let tasks = [];

// Load tasks from localStorage when the page loads
function loadTasks() {
    const savedTasks = localStorage.getItem('labTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('labTasks', JSON.stringify(tasks));
}

// Create operation: Add a new task
function createTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    
    if (task) {
        tasks.push({ id: Date.now(), name: task });
        taskInput.value = '';
        saveTasks();  // Save after creating
        renderTasks();
    }
}

// Read operation: Display tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear the current list

    tasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>
                <a href="view.html?id=${task.id}" class="btn btn-info btn-sm">View</a>
                <button onclick="editTask(${task.id})" class="btn btn-warning btn-sm">Edit</button>
                <button onclick="deleteTask(${task.id})" class="btn btn-danger btn-sm">Delete</button>
            </td>`;
        taskList.appendChild(tr);
    });
}

// Update operation: Edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTaskName = prompt("Enter the new lab name:", task.name);
    if (newTaskName && newTaskName.trim()) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, name: newTaskName.trim() } : task
        );
        saveTasks();  // Save after editing
        renderTasks();
    }
}

// Delete operation: Remove a task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this lab?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();  // Save after deleting
        renderTasks();
    }
}

// Load tasks when the page loads
loadTasks();

