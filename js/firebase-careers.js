/**
 * firebase-careers.js
 * Public-facing: reads only published jobs from Firestore.
 * Loaded only on careers.html.
 * No auth required. No write access.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, query, where, orderBy, getDocs }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyDJGAqXn8Jp2kAsHwBnh2tSpV0aCtr-Jg4",
  authDomain:        "hisabdo-admin.firebaseapp.com",
  projectId:         "hisabdo-admin",
  storageBucket:     "hisabdo-admin.firebasestorage.app",
  messagingSenderId: "438594572472",
  appId:             "1:438594572472:web:c06fe2e6260173d50f244d"
};

const app = initializeApp(firebaseConfig, 'careers-public');
const db  = getFirestore(app);

/* ── Helpers ── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isExpired(ts) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d < new Date();
}

/* ── No-jobs fallback (matches existing careers.html design) ── */
function renderNoJobs(container) {
  container.innerHTML = `
    <div class="card fade-up" style="text-align:center;padding:40px 28px;">
      <div class="card-icon" style="background:rgba(148,163,184,.08);border-color:rgba(148,163,184,.2);color:var(--muted);">
        <i class="fas fa-lock"></i>
      </div>
      <h3 style="font-size:20px;margin-bottom:10px;color:var(--muted);">Currently Not Hiring</h3>
      <p style="color:var(--muted);margin-bottom:0;">
        We are not actively hiring for any positions right now.
        Check back later — we'll announce when roles open up.
      </p>
    </div>`;
  // Trigger fade-up for dynamically injected elements
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  });
}

