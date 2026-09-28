// Admin Portal Dashboard & CRUD Script

let adminCategories = [];
let adminFaqs = [];
let editingCategoryId = null;
let editingFaqId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Protect route
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    showToast('Admin authorization required.', 'danger');
    setTimeout(() => window.location.href = '/login.html', 1000);
    return;
  }

  initAdmin();
});

async function initAdmin() {
  await loadStats();
  await loadAdminCategories();
  await loadAdminFaqs();
  await loadAdminUsers();
}

// 1. Dashboard Statistics
async function loadStats() {
  try {
    const res = await apiCall('/users/stats', { auth: true });
    const stats = res.data;

    document.getElementById('stat-total-users').textContent = stats.totalUsers || 0;
    document.getElementById('stat-total-faqs').textContent = stats.totalFaqs || 0;
    document.getElementById('stat-total-categories').textContent = stats.totalCategories || 0;
  } catch (err) {
    showToast('Failed to load dashboard metrics', 'danger');
  }
}

// 2. Categories CRUD
async function loadAdminCategories() {
  const tableBody = document.getElementById('admin-categories-table');
  const catSelect = document.getElementById('faq-category-select');
  if (!tableBody) return;

  try {
    const res = await apiCall('/categories');
    adminCategories = res.data || [];

    let html = '';
    let selectOptions = '<option value="">Select Category</option>';

    adminCategories.forEach((cat, idx) => {
      selectOptions += `<option value="${cat._id}">${cat.name}</option>`;
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${cat.name}</strong></td>
          <td>${cat.description || '<span class="text-muted">No description</span>'}</td>
          <td><span class="badge bg-info text-dark">${cat.faqCount || 0} FAQs</span></td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditCategoryModal('${cat._id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${cat._id}')"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html || '<tr><td colspan="5" class="text-center">No categories found.</td></tr>';
    if (catSelect) catSelect.innerHTML = selectOptions;
  } catch (err) {
    showToast('Error loading categories', 'danger');
  }
}

function openAddCategoryModal() {
  editingCategoryId = null;
  document.getElementById('categoryModalLabel').textContent = 'Add New Category';
  document.getElementById('cat-name').value = '';
  document.getElementById('cat-desc').value = '';
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
}

function openEditCategoryModal(id) {
  const cat = adminCategories.find(c => c._id === id);
  if (!cat) return;

  editingCategoryId = id;
  document.getElementById('categoryModalLabel').textContent = 'Edit Category';
  document.getElementById('cat-name').value = cat.name;
  document.getElementById('cat-desc').value = cat.description || '';
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
}

async function saveCategory() {
  const name = document.getElementById('cat-name').value.trim();
  const description = document.getElementById('cat-desc').value.trim();

  if (!name) {
    showToast('Category name is required', 'warning');
    return;
  }

  try {
    if (editingCategoryId) {
      await apiCall(`/categories/${editingCategoryId}`, {
        method: 'PUT',
        body: { name, description },
        auth: true
      });
      showToast('Category updated successfully', 'success');
    } else {
      await apiCall('/categories', {
        method: 'POST',
        body: { name, description },
        auth: true
      });
      showToast('Category created successfully', 'success');
    }

    const modalElem = document.getElementById('categoryModal');
    const modal = bootstrap.Modal.getInstance(modalElem);
    if (modal) modal.hide();

    await loadAdminCategories();
    await loadStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    await apiCall(`/categories/${id}`, {
      method: 'DELETE',
      auth: true
    });
    showToast('Category deleted', 'success');
    await loadAdminCategories();
    await loadStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// 3. FAQs CRUD
async function loadAdminFaqs() {
  const tableBody = document.getElementById('admin-faqs-table');
  if (!tableBody) return;

  try {
    const res = await apiCall('/faqs');
    adminFaqs = res.data || [];

    let html = '';
    adminFaqs.forEach((faq, idx) => {
      const categoryName = faq.category ? faq.category.name : 'Uncategorized';
      const keywords = Array.isArray(faq.keywords) ? faq.keywords.join(', ') : faq.keywords;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="max-width: 250px;"><strong>${faq.question}</strong></td>
          <td style="max-width: 300px;" class="text-truncate">${faq.answer}</td>
          <td><span class="badge bg-primary">${categoryName}</span></td>
          <td><span class="small text-muted">${keywords || 'None'}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditFaqModal('${faq._id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteFaq('${faq._id}')"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html || '<tr><td colspan="6" class="text-center">No FAQs found.</td></tr>';
  } catch (err) {
    showToast('Error loading FAQs', 'danger');
  }
}

function openAddFaqModal() {
  editingFaqId = null;
  document.getElementById('faqModalLabel').textContent = 'Add New FAQ';
  document.getElementById('faq-question').value = '';
  document.getElementById('faq-answer').value = '';
  document.getElementById('faq-category-select').value = adminCategories.length > 0 ? adminCategories[0]._id : '';
  document.getElementById('faq-keywords').value = '';
  const modal = new bootstrap.Modal(document.getElementById('faqModal'));
  modal.show();
}

function openEditFaqModal(id) {
  const faq = adminFaqs.find(f => f._id === id);
  if (!faq) return;

  editingFaqId = id;
  document.getElementById('faqModalLabel').textContent = 'Edit FAQ';
  document.getElementById('faq-question').value = faq.question;
  document.getElementById('faq-answer').value = faq.answer;
  document.getElementById('faq-category-select').value = faq.category ? faq.category._id : '';
  document.getElementById('faq-keywords').value = Array.isArray(faq.keywords) ? faq.keywords.join(', ') : faq.keywords;

  const modal = new bootstrap.Modal(document.getElementById('faqModal'));
  modal.show();
}

async function saveFaq() {
  const question = document.getElementById('faq-question').value.trim();
  const answer = document.getElementById('faq-answer').value.trim();
  const category = document.getElementById('faq-category-select').value;
  const keywords = document.getElementById('faq-keywords').value.trim();

  if (!question || !answer || !category) {
    showToast('Question, Answer, and Category are required.', 'warning');
    return;
  }

  try {
    if (editingFaqId) {
      await apiCall(`/faqs/${editingFaqId}`, {
        method: 'PUT',
        body: { question, answer, category, keywords },
        auth: true
      });
      showToast('FAQ updated successfully', 'success');
    } else {
      await apiCall('/faqs', {
        method: 'POST',
        body: { question, answer, category, keywords },
        auth: true
      });
      showToast('FAQ created successfully', 'success');
    }

    const modalElem = document.getElementById('faqModal');
    const modal = bootstrap.Modal.getInstance(modalElem);
    if (modal) modal.hide();

    await loadAdminFaqs();
    await loadAdminCategories();
    await loadStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteFaq(id) {
  if (!confirm('Are you sure you want to delete this FAQ?')) return;

  try {
    await apiCall(`/faqs/${id}`, {
      method: 'DELETE',
      auth: true
    });
    showToast('FAQ deleted', 'success');
    await loadAdminFaqs();
    await loadAdminCategories();
    await loadStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// 4. User Management Table
async function loadAdminUsers() {
  const tableBody = document.getElementById('admin-users-table');
  if (!tableBody) return;

  try {
    const res = await apiCall('/users', { auth: true });
    const users = res.data || [];

    let html = '';
    users.forEach((u, idx) => {
      const roleBadge = u.role === 'admin'
        ? `<span class="badge bg-warning text-dark"><i class="fas fa-shield-alt me-1"></i>Admin</span>`
        : `<span class="badge bg-secondary"><i class="fas fa-user me-1"></i>User</span>`;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${roleBadge}</td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u._id}')" ${u.role === 'admin' ? 'disabled' : ''}><i class="fas fa-trash"></i> Delete</button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html || '<tr><td colspan="6" class="text-center">No users found.</td></tr>';
  } catch (err) {
    showToast('Error loading users', 'danger');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    await apiCall(`/users/${id}`, {
      method: 'DELETE',
      auth: true
    });
    showToast('User deleted', 'success');
    await loadAdminUsers();
    await loadStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
