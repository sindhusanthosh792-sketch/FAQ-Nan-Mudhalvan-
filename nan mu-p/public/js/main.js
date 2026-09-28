// Main Frontend Utilities & API Wrapper
const API_BASE = '/api';

// Auth State Helper
const Auth = {
  getToken: () => localStorage.getItem('faq_assistant_token'),
  getUser: () => {
    const u = localStorage.getItem('faq_assistant_user');
    return u ? JSON.parse(u) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem('faq_assistant_token', token);
    localStorage.setItem('faq_assistant_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('faq_assistant_token');
    localStorage.removeItem('faq_assistant_user');
  },
  isLoggedIn: () => !!localStorage.getItem('faq_assistant_token'),
  isAdmin: () => {
    const user = Auth.getUser();
    return user && user.role === 'admin';
  }
};

// Generic API Client
async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body = null, auth = false } = options;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (auth) {
    const token = Auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && auth) {
        Auth.clearSession();
        showToast('Session expired. Please log in again.', 'warning');
        setTimeout(() => window.location.href = '/login.html', 1500);
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`[API Error ${endpoint}]:`, error.message);
    throw error;
  }
}

// Toast Alert Notification
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  const bgClass = type === 'success' ? 'bg-success' :
                  type === 'danger' || type === 'error' ? 'bg-danger' :
                  type === 'warning' ? 'bg-warning text-dark' : 'bg-primary';

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body font-weight-semibold">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElem = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastElem, { delay: 4000 });
  bsToast.show();

  toastElem.addEventListener('hidden.bs.toast', () => {
    toastElem.remove();
  });
}

// Global Navbar State Adjuster
document.addEventListener('DOMContentLoaded', () => {
  const navAuthLinks = document.getElementById('nav-auth-links');
  if (navAuthLinks) {
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      const adminLink = user && user.role === 'admin' 
        ? `<li class="nav-item"><a class="nav-link text-warning font-weight-bold" href="/admin.html"><i class="fas fa-shield-alt me-1"></i>Admin Portal</a></li>`
        : '';

      navAuthLinks.innerHTML = `
        ${adminLink}
        <li class="nav-item"><a class="nav-link" href="/dashboard.html"><i class="fas fa-th-large me-1"></i>Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/ai-assistant.html"><i class="fas fa-robot me-1"></i>AI Assistant</a></li>
        <li class="nav-item ms-lg-2">
          <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="logout()"><i class="fas fa-sign-out-alt me-1"></i>Logout (${user ? user.name.split(' ')[0] : 'User'})</button>
        </li>
      `;
    } else {
      navAuthLinks.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="/ai-assistant.html"><i class="fas fa-robot me-1"></i>Ask AI</a></li>
        <li class="nav-item"><a class="nav-link" href="/login.html"><i class="fas fa-sign-in-alt me-1"></i>Login</a></li>
        <li class="nav-item ms-lg-2"><a class="btn btn-primary btn-sm rounded-pill px-3" href="/register.html"><i class="fas fa-user-plus me-1"></i>Register</a></li>
      `;
    }
  }
});

function logout() {
  Auth.clearSession();
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = '/login.html', 1000);
}
