// Tasks management for labs.html
let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem('labTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('labTasks', JSON.stringify(tasks));
}

function createTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    
    if (task) {
        tasks.push({ id: Date.now(), name: task });
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return; // Only execute if on labs.html page

    taskList.innerHTML = ''; 

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

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTaskName = prompt("Enter the new lab name:", task.name);
    if (newTaskName && newTaskName.trim()) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, name: newTaskName.trim() } : task
        );
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this lab?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Components management for view.html
let components = [];
let currentComponentId = null;

function getLabId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadComponents() {
    const labId = getLabId();
    if (!labId) return;

    const savedComponents = localStorage.getItem(`lab_${labId}_components`);
    if (savedComponents) {
        components = JSON.parse(savedComponents);
        renderComponents();
    }
}

function saveComponents() {
    const labId = getLabId();
    if (!labId) return;
    localStorage.setItem(`lab_${labId}_components`, JSON.stringify(components));
}

function createComponent() {
    const typeInput = document.getElementById('typeInput');
    const quantityInput = document.getElementById('quantityInput');
    const commentsInput = document.getElementById('commentsInput');
    const runningInput = document.getElementById('runningInput');
    const damageInput = document.getElementById('damageInput');

    const type = typeInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 0;
    const comments = commentsInput.value.trim();
    const running = parseInt(runningInput.value) || 0;
    const damage = parseInt(damageInput.value) || 0;

    if (type && quantity > 0) {
        const newComponent = {
            id: Date.now(),
            type,
            quantity,
            comments,
            running,
            damage
        };

        components.push(newComponent);
        saveComponents();
        renderComponents();

        // Clear form
        typeInput.value = '';
        quantityInput.value = '';
        commentsInput.value = '';
        runningInput.value = '';
        damageInput.value = '';

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
    } else {
        alert('Please fill in at least the type and quantity fields');
    }
}

function renderComponents() {
    const tbody = document.getElementById('componentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    components.forEach((component, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${component.type}</td>
            <td>${component.quantity}</td>
            <td>${component.running}</td>
            <td>${component.damage}</td>
            <td>${component.comments || 'no comments'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="openCommentModal(${component.id})">
                    Add Comment
                </button>
            </td>
            <td><button class="btn btn-warning btn-sm" onclick="editComponent(${component.id})">Edit</button></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteComponent(${component.id})">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function openCommentModal(componentId) {
    currentComponentId = componentId;
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    const commentInput = document.getElementById('commentInput');
    commentInput.value = ''; // Clear previous comment
    modal.show();
}

function addComment() {
    if (!currentComponentId) return;

    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();

    if (comment) {
        components = components.map(component => {
            if (component.id === currentComponentId) {
                return { ...component, comments: comment };
            }
            return component;
        });

        saveComponents();
        renderComponents();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal'));
        modal.hide();
        currentComponentId = null;
    }
}

function editComponent(id) {
    const component = components.find(c => c.id === id);
    if (!component) return;

    const newType = prompt('Enter new type:', component.type);
    if (newType === null) return;

    const newQuantity = parseInt(prompt('Enter new quantity:', component.quantity));
    if (isNaN(newQuantity)) return;

    const newRunning = parseInt(prompt('Enter new running count:', component.running));
    if (isNaN(newRunning)) return;

    const newDamage = parseInt(prompt('Enter new damage count:', component.damage));
    if (isNaN(newDamage)) return;

    components = components.map(c => {
        if (c.id === id) {
            return {
                ...c,
                type: newType.trim(),
                quantity: newQuantity,
                running: newRunning,
                damage: newDamage
            };
        }
        return c;
    });

    saveComponents();
    renderComponents();
}

function deleteComponent(id) {
    if (confirm('Are you sure you want to delete this component?')) {
        components = components.filter(component => component.id !== id);
        saveComponents();
        renderComponents();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load tasks if on labs.html
    if (document.getElementById('taskList')) {
        loadTasks();
    }

    // Load components if on view.html
    if (document.getElementById('componentsTableBody')) {
        // Add event listener to create component button
        const createButton = document.getElementById('createComponentBtn');
        if (createButton) {
            createButton.addEventListener('click', createComponent);
        }

        // Add event listener to add comment button
        const addCommentBtn = document.getElementById('addCommentBtn');
        if (addCommentBtn) {
            addCommentBtn.addEventListener('click', addComment);
        }

        loadComponents();
    }
});