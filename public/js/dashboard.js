// User Dashboard & FAQ Browsing Logic

let currentCategory = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

async function initDashboard() {
  const user = Auth.getUser();
  const userNameElem = document.getElementById('user-welcome-name');
  if (userNameElem) {
    userNameElem.textContent = user ? user.name : 'Student';
  }

  // Load Categories & FAQs
  await loadCategories();
  await loadFaqs();
  renderRecentlyViewed();

  // Search Bar listener
  const searchInput = document.getElementById('faq-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadFaqs();
      }, 300);
    });
  }
}

async function loadCategories() {
  const categoryContainer = document.getElementById('category-pills-container');
  if (!categoryContainer) return;

  try {
    const res = await apiCall('/categories');
    const categories = res.data || [];

    let html = `
      <button class="btn ${currentCategory === '' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill me-2 mb-2" onclick="filterByCategory('')">
        <i class="fas fa-th-large me-1"></i> All Categories
      </button>
    `;

    categories.forEach(cat => {
      const activeClass = currentCategory === cat._id ? 'btn-primary' : 'btn-outline-primary';
      html += `
        <button class="btn ${activeClass} rounded-pill me-2 mb-2" onclick="filterByCategory('${cat._id}')">
          ${cat.name} <span class="badge bg-light text-dark ms-1">${cat.faqCount || 0}</span>
        </button>
      `;
    });

    categoryContainer.innerHTML = html;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function filterByCategory(catId) {
  currentCategory = catId;
  loadCategories();
  loadFaqs();
}

async function loadFaqs() {
  const faqListElem = document.getElementById('faq-list-accordion');
  if (!faqListElem) return;

  faqListElem.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Searching FAQ database...</p>
    </div>
  `;

  try {
    let queryParams = [];
    if (currentCategory) queryParams.push(`category=${encodeURIComponent(currentCategory)}`);
    if (currentSearch) queryParams.push(`search=${encodeURIComponent(currentSearch)}`);

    const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const res = await apiCall(`/faqs${queryStr}`);
    const faqs = res.data || [];

    if (faqs.length === 0) {
      faqListElem.innerHTML = `
        <div class="text-center py-5 bg-white rounded-3 shadow-sm border">
          <i class="fas fa-search-minus fa-3x text-muted mb-3"></i>
          <h5>No FAQs Found</h5>
          <p class="text-muted">No matching questions were found for your query or filter.</p>
          <a href="/ai-assistant.html" class="btn btn-primary rounded-pill mt-2">
            <i class="fas fa-robot me-1"></i> Ask AI Assistant Instead
          </a>
        </div>
      `;
      return;
    }

    let accordionHtml = '';
    faqs.forEach((faq, index) => {
      const accordionId = `faqCollapse${index}`;
      const headingId = `faqHeading${index}`;
      const categoryName = faq.category ? faq.category.name : 'General';
      const keywordsBadges = Array.isArray(faq.keywords)
        ? faq.keywords.map(k => `<span class="badge bg-secondary-subtle text-secondary me-1">#${k}</span>`).join('')
        : '';

      accordionHtml += `
        <div class="accordion-item border mb-3 rounded-3 shadow-sm overflow-hidden" onclick="trackRecentlyViewed('${faq._id}', '${escapeHtml(faq.question)}')">
          <h2 class="accordion-header" id="${headingId}">
            <button class="accordion-button collapsed font-weight-bold" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}" aria-expanded="false" aria-controls="${accordionId}">
              <span class="badge bg-primary me-3">${categoryName}</span>
              ${faq.question}
            </button>
          </h2>
          <div id="${accordionId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#faq-list-accordion">
            <div class="accordion-body bg-light text-dark py-4">
              <div class="mb-3" style="font-size: 1.05rem; line-height: 1.7;">
                ${faq.answer}
              </div>
              <div class="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top text-muted small">
                <div>${keywordsBadges}</div>
                <div><i class="far fa-eye me-1"></i> ${faq.views || 0} views</div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    faqListElem.innerHTML = accordionHtml;
  } catch (err) {
    faqListElem.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load FAQs: ${err.message}
      </div>
    `;
  }
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function trackRecentlyViewed(id, question) {
  try {
    let recent = JSON.parse(localStorage.getItem('recent_faqs') || '[]');
    recent = recent.filter(item => item.id !== id);
    recent.unshift({ id, question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (recent.length > 5) recent = recent.slice(0, 5);
    localStorage.setItem('recent_faqs', JSON.stringify(recent));
    renderRecentlyViewed();
  } catch (e) {
    console.error(e);
  }
}

function renderRecentlyViewed() {
  const container = document.getElementById('recent-faqs-container');
  if (!container) return;

  try {
    const recent = JSON.parse(localStorage.getItem('recent_faqs') || '[]');
    if (recent.length === 0) {
      container.innerHTML = `<p class="text-muted small">No recently viewed questions yet. Click on any FAQ above to track your history.</p>`;
      return;
    }

    let html = `<ul class="list-group list-group-flush small">`;
    recent.forEach(item => {
      html += `
        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-2">
          <span class="text-truncate me-2" style="max-width: 250px;"><i class="far fa-clock text-primary me-2"></i>${item.question}</span>
          <span class="badge bg-light text-muted">${item.time}</span>
        </li>
      `;
    });
    html += `</ul>`;
    container.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}
