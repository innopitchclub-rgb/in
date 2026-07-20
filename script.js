const STORAGE_KEY = 'innopitch_registrations';
const ADMIN_PASSWORD = 'DK14072007';
const ADMIN_SESSION_KEY = 'innopitch_admin_authenticated';

function isAdminAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function setAdminAuthenticated(isAuthenticated) {
  if (isAuthenticated) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

function ensureSpinnerStyles() {
  if (document.getElementById('api-spinner-styles')) return;
  const style = document.createElement('style');
  style.id = 'api-spinner-styles';
  style.textContent = `
    @keyframes api-spin { to { transform: rotate(360deg); } }
    .api-button-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-left: 0.6rem;
      border: 2px solid rgba(255,255,255,0.7);
      border-top-color: transparent;
      border-radius: 50%;
      animation: api-spin 0.8s linear infinite;
      vertical-align: middle;
    }
    .api-popup-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .api-popup-message {
      max-width: 360px;
      width: 100%;
      padding: 1.4rem 1.2rem;
      background: #111;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      color: #fff;
      font-family: inherit;
      text-align: center;
    }
    .api-popup-message.success { border-color: #34d399; }
    .api-popup-message.error { border-color: #ff6b6b; }
    .api-popup-message button { margin-top: 1rem; padding: 0.75rem 1rem; font-size: 0.95rem; border: none; border-radius: 999px; color: #111; background: #fff; cursor: pointer; }
  `;
  document.head.appendChild(style);
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  ensureSpinnerStyles();
  if (isLoading) {
    button.disabled = true;
    button.dataset.apiOriginalText = button.textContent;
    button.innerHTML = `${button.dataset.apiOriginalText || 'Submitting…'}<span class="api-button-spinner"></span>`;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.apiOriginalText || 'Submit application';
    button.removeAttribute('aria-busy');
  }
}

function showPopup(message, type = 'info') {
  const existing = document.getElementById('api-popup-backdrop');
  if (existing) existing.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'api-popup-backdrop';
  backdrop.className = 'api-popup-backdrop';
  backdrop.innerHTML = `
    <div class="api-popup-message ${type}">
      <p>${message}</p>
      <button type="button">OK</button>
    </div>
  `;
  backdrop.querySelector('button').addEventListener('click', () => backdrop.remove());
  document.body.appendChild(backdrop);
  setTimeout(() => backdrop.remove(), 6000);
}

function ensureToastStack() {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message, type = 'success') {
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function sanitizeText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function validateField(input, message) {
  const value = sanitizeText(input.value);
  const field = input.closest('.field');
  if (!value) {
    field?.classList.add('field-invalid');
    showToast(message, 'error');
    return false;
  }
  field?.classList.remove('field-invalid');
  return true;
}

function initFormEnhancements() {
  document.querySelectorAll('.field input, .field textarea, .field select').forEach((el) => {
    el.addEventListener('focus', () => el.closest('.field')?.classList.add('field-active'));
    el.addEventListener('blur', () => el.closest('.field')?.classList.remove('field-active'));
  });
}

function previewUploadedFile(input, previewBox, isImage = false) {
  const file = input.files && input.files[0];
  if (!file) {
    previewBox.hidden = true;
    previewBox.innerHTML = '';
    return;
  }
  previewBox.hidden = false;
  previewBox.innerHTML = isImage ? `<img src="" alt="Preview" />` : `<span>${file.name}</span>`;
  if (isImage) {
    const img = previewBox.querySelector('img');
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function loadRegistrationsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to parse stored registrations:', error);
    return [];
  }
}

function saveRegistrationsToStorage(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows || []));
}

function generateRegistrationId(rows) {
  const prefix = 'INNO-' + new Date().getFullYear() + '-';
  const count = rows.filter((row) => String(row['Registration ID'] || '').startsWith(prefix)).length;
  return prefix + String(count + 1).padStart(4, '0');
}

