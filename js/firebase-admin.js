/**
 * firebase-admin.js
 * Admin panel logic: Firebase Auth (email/password) + Firestore CRUD.
 * Loaded ONLY on careers-admin.html.
 * Never loaded on any public page.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, doc,
  addDoc, updateDoc, deleteDoc, getDocs,
  query, orderBy, serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/* ── Firebase init ── */
const firebaseConfig = {
  apiKey:            "AIzaSyDJGAqXn8Jp2kAsHwBnh2tSpV0aCtr-Jg4",
  authDomain:        "hisabdo-admin.firebaseapp.com",
  projectId:         "hisabdo-admin",
  storageBucket:     "hisabdo-admin.firebasestorage.app",
  messagingSenderId: "438594572472",
  appId:             "1:438594572472:web:c06fe2e6260173d50f244d"
};

const app  = initializeApp(firebaseConfig, 'careers-admin');
const auth = getAuth(app);
const db   = getFirestore(app);

/* ── DOM refs ── */
const loginScreen   = document.getElementById('login-screen');
const adminPanel    = document.getElementById('admin-panel');
const loginForm     = document.getElementById('login-form');
const loginError    = document.getElementById('login-error');
const logoutBtn     = document.getElementById('logout-btn');
const adminEmail    = document.getElementById('admin-email-display');
const jobsTableBody = document.getElementById('jobs-table-body');
const jobsCount     = document.getElementById('jobs-count');
const formSection   = document.getElementById('form-section');
const jobForm       = document.getElementById('job-form');
const formTitle     = document.getElementById('form-title');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const addJobBtn     = document.getElementById('add-job-btn');
const toast         = document.getElementById('toast');
const loadingOverlay = document.getElementById('loading-overlay');

/* ── State ── */
let editingId   = null;
let allJobs     = [];

/* ── Helpers ── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = 'toast toast-' + type + ' toast-visible';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('toast-visible'), 3200);
}

function setLoading(on) {
  loadingOverlay.style.display = on ? 'flex' : 'none';
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseLines(str) {
  return str.split('\n').map(s => s.trim()).filter(Boolean);
}

function linesToText(arr) {
  return Array.isArray(arr) ? arr.join('\n') : (arr || '');
}

function isExpired(ts) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d < new Date();
}

/* ── Auth state ── */
onAuthStateChanged(auth, async user => {
  if (user) {
    // Verify admin claim
    const token = await user.getIdTokenResult(true);
    if (!token.claims.admin) {
      showToast('Access denied. Not an admin account.', 'error');
      await signOut(auth);
      return;
    }
    loginScreen.style.display  = 'none';
    adminPanel.style.display   = 'block';
    adminEmail.textContent     = user.email;
    loadJobs();
  } else {
    loginScreen.style.display  = 'flex';
    adminPanel.style.display   = 'none';
  }
});

/* ── Login ── */
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = friendlyAuthError(err.code);
  } finally {
    setLoading(false);
  }
});

function friendlyAuthError(code) {
  const map = {
    'auth/invalid-credential':    'Invalid email or password.',
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/too-many-requests':     'Too many attempts. Try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
  };
  return map[code] || 'Login failed. Please try again.';
}

/* ── Logout ── */
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  showToast('Logged out.', 'info');
});

