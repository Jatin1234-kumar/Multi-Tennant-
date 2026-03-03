const state = {
  apiBase: 'http://localhost:4000/api/v1',
  token: localStorage.getItem('token') || '',
  subdomain: localStorage.getItem('subdomain') || '',
  projectsPage: 1,
  tasksPage: 1,
  usersPage: 1,
  invitesPage: 1,
  pageSize: 20
};

const hero = document.querySelector('#hero-view');
const appView = document.querySelector('#app-view');
const progressBar = document.querySelector('#progress-bar');
const heroForm = document.querySelector('#hero-form');
const logoutBtn = document.querySelector('#logout-btn');

const authPanel = document.querySelector('#auth-panel');
const dashboard = document.querySelector('#dashboard');
const authStatus = document.querySelector('#auth-status');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const acceptInviteForm = document.querySelector('#accept-invite-form');

const projectForm = document.querySelector('#project-form');
const refreshProjectsBtn = document.querySelector('#refresh-projects');
const projectsList = document.querySelector('#projects-list');

const taskForm = document.querySelector('#task-form');
const refreshTasksBtn = document.querySelector('#refresh-tasks');
const tasksList = document.querySelector('#tasks-list');

const userForm = document.querySelector('#user-form');
const refreshUsersBtn = document.querySelector('#refresh-users');
const usersList = document.querySelector('#users-list');

const inviteForm = document.querySelector('#invite-form');
const inviteLinkOutput = document.querySelector('#invite-link-output');
const refreshInvitesBtn = document.querySelector('#refresh-invites');
const invitesList = document.querySelector('#invites-list');

let progress = 0;
const timer = window.setInterval(() => {
  progress = Math.min(progress + 8, 100);
  progressBar.style.width = `${progress}%`;

  if (progress >= 100) {
    window.clearInterval(timer);
    hero.classList.add('is-ready');
  }
}, 45);