function addRegistration(payload) {
  const rows = loadRegistrationsFromStorage();
  const duplicate = rows.find((row) => {
    const sameEmail = String(row.Email || '').toLowerCase() === String(payload.email || '').toLowerCase();
    const sameReg = String(row['Register Number'] || '').toLowerCase() === String(payload.regNumber || '').toLowerCase();
    return sameEmail || sameReg;
  });
  if (duplicate) {
    throw new Error('Duplicate registration detected.');
  }

  const sanitizedRegNumber = String(payload.regNumber || '').trim().replace(/\s+/g, '');
  const id = sanitizedRegNumber ? `INNO${sanitizedRegNumber}` : generateRegistrationId(rows);
  const timestamp = new Date().toISOString();
  const row = {
    'Registration ID': id,
    Timestamp: timestamp,
    Name: payload.fullName || '',
    'Register Number': payload.regNumber || '',
    Department: payload.department || '',
    Year: payload.year || '',
    Email: payload.email || '',
    Phone: payload.phone || '',
    Gender: payload.gender || '',
    Skills: Array.isArray(payload.skills) ? payload.skills.join(', ') : payload.skills || '',
    Interest: payload.interest || '',
    Experience: payload.experience || '',
    Reason: payload.reason || '',
    'Photo Name': payload.photoName || '',
    'Photo Type': payload.photoType || '',
    'Photo Data': payload.photoBase64 || '',
    'Resume Name': payload.resumeName || '',
    'Resume Type': payload.resumeType || '',
    'Resume Data': payload.resumeBase64 || '',
    Status: 'Pending'
  };
  rows.push(row);
  saveRegistrationsToStorage(rows);
  return { ok: true, registrationId: id };
}

function updateRegistrationRow(id, updates) {
  const rows = loadRegistrationsFromStorage();
  const index = rows.findIndex((row) => row['Registration ID'] === id);
  if (index < 0) {
    return { ok: false, error: 'Registration not found.' };
  }
  rows[index] = { ...rows[index], ...updates };
  saveRegistrationsToStorage(rows);
  return { ok: true };
}

function deleteRegistrationRow(id) {
  const rows = loadRegistrationsFromStorage();
  const index = rows.findIndex((row) => row['Registration ID'] === id);
  if (index < 0) {
    return { ok: false, error: 'Registration not found.' };
  }
  rows.splice(index, 1);
  saveRegistrationsToStorage(rows);
  return { ok: true };
}

function postAdminAction(action, id, updates = {}) {
  if (!isAdminAuthenticated()) {
    throw new Error('Invalid admin session. Please log in again.');
  }

  let result;
  if (action === 'update') {
    result = updateRegistrationRow(id, updates);
  } else if (action === 'delete') {
    result = deleteRegistrationRow(id);
  } else {
    throw new Error('Unsupported admin action.');
  }

  if (!result.ok) {
    throw new Error(result.error || 'Unable to complete action.');
  }

  return result;
}

function loadAdminData(password) {
  if (isAdminAuthenticated()) {
    return Promise.resolve(loadRegistrationsFromStorage());
  }

  if (String(password || '') !== ADMIN_PASSWORD) {
    throw new Error('Invalid admin password.');
  }

  setAdminAuthenticated(true);
  return Promise.resolve(loadRegistrationsFromStorage());
}

function submitRegistration(formData) {
  return addRegistration(formData);
}