/* ── Load jobs ── */
async function loadJobs() {
  setLoading(true);
  try {
    const q    = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    allJobs    = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable();
  } catch (err) {
    showToast('Failed to load jobs: ' + err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ── Render table ── */
function renderTable(filter = '') {
  const filtered = filter
    ? allJobs.filter(j =>
        (j.title || '').toLowerCase().includes(filter) ||
        (j.department || '').toLowerCase().includes(filter))
    : allJobs;

  jobsCount.textContent = filtered.length;

  if (!filtered.length) {
    jobsTableBody.innerHTML = `
      <tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px;">
        No jobs found.
      </td></tr>`;
    return;
  }

  jobsTableBody.innerHTML = filtered.map(job => {
    const expired = isExpired(job.closingDate);
    const pubBadge = job.published
      ? `<span class="badge-pill badge-green">Published</span>`
      : `<span class="badge-pill badge-gray">Draft</span>`;
    const openBadge = expired
      ? `<span class="badge-pill badge-red">Closed</span>`
      : `<span class="badge-pill badge-green">${esc(job.openStatus || 'Open')}</span>`;

    return `
      <tr>
        <td>
          <div style="font-weight:600;font-size:14px;">${esc(job.title)}</div>
          <div style="color:var(--muted);font-size:12px;">${esc(job.department || '')}</div>
        </td>
        <td>${esc(job.employmentType || '—')}</td>
        <td>${pubBadge}</td>
        <td>${openBadge}</td>
        <td style="color:var(--muted);font-size:13px;">${formatDate(job.createdAt)}</td>
        <td style="color:var(--muted);font-size:13px;">${formatDate(job.closingDate)}</td>
        <td>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="tbl-btn tbl-btn-edit"   data-id="${esc(job.id)}"><i class="fas fa-edit"></i> Edit</button>
            <button class="tbl-btn tbl-btn-toggle" data-id="${esc(job.id)}" data-pub="${job.published}">
              <i class="fas fa-${job.published ? 'eye-slash' : 'eye'}"></i>
              ${job.published ? 'Unpublish' : 'Publish'}
            </button>
            <button class="tbl-btn tbl-btn-delete" data-id="${esc(job.id)}" data-title="${esc(job.title)}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Table button events
  jobsTableBody.querySelectorAll('.tbl-btn-edit').forEach(btn =>
    btn.addEventListener('click', () => openEditForm(btn.dataset.id)));

  jobsTableBody.querySelectorAll('.tbl-btn-toggle').forEach(btn =>
    btn.addEventListener('click', () => togglePublish(btn.dataset.id, btn.dataset.pub === 'true')));

  jobsTableBody.querySelectorAll('.tbl-btn-delete').forEach(btn =>
    btn.addEventListener('click', () => confirmDelete(btn.dataset.id, btn.dataset.title)));
}

/* ── Search ── */
document.getElementById('search-input').addEventListener('input', e => {
  renderTable(e.target.value.toLowerCase().trim());
});

/* ── Add job button ── */
addJobBtn.addEventListener('click', () => openAddForm());

/* ── Cancel form ── */
cancelFormBtn.addEventListener('click', () => {
  formSection.style.display = 'none';
  jobForm.reset();
  editingId = null;
});

/* ── Open add form ── */
function openAddForm() {
  editingId = null;
  formTitle.textContent = 'Add New Job';
  jobForm.reset();
  document.getElementById('f-status').value    = 'published';
  document.getElementById('f-published').value = 'true';
  document.getElementById('f-open-status').value = 'Open';
  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Open edit form ── */
function openEditForm(id) {
  const job = allJobs.find(j => j.id === id);
  if (!job) return;
  editingId = id;
  formTitle.textContent = 'Edit Job';

  const f = jobForm;
  f['f-title'].value          = job.title          || '';
  f['f-slug'].value           = job.slug            || '';
  f['f-department'].value     = job.department      || '';
  f['f-employment-type'].value= job.employmentType  || '';
  f['f-location'].value       = job.location        || '';
  f['f-workplace-type'].value = job.workplaceType   || '';
  f['f-experience'].value     = job.experience      || '';
  f['f-description'].value    = job.description     || '';
  f['f-responsibilities'].value = linesToText(job.responsibilities);
  f['f-requirements'].value   = linesToText(job.requirements);
  f['f-skills'].value         = linesToText(job.skills);
  f['f-salary'].value         = job.salary          || '';
  f['f-openings'].value       = job.openings        || '';
  f['f-application-url'].value  = job.applicationUrl   || '';
  f['f-application-email'].value = job.applicationEmail || '';
  f['f-application-phone'].value = job.applicationPhone || '';
  f['f-status'].value         = job.status          || 'published';
  f['f-published'].value      = String(job.published !== false);
  f['f-open-status'].value    = job.openStatus      || 'Open';

  if (job.closingDate) {
    const d = job.closingDate.toDate ? job.closingDate.toDate() : new Date(job.closingDate);
    f['f-closing-date'].value = d.toISOString().split('T')[0];
  } else {
    f['f-closing-date'].value = '';
  }

  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Auto-slug from title ── */
document.getElementById('f-title').addEventListener('input', e => {
  if (!editingId) {
    document.getElementById('f-slug').value = slugify(e.target.value);
  }
});

/* ── Submit form ── */
jobForm.addEventListener('submit', async e => {
  e.preventDefault();
  setLoading(true);

  const appUrl   = document.getElementById('f-application-url').value.trim();
  const appEmail = document.getElementById('f-application-email').value.trim();
  const appPhone = document.getElementById('f-application-phone').value.trim();
  if (!appUrl && !appEmail && !appPhone) {
    showToast('Please provide at least one: Application URL, Email or Phone.', 'error');
    setLoading(false);
    return;
  }

  const closingRaw = document.getElementById('f-closing-date').value;
  const closingTs  = closingRaw ? Timestamp.fromDate(new Date(closingRaw)) : null;

  const data = {
    title:           document.getElementById('f-title').value.trim(),
    slug:            document.getElementById('f-slug').value.trim(),
    department:      document.getElementById('f-department').value.trim(),
    employmentType:  document.getElementById('f-employment-type').value.trim(),
    location:        document.getElementById('f-location').value.trim(),
    workplaceType:   document.getElementById('f-workplace-type').value.trim(),
    experience:      document.getElementById('f-experience').value.trim(),
    description:     document.getElementById('f-description').value.trim(),
    responsibilities: parseLines(document.getElementById('f-responsibilities').value),
    requirements:    parseLines(document.getElementById('f-requirements').value),
    skills:          parseLines(document.getElementById('f-skills').value),
    salary:          document.getElementById('f-salary').value.trim(),
    openings:        document.getElementById('f-openings').value.trim(),
    applicationUrl:   document.getElementById('f-application-url').value.trim(),
    applicationEmail: document.getElementById('f-application-email').value.trim(),
    applicationPhone: document.getElementById('f-application-phone').value.trim(),
    status:          document.getElementById('f-status').value,
    published:       document.getElementById('f-published').value === 'true',
    openStatus:      document.getElementById('f-open-status').value,
    closingDate:     closingTs,
    updatedAt:       serverTimestamp(),
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, 'jobs', editingId), data);
      showToast('Job updated successfully.');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'jobs'), data);
      showToast('Job added successfully.');
    }
    formSection.style.display = 'none';
    jobForm.reset();
    editingId = null;
    await loadJobs();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    setLoading(false);
  }
});

/* ── Toggle publish ── */
async function togglePublish(id, currentlyPublished) {
  setLoading(true);
  try {
    const newVal = !currentlyPublished;
    await updateDoc(doc(db, 'jobs', id), {
      published:  newVal,
      status:     newVal ? 'published' : 'draft',
      updatedAt:  serverTimestamp()
    });
    showToast(newVal ? 'Job published.' : 'Job moved to draft.');
    await loadJobs();
  } catch (err) {
    showToast('Update failed: ' + err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ── Delete with confirmation ── */
function confirmDelete(id, title) {
  const modal = document.getElementById('confirm-modal');
  document.getElementById('confirm-modal-title').textContent =
    `Delete "${title}"?`;
  modal.style.display = 'flex';

  const confirmBtn = document.getElementById('confirm-delete-btn');
  const cancelBtn  = document.getElementById('confirm-cancel-btn');

  const cleanup = () => {
    modal.style.display = 'none';
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  };

  document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    cleanup();
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jobs', id));
      showToast('Job deleted.');
      await loadJobs();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('confirm-cancel-btn').addEventListener('click', cleanup);
  modal.addEventListener('click', e => { if (e.target === modal) cleanup(); });
}
/* ── Smart Fill with AI ── */
const smartFillBtn = document.getElementById('smart-fill-btn');
const smartFillInput = document.getElementById('smart-fill-input');

smartFillBtn.addEventListener('click', async () => {
  const text = smartFillInput.value.trim();

  if (!text) {
    showToast('Please paste a job description first.', 'error');
    smartFillInput.focus();
    return;
  }

  smartFillBtn.disabled = true;
  smartFillBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

  try {
    const response = await fetch('/api/smart-fill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Smart Fill failed.');
    }

    // Fill form fields
    document.getElementById('f-title').value =
      result.title || '';

    document.getElementById('f-slug').value =
      slugify(result.title || '');

    document.getElementById('f-department').value =
      result.department || '';

    document.getElementById('f-employment-type').value =
      result.employmentType || '';

    document.getElementById('f-location').value =
      result.location || '';

    document.getElementById('f-workplace-type').value =
      result.workplaceType || '';

    document.getElementById('f-experience').value =
      result.experience || '';

    document.getElementById('f-salary').value =
      result.salary || '';

    document.getElementById('f-openings').value =
      result.openings || '';

    document.getElementById('f-description').value =
      result.description || '';

    document.getElementById('f-responsibilities').value =
      linesToText(result.responsibilities);

    document.getElementById('f-requirements').value =
      linesToText(result.requirements);

    document.getElementById('f-skills').value =
      linesToText(result.skills);

    document.getElementById('f-application-url').value =
      result.applicationUrl || '';

    document.getElementById('f-application-email').value =
      result.applicationEmail || '';

    document.getElementById('f-application-phone').value =
      result.applicationPhone || '';

    showToast('Job details filled successfully.');
    
  } catch (err) {
    console.error('Smart Fill error:', err);
    showToast('Smart Fill failed: ' + err.message, 'error');
  } finally {
    smartFillBtn.disabled = false;
    smartFillBtn.innerHTML =
      '<i class="fas fa-magic"></i> Auto Fill';
  }
});