function handleLayerClick(clickedLayerId) {
    const layers = document.querySelectorAll('.layer');
    const clickedLayer = document.getElementById(clickedLayerId);
    layers.forEach(layer => {
      layer.classList.remove('active');
    });

    if (!clickedLayer.classList.contains('active')) {
      clickedLayer.classList.add('active');
    }
  }

  function downloadResource(resourceId) {
  if (!resourceId) {
      console.error('Invalid resource ID');
      return;
  }
  const button = event.currentTarget;
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
  button.disabled = true;

  setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      alert('Download started for: ' + resourceId);
  }, 1000);
}

document.addEventListener('error', function(e) {
  if (e.target.tagName.toLowerCase() === 'link' || e.target.tagName.toLowerCase() === 'script') {
      console.error('Failed to load resource:', e.target.src || e.target.href);
  }
}, true);


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
  taskList.innerHTML = ''; 

  tasks.forEach(task => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${task.name}</td>
          <td>
              <a href="view.html"?id=${task.id}" class="btn btn-info btn-sm">View</a>
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

loadTasks();