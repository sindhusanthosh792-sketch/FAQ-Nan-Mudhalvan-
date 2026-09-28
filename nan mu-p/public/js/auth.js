// Auth Page Logic (Login & Register)

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Handle Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');

      if (errorDiv) errorDiv.classList.add('d-none');

      if (!email || !password) {
        showError(errorDiv, 'Please fill in both email and password.');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Logging in...`;

      try {
        const res = await apiCall('/auth/login', {
          method: 'POST',
          body: { email, password }
        });

        Auth.setSession(res.token, res.user);
        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/dashboard.html';
          }
        }, 1000);
      } catch (err) {
        showError(errorDiv, err.message || 'Invalid email or password.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Handle Registration Form
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'user';
      const errorDiv = document.getElementById('register-error');

      if (errorDiv) errorDiv.classList.add('d-none');

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        showError(errorDiv, 'All fields are required.');
        return;
      }

      if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters long.');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Registering...`;

      try {
        const res = await apiCall('/auth/register', {
          method: 'POST',
          body: { name, email, password, confirmPassword, role }
        });

        Auth.setSession(res.token, res.user);
        showToast('Registration successful! Welcome to AI FAQ Assistant.', 'success');

        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = '/admin.html';
          } else {
            window.location.href = '/dashboard.html';
          }
        }, 1200);
      } catch (err) {
        showError(errorDiv, err.message || 'Registration failed. Please check inputs.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

function showError(element, msg) {
  if (element) {
    element.textContent = msg;
    element.classList.remove('d-none');
  } else {
    showToast(msg, 'danger');
  }
}