/* ── Single job card ── */
function buildJobCard(job) {
  const closed = isExpired(job.closingDate);
  const statusLabel = closed ? 'Closed' : (job.openStatus || 'Open');
  const statusColor = closed
    ? 'rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171'
    : 'rgba(34,197,94,.08);border-color:rgba(34,197,94,.25);color:var(--green)';

  const tags = [
    job.employmentType  && `<span class="job-tag">${esc(job.employmentType)}</span>`,
    job.workplaceType   && `<span class="job-tag">${esc(job.workplaceType)}</span>`,
    job.location        && `<span class="job-tag"><i class="fas fa-map-marker-alt" style="font-size:11px;"></i> ${esc(job.location)}</span>`,
    job.experience      && `<span class="job-tag"><i class="fas fa-briefcase" style="font-size:11px;"></i> ${esc(job.experience)}</span>`,
    job.department      && `<span class="job-tag">${esc(job.department)}</span>`,
  ].filter(Boolean).join('');

  const salary   = job.salary   ? `<div class="job-detail"><i class="fas fa-money-bill-wave"></i> ${esc(job.salary)}</div>` : '';
  const openings = job.openings ? `<div class="job-detail"><i class="fas fa-users"></i> ${esc(job.openings)} opening${Number(job.openings) > 1 ? 's' : ''}</div>` : '';
  const closing  = job.closingDate
    ? `<div class="job-detail"><i class="fas fa-calendar-times"></i> Closes ${formatDate(job.closingDate)}</div>`
    : '';

  const applyBtn = job.applicationUrl && !closed
    ? `<a class="btn" href="${esc(job.applicationUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:14px;padding:10px 22px;">
         <i class="fas fa-paper-plane"></i> Apply Now
       </a>`
    : `<span class="btn" style="opacity:.45;cursor:not-allowed;pointer-events:none;font-size:14px;padding:10px 22px;">
         <i class="fas fa-ban"></i> ${closed ? 'Applications Closed' : 'Apply Now'}
       </span>`;

  return `
    <div class="card card-left fade-up" style="padding:28px 26px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
        <div>
          <h3 style="font-size:19px;margin-bottom:6px;">${esc(job.title)}</h3>
          ${job.department ? `<div style="color:var(--muted);font-size:13px;">${esc(job.department)}</div>` : ''}
        </div>
        <span style="background:${statusColor};padding:4px 14px;border-radius:20px;font-size:12.5px;font-weight:600;border:1px solid;white-space:nowrap;">
          ${esc(statusLabel)}
        </span>
      </div>

      ${tags ? `<div class="job-tags" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">${tags}</div>` : ''}

      ${(salary || openings || closing) ? `
        <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:16px;">
          ${salary}${openings}${closing}
        </div>` : ''}

      ${job.description ? `<p style="color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:18px;">${esc(job.description)}</p>` : ''}

      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        ${applyBtn}
        <button class="btn-outline job-details-btn" data-id="${esc(job.id)}"
          style="font-size:14px;padding:9px 20px;cursor:pointer;background:none;border:1.5px solid #334155;">
          <i class="fas fa-info-circle"></i> View Details
        </button>
      </div>
    </div>`;
}

/* ── Job detail modal ── */
function buildModal(job) {
  const listItems = arr => Array.isArray(arr) && arr.length
    ? `<ul style="padding-left:18px;margin-top:8px;">${arr.map(i => `<li style="color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:6px;">${esc(i)}</li>`).join('')}</ul>`
    : '';

  const section = (title, content) => content
    ? `<div style="margin-bottom:20px;">
         <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--green);margin-bottom:8px;">${title}</div>
         ${content}
       </div>`
    : '';

  return `
    <div id="job-modal-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);
      z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div style="
        background:#0b1220;border:1px solid var(--border);border-radius:var(--radius);
        max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:32px 28px;position:relative;">
        <button id="job-modal-close" style="
          position:absolute;top:16px;right:16px;background:rgba(255,255,255,.06);
          border:1px solid var(--border);color:var(--muted);width:34px;height:34px;
          border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-times"></i>
        </button>

        <h2 style="font-size:22px;font-weight:700;margin-bottom:6px;">${esc(job.title)}</h2>
        ${job.department ? `<div style="color:var(--muted);font-size:14px;margin-bottom:20px;">${esc(job.department)}</div>` : ''}

        ${section('Description', job.description ? `<p style="color:var(--muted);font-size:14px;line-height:1.75;">${esc(job.description)}</p>` : '')}
        ${section('Responsibilities', listItems(job.responsibilities))}
        ${section('Requirements', listItems(job.requirements))}
        ${section('Skills', listItems(job.skills))}
        ${job.salary   ? section('Salary / Compensation', `<p style="color:var(--muted);font-size:14px;">${esc(job.salary)}</p>`) : ''}
        ${job.openings ? section('Openings', `<p style="color:var(--muted);font-size:14px;">${esc(job.openings)}</p>`) : ''}
        ${job.closingDate ? section('Application Deadline', `<p style="color:var(--muted);font-size:14px;">${formatDate(job.closingDate)}</p>`) : ''}

        ${job.applicationUrl && !isExpired(job.closingDate)
          ? `<a class="btn" href="${esc(job.applicationUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top:8px;">
               <i class="fas fa-paper-plane"></i> Apply Now
             </a>`
          : ''}
      </div>
    </div>`;
}

/* ── Main render ── */
async function renderJobs() {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  // Loading state
  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--muted);">
      <i class="fas fa-circle-notch fa-spin" style="font-size:24px;color:var(--green);margin-bottom:12px;display:block;"></i>
      Loading open roles…
    </div>`;

  try {
    const q = query(
      collection(db, 'jobs'),
      where('published', '==', true),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      renderNoJobs(container);
      return;
    }

    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    container.innerHTML = jobs.map(buildJobCard).join('');

    // Fade-up animation
    requestAnimationFrame(() => {
      container.querySelectorAll('.fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    });

    // Detail modal
    const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));
    container.addEventListener('click', e => {
      const btn = e.target.closest('.job-details-btn');
      if (!btn) return;
      const job = jobMap[btn.dataset.id];
      if (!job) return;
      document.body.insertAdjacentHTML('beforeend', buildModal(job));
      document.getElementById('job-modal-close').addEventListener('click', () => {
        document.getElementById('job-modal-overlay')?.remove();
      });
      document.getElementById('job-modal-overlay').addEventListener('click', e => {
        if (e.target.id === 'job-modal-overlay') e.target.remove();
      });
    });

  } catch (err) {
    console.error('HisabDo Careers: Firestore error', err);
    container.innerHTML = `
      <div class="card fade-up" style="text-align:center;padding:40px 28px;">
        <div class="card-icon" style="background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);color:#f87171;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="font-size:18px;margin-bottom:10px;color:#f87171;">Could Not Load Jobs</h3>
        <p style="color:var(--muted);margin-bottom:0;">We couldn't fetch open roles right now. Please refresh the page or try again later.</p>
      </div>`;
    requestAnimationFrame(() => {
      container.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    });
  }
}

/* ── Job tag style (injected once) ── */
const tagStyle = document.createElement('style');
tagStyle.textContent = `
  .job-tag {
    background: rgba(34,197,94,.08);
    border: 1px solid rgba(34,197,94,.2);
    color: var(--green);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .job-detail {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: 13px;
  }
  .job-detail i { color: var(--green); font-size: 12px; }
`;
document.head.appendChild(tagStyle);

renderJobs();