function initRegistrationForm() {
  const form = document.getElementById('applyForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById('cancelRegistrationBtn');
  const formStatus = document.getElementById('formStatus');
  const photoInput = document.getElementById('photo');
  const resumeInput = document.getElementById('resume');
  const photoPreview = document.getElementById('photoPreview');
  const resumePreview = document.getElementById('resumePreview');

  photoInput?.addEventListener('change', () => previewUploadedFile(photoInput, photoPreview, true));
  resumeInput?.addEventListener('change', () => previewUploadedFile(resumeInput, resumePreview));

  cancelBtn?.addEventListener('click', () => {
    form.reset();
    const photoPreview = document.getElementById('photoPreview');
    const resumePreview = document.getElementById('resumePreview');
    photoPreview.hidden = true;
    resumePreview.hidden = true;
    photoPreview.innerHTML = '';
    resumePreview.innerHTML = '';
    formStatus.textContent = 'Form cleared. You can start again.';
    formStatus.className = 'form-status';
    window.location.href = 'index.html';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = {
      fullName: document.getElementById('fullName'),
      regNumber: document.getElementById('regNumber'),
      department: document.getElementById('department'),
      year: document.getElementById('year'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      gender: document.getElementById('gender'),
      skills: document.getElementById('skills'),
      interest: document.getElementById('interest'),
      experience: document.getElementById('experience'),
      reason: document.getElementById('reason')
    };

    const requiredChecks = [
      ['fullName', 'Please enter your full name.'],
      ['regNumber', 'Please enter your register number.'],
      ['department', 'Please select your department.'],
      ['year', 'Please select your year.'],
      ['email', 'Please enter a valid email.'],
      ['phone', 'Please enter a valid phone number.'],
      ['gender', 'Please select your gender.'],
      ['skills', 'Please enter your skills.'],
      ['interest', 'Please enter your area of interest.'],
      ['experience', 'Please mention your previous experience.'],
      ['reason', 'Please explain why you want to join.']
    ];

    let valid = true;
    requiredChecks.forEach(([key, message]) => {
      if (!validateField(fields[key], message)) valid = false;
    });

    if (!valid) {
      if (formStatus) {
        formStatus.textContent = 'Please complete the highlighted fields.';
        formStatus.className = 'form-status is-error';
      }
      return;
    }

    setButtonLoading(submitBtn, true);
    formStatus.textContent = 'Saving your registration…';
    formStatus.className = 'form-status';

    try {
      const payload = {
        fullName: sanitizeText(fields.fullName.value),
        regNumber: sanitizeText(fields.regNumber.value),
        department: sanitizeText(fields.department.value),
        year: sanitizeText(fields.year.value),
        email: sanitizeText(fields.email.value),
        phone: sanitizeText(fields.phone.value),
        gender: sanitizeText(fields.gender.value),
        skills: sanitizeText(fields.skills.value).split(',').map((s) => s.trim()).filter(Boolean),
        interest: sanitizeText(fields.interest.value),
        experience: sanitizeText(fields.experience.value),
        reason: sanitizeText(fields.reason.value),
        photoUrl: '',
        resumeUrl: '',
        _gotcha: document.querySelector('input[name="_gotcha"]')?.value || ''
      };

      if (photoInput?.files?.[0]) {
        payload.photoBase64 = await readFileAsBase64(photoInput.files[0]);
        payload.photoName = photoInput.files[0].name;
        payload.photoType = photoInput.files[0].type;
      }
      if (resumeInput?.files?.[0]) {
        payload.resumeBase64 = await readFileAsBase64(resumeInput.files[0]);
        payload.resumeName = resumeInput.files[0].name;
        payload.resumeType = resumeInput.files[0].type;
      }

      const result = await submitRegistration(payload);
      formStatus.textContent = `✅ Registration complete! Your ID is ${result.registrationId}.`;
      formStatus.className = 'form-status is-success';
      showToast(`🎉 Registration completed successfully! ID: ${result.registrationId}`, 'success');
      showPopup(`🎉 Registration successful! Your ID is ${result.registrationId}`, 'success');
      form.reset();
      photoPreview.hidden = true;
      resumePreview.hidden = true;
      photoPreview.innerHTML = '';
      resumePreview.innerHTML = '';
    } catch (error) {
      const message = error.message || 'Submission failed.';
      formStatus.textContent = message;
      formStatus.className = 'form-status is-error';
      showToast(message, 'error');
      showPopup(message, 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function renderTable(data) {
  const tbody = document.getElementById('registrationsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7">No registrations found.</td></tr>';
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement('tr');
    const emailValue = row.Email || row['Email'] || '';
    tr.innerHTML = `
      <td>${row['Registration ID'] || ''}</td>
      <td>${row.Name || ''}</td>
      <td>${emailValue}</td>
      <td>${row.Phone || row['Phone'] || ''}</td>
      <td>${row.Department || ''}</td>
      <td>${row.Year || ''}</td>
      <td><span class="status-badge ${String(row.Status || 'Pending').toLowerCase()}">${row.Status || 'Pending'}</span></td>
      <td>
        <div class="action-row">
          <button class="btn btn-outline small-btn" data-action="approve" data-id="${row['Registration ID'] || ''}">Approve</button>
          <button class="btn btn-outline small-btn" data-action="reject" data-id="${row['Registration ID'] || ''}">Reject</button>
          <button class="btn btn-outline small-btn" data-action="delete" data-id="${row['Registration ID'] || ''}">Delete</button>
        </div>
      </td>`;    tbody.appendChild(tr);
  });
}

async function initAdminDashboard() {
  const loginCard = document.getElementById('loginCard');
  const adminDashboard = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('loginForm');
  const adminPasswordInput = document.getElementById('adminPassword');
  const logoutBtn = document.getElementById('logoutBtn');

  let allRows = [];
  let adminPassword = '';

  const loginStatus = document.getElementById('loginStatus');
  if (loginStatus) {
    loginStatus.textContent = '';
    loginStatus.className = 'form-status';
  }

  const togglePasswordBtn = document.getElementById('togglePassword');
  adminPasswordInput?.addEventListener('focus', () => {
    adminPasswordInput.classList.add('has-focus');
  });
  adminPasswordInput?.addEventListener('blur', () => {
    adminPasswordInput.classList.remove('has-focus');
  });
  togglePasswordBtn?.addEventListener('click', () => {
    if (!adminPasswordInput) return;
    const isShowing = adminPasswordInput.type === 'text';
    adminPasswordInput.type = isShowing ? 'password' : 'text';
    togglePasswordBtn.textContent = isShowing ? 'Show' : 'Hide';
    togglePasswordBtn.setAttribute('aria-label', isShowing ? 'Show password' : 'Hide password');
  });

  if (loginCard) loginCard.hidden = isAdminAuthenticated();
  if (adminDashboard) {
    adminDashboard.hidden = !isAdminAuthenticated();
    if (!adminDashboard.hidden) {
      requestAnimationFrame(() => adminDashboard.classList.add('visible'));
    }
  }

  async function fetchRows() {
    try {
      allRows = await loadAdminData(adminPassword);
      renderTable(allRows);
    } catch (error) {
      showToast(error.message || 'Could not load records.', 'error');
      if (loginStatus) {
        loginStatus.textContent = error.message || 'Could not load records.';
        loginStatus.className = 'form-status is-error';
      }
    }
  }


  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    adminPassword = adminPasswordInput?.value || '';
    try {
      await fetchRows();
      if (loginCard) loginCard.hidden = true;
      if (adminDashboard) {
        adminDashboard.hidden = false;
        requestAnimationFrame(() => adminDashboard.classList.add('visible'));
      }
      showToast('Admin dashboard unlocked.', 'success');
    } catch (error) {
      if (loginStatus) {
        loginStatus.textContent = error.message || 'Invalid password.';
        loginStatus.className = 'form-status is-error';
      }
    }
  });

  document.getElementById('registrationsBody')?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    const row = allRows.find((item) => item['Registration ID'] === id);
    if (!row) {
      showToast('Registration record not found.', 'error');
      return;
    }

    try {
      if (action === 'approve') {
        await postAdminAction('update', id, { Status: 'Approved' });
        showToast('Approved.', 'success');
      } else if (action === 'reject') {
        await postAdminAction('update', id, { Status: 'Rejected' });
        showToast('Registration rejected.', 'success');
      } else if (action === 'delete') {
        await postAdminAction('delete', id);
        showToast('Registration deleted.', 'success');
      }
      await fetchRows();
    } catch (error) {
      showToast(error.message || 'Could not complete action.', 'error');
    }
  });

  function handleLogout() {
    setAdminAuthenticated(false);
    if (loginCard) loginCard.hidden = false;
    if (adminDashboard) {
      adminDashboard.classList.remove('visible');
      adminDashboard.classList.add('hiding');
      const cleanup = () => {
        adminDashboard.hidden = true;
        adminDashboard.classList.remove('hiding');
        adminDashboard.removeEventListener('transitionend', cleanup);
      };
      adminDashboard.addEventListener('transitionend', cleanup);
    }
    if (adminPasswordInput) {
      adminPasswordInput.value = '';
    }
  }

  logoutBtn?.addEventListener('click', handleLogout);

  if (isAdminAuthenticated()) {
    await fetchRows();
  }
}


window.addEventListener('DOMContentLoaded', () => {
  initFormEnhancements();
  initRegistrationForm();
  initAdminDashboard();
  initLeaderImageLightbox();

  const loginCard = document.getElementById('loginCard');
  if (loginCard && !loginCard.hidden) {
    requestAnimationFrame(() => loginCard.classList.add('visible'));
  }
});

function createLeaderLightbox(src, alt) {
  const backdrop = document.createElement('div');
  backdrop.className = 'image-lightbox-backdrop';
  backdrop.tabIndex = -1;

  const card = document.createElement('div');
  card.className = 'image-lightbox-card';
  card.innerHTML = `
    <button type="button" class="image-lightbox-close" aria-label="Close image">×</button>
    <img src="${src}" alt="${alt}">
  `;

  backdrop.appendChild(card);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop || event.target.classList.contains('image-lightbox-close')) {
      backdrop.remove();
    }
  });

  document.addEventListener('keydown', function handleKeydown(event) {
    if (event.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', handleKeydown);
    }
  });

  document.body.appendChild(backdrop);
}

function initLeaderImageLightbox() {
  document.querySelectorAll('.leader-avatar img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      createLeaderLightbox(img.src, img.alt || 'Leader photo');
    });
  });
}