async function api(path, method = 'GET', body, includeTenantHeader = true) {
  const response = await fetch(`${state.apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(includeTenantHeader && state.subdomain ? { 'x-tenant-subdomain': state.subdomain } : {})
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

function setSession(token, subdomain) {
  state.token = token;
  state.subdomain = subdomain;
  localStorage.setItem('token', token);
  localStorage.setItem('subdomain', subdomain);
}

function clearSession() {
  state.token = '';
  state.subdomain = '';
  localStorage.removeItem('token');
  localStorage.removeItem('subdomain');
}

function formatPagination(pagination) {
  return `Page ${pagination.page} / ${pagination.totalPages || 1} (Total: ${pagination.total})`;
}

function renderProjects(items, pagination) {
  if (!items.length) {
    projectsList.innerHTML = '<p class="list-meta">No projects yet.</p>';
    return;
  }

  projectsList.innerHTML = `
    <p class="list-meta">${formatPagination(pagination)}</p>
    ${items
      .map(
        (project) => `
      <article class="list-item">
        <strong>#${project.id} ${project.name}</strong>
        <div class="list-meta">${project.description || 'No description'}</div>
        <div class="list-actions">
          <button type="button" data-project-delete="${project.id}">DELETE</button>
        </div>
      </article>`
      )
      .join('')}
  `;
}

function renderTasks(items, pagination) {
  if (!items.length) {
    tasksList.innerHTML = '<p class="list-meta">No tasks yet.</p>';
    return;
  }

  tasksList.innerHTML = `
    <p class="list-meta">${formatPagination(pagination)}</p>
    ${items
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
      </article>`
      )
      .join('')}
  `;
}

function renderUsers(items, pagination) {
  if (!items.length) {
    usersList.innerHTML = '<p class="list-meta">No users yet.</p>';
    return;
  }

  usersList.innerHTML = `
    <p class="list-meta">${formatPagination(pagination)}</p>
    ${items
      .map(
        (user) => `
      <article class="list-item">
        <strong>#${user.id} ${user.email}</strong>
        <div class="list-meta">Role: ${user.role}</div>
      </article>`
      )
      .join('')}
  `;
}

function renderInvites(items, pagination) {
  if (!items.length) {
    invitesList.innerHTML = '<p class="list-meta">No pending invites.</p>';
    return;
  }

  invitesList.innerHTML = `
    <p class="list-meta">${formatPagination(pagination)}</p>
    ${items
      .map(
        (invite) => `
      <article class="list-item">
        <strong>#${invite.id} ${invite.email}</strong>
        <div class="list-meta">Role: ${invite.role} | Expires: ${new Date(invite.expiresAt).toLocaleString()}</div>
      </article>`
      )
      .join('')}
  `;
}

async function loadProjects() {
  try {
    const result = await api(`/projects?page=${state.projectsPage}&pageSize=${state.pageSize}`);
    renderProjects(result.data || [], result.pagination || { page: 1, total: 0, totalPages: 1 });
  } catch (error) {
    projectsList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

async function loadTasks() {
  try {
    const result = await api(`/tasks?page=${state.tasksPage}&pageSize=${state.pageSize}`);
    renderTasks(result.data || [], result.pagination || { page: 1, total: 0, totalPages: 1 });
  } catch (error) {
    tasksList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

async function loadUsers() {
  try {
    const result = await api(`/users?page=${state.usersPage}&pageSize=${state.pageSize}`);
    renderUsers(result.data || [], result.pagination || { page: 1, total: 0, totalPages: 1 });
  } catch (error) {
    usersList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

async function loadInvites() {
  try {
    const result = await api(`/invites?page=${state.invitesPage}&pageSize=${state.pageSize}`);
    renderInvites(result.data || [], result.pagination || { page: 1, total: 0, totalPages: 1 });
  } catch (error) {
    invitesList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
}

function applyAuthState() {
  if (state.token && state.subdomain) {
    authPanel.classList.add('hidden');
    dashboard.classList.remove('hidden');
    authStatus.textContent = `Logged in for tenant: ${state.subdomain}`;
    loadProjects();
    loadTasks();
    loadUsers();
    loadInvites();
    return;
  }

  authPanel.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

heroForm.addEventListener('submit', (event) => {
  event.preventDefault();
  showApp();
  applyAuthState();
});

document.querySelectorAll('[data-auth-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.authTab;

    document.querySelectorAll('[data-auth-tab]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    loginForm.classList.toggle('hidden', mode !== 'login');
    registerForm.classList.toggle('hidden', mode !== 'register');
    acceptInviteForm.classList.toggle('hidden', mode !== 'accept');
  });
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const subdomain = document.querySelector('#subdomain-input').value.trim().toLowerCase();
  const email = document.querySelector('#email-input').value.trim().toLowerCase();
  const password = document.querySelector('#password-input').value;

  try {
    state.subdomain = subdomain;
    const result = await api('/auth/login', 'POST', { email, password });
    setSession(result.accessToken, subdomain);
    authStatus.textContent = `Logged in for tenant: ${subdomain}`;
    applyAuthState();
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: document.querySelector('#workspace-name-input').value.trim(),
    subdomain: document.querySelector('#workspace-subdomain-input').value.trim().toLowerCase(),
    adminEmail: document.querySelector('#workspace-admin-email').value.trim().toLowerCase(),
    adminPassword: document.querySelector('#workspace-admin-password').value
  };

  try {
    const result = await api('/onboarding/register-workspace', 'POST', payload, false);
    setSession(result.accessToken, result.tenant.subdomain);
    authStatus.textContent = `Workspace created: ${result.tenant.subdomain}`;
    applyAuthState();
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

acceptInviteForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = document.querySelector('#invite-token-input').value.trim();
  const password = document.querySelector('#invite-password-input').value;

  try {
    const result = await api('/invites/accept', 'POST', { token, password }, false);
    setSession(result.accessToken, result.tenant.subdomain);
    authStatus.textContent = `Invite accepted for tenant: ${result.tenant.subdomain}`;
    applyAuthState();
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', () => {
  clearSession();
  authStatus.textContent = 'Not logged in';
  showLanding();
  applyAuthState();
});

document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;

    document.querySelectorAll('.tab-btn[data-tab]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    document.querySelector('#projects-panel').classList.toggle('hidden', target !== 'projects');
    document.querySelector('#tasks-panel').classList.toggle('hidden', target !== 'tasks');
    document.querySelector('#users-panel').classList.toggle('hidden', target !== 'users');
    document.querySelector('#invites-panel').classList.toggle('hidden', target !== 'invites');
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

userForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#user-email').value.trim().toLowerCase();
  const password = document.querySelector('#user-password').value;
  const role = document.querySelector('#user-role').value;

  try {
    await api('/users', 'POST', { email, password, role });
    userForm.reset();
    loadUsers();
  } catch (error) {
    usersList.innerHTML = `<p class="list-meta">${error.message}</p>`;
  }
});

refreshUsersBtn.addEventListener('click', loadUsers);

inviteForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#invite-email').value.trim().toLowerCase();
  const role = document.querySelector('#invite-role').value;

  try {
    const result = await api('/invites', 'POST', { email, role });
    inviteLinkOutput.textContent = `Invite link: ${result.inviteLink}`;
    inviteForm.reset();
    loadInvites();
  } catch (error) {
    inviteLinkOutput.textContent = error.message;
  }
});

refreshInvitesBtn.addEventListener('click', loadInvites);

function handleInviteTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get('inviteToken');

  if (!inviteToken) {
    return;
  }

  showApp();
  applyAuthState();

  const acceptBtn = document.querySelector('[data-auth-tab="accept"]');
  if (acceptBtn) {
    acceptBtn.click();
  }

  const tokenInput = document.querySelector('#invite-token-input');
  tokenInput.value = inviteToken;
}

if (state.token && state.subdomain) {
  showApp();
}

handleInviteTokenFromUrl();
applyAuthState();
