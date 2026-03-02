// App state block: stores auth + tenant context for API calls.
const state = {
  apiBase: 'http://localhost:4000/api/v1',
  token: localStorage.getItem('token') || '',
  subdomain: localStorage.getItem('subdomain') || ''
};

// Landing bootstrap block: runs initial progress and reveal animations.
const hero = document.querySelector('#hero-view');
const appView = document.querySelector('#app-view');
const progressBar = document.querySelector('#progress-bar');
const heroForm = document.querySelector('#hero-form');

const loginForm = document.querySelector('#login-form');
const authStatus = document.querySelector('#auth-status');
const dashboard = document.querySelector('#dashboard');
const authPanel = document.querySelector('#auth-panel');
const logoutBtn = document.querySelector('#logout-btn');

const projectForm = document.querySelector('#project-form');
const projectsList = document.querySelector('#projects-list');
const refreshProjectsBtn = document.querySelector('#refresh-projects');

const taskForm = document.querySelector('#task-form');
const tasksList = document.querySelector('#tasks-list');
const refreshTasksBtn = document.querySelector('#refresh-tasks');

// Progress animation block: simple startup loading indicator.
let progress = 0;
const timer = window.setInterval(() => {
  progress = Math.min(progress + 8, 100);
  progressBar.style.width = `${progress}%`;

  if (progress >= 100) {
    window.clearInterval(timer);
    hero.classList.add('is-ready');
  }
}, 45);

// Helper block: centralized API call with auth + tenant headers.
async function api(path, method = 'GET', body) {
  const response = await fetch(`${state.apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(state.subdomain ? { 'x-tenant-subdomain': state.subdomain } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

function showApp() {
  hero.classList.add('hidden');
  appView.classList.remove('hidden');
  appView.classList.add('is-ready');
}

function showLanding() {
  appView.classList.add('hidden');
  hero.classList.remove('hidden');
}

function applyAuthState() {
  if (state.token && state.subdomain) {
    authPanel.classList.add('hidden');
    dashboard.classList.remove('hidden');
    authStatus.textContent = `Logged in for tenant: ${state.subdomain}`;
    loadProjects();
    loadTasks();
    return;
  }

  authPanel.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

function renderProjects(items) {
  if (!items.length) {
    projectsList.innerHTML = '<p class="list-meta">No projects yet.</p>';
    return;
  }

  projectsList.innerHTML = items
    .map(
      (project) => `
      <article class="list-item">
        <strong>#${project.id} ${project.name}</strong>
        <div class="list-meta">${project.description || 'No description'}</div>
        <div class="list-actions">
          <button type="button" data-project-delete="${project.id}">DELETE</button>
        </div>
      </article>
    `
    )
    .join('');
}

function renderTasks(items) {
  if (!items.length) {
    tasksList.innerHTML = '<p class="list-meta">No tasks yet.</p>';
    return;
  }

  tasksList.innerHTML = items
    .map(
      (task) => `
      <article class="list-item">
        <strong>#${task.id} ${task.title}</strong>
        <div class="list-meta">Status: ${task.status} | Project: ${task.projectId}</div>
        <div class="list-actions">
          <button type="button" data-task-status="${task.id}" data-status="todo">TODO</button>
          <button type="button" data-task-status="${task.id}" data-status="in_progress">IN_PROGRESS</button>
          <button type="button" data-task-status="${task.id}" data-status="done">DONE</button>
          <button type="button" data-task-delete="${task.id}">DELETE</button>
        </div>
      </article>
    `
    )
    .join('');
}

async function loadProjects() {
  try {
    const result = await api('/projects');
    renderProjects(result.data || []);
  } catch (error) {
    projectsList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

async function loadTasks() {
  try {
    const result = await api('/tasks');
    renderTasks(result.data || []);
  } catch (error) {
    tasksList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

// CTA behavior block: moves from landing view to full app shell.
heroForm.addEventListener('submit', (event) => {
  event.preventDefault();
  showApp();
  applyAuthState();
});

// Auth submit block: login against backend and persist session.
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const subdomain = document.querySelector('#subdomain-input').value.trim().toLowerCase();
  const email = document.querySelector('#email-input').value.trim().toLowerCase();
  const password = document.querySelector('#password-input').value;

  try {
    state.subdomain = subdomain;
    const result = await api('/auth/login', 'POST', { email, password });
    state.token = result.accessToken;

    localStorage.setItem('token', state.token);
    localStorage.setItem('subdomain', state.subdomain);

    authStatus.textContent = `Logged in for tenant: ${state.subdomain}`;
    applyAuthState();
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

// Logout block: clear local session and reset UI.
logoutBtn.addEventListener('click', () => {
  state.token = '';
  state.subdomain = '';
  localStorage.removeItem('token');
  localStorage.removeItem('subdomain');
  authStatus.textContent = 'Not logged in';
  showLanding();
  applyAuthState();
});

// Tab switching block: toggles between project and task workspace.
document.querySelectorAll('.tab-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    document.querySelector('#projects-panel').classList.toggle('hidden', target !== 'projects');
    document.querySelector('#tasks-panel').classList.toggle('hidden', target !== 'tasks');
  });
});

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.querySelector('#project-name').value.trim();
  const description = document.querySelector('#project-description').value.trim();

  try {
    await api('/projects', 'POST', { name, description });
    projectForm.reset();
    loadProjects();
  } catch (error) {
    projectsList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
});

refreshProjectsBtn.addEventListener('click', loadProjects);

projectsList.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const projectId = target.dataset.projectDelete;
  if (!projectId) return;

  try {
    await api(`/projects/${projectId}`, 'DELETE');
    loadProjects();
    loadTasks();
  } catch (error) {
    projectsList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
});

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.querySelector('#task-title').value.trim();
  const projectId = Number(document.querySelector('#task-project-id').value);
  const status = document.querySelector('#task-status').value;

  try {
    await api('/tasks', 'POST', { title, projectId, status });
    taskForm.reset();
    loadTasks();
  } catch (error) {
    tasksList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
});

refreshTasksBtn.addEventListener('click', loadTasks);

tasksList.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const taskDeleteId = target.dataset.taskDelete;
  const taskStatusId = target.dataset.taskStatus;
  const status = target.dataset.status;

  try {
    if (taskDeleteId) {
      await api(`/tasks/${taskDeleteId}`, 'DELETE');
    }

    if (taskStatusId && status) {
      await api(`/tasks/${taskStatusId}/status`, 'PATCH', { status });
    }

    loadTasks();
  } catch (error) {
    tasksList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
});

// Boot block: if prior session exists, skip landing and open app directly.
if (state.token && state.subdomain) {
  showApp();
}

applyAuthState();
