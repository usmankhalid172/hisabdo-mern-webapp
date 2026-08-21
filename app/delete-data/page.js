import React from 'react';

export const metadata = {
  title: 'HisabDo – Data Deletion',
  description: 'Instructions for deleting a HisabDo account or app data directly from the mobile app for Google Play Console requirements.',
};

export default function DeleteDataPage() {
  return (
    <main className="delete-data-shell">
      <section className="hero-section">
        <div className="badge">🗑️ Account & Data Deletion</div>
        <h1>HisabDo – Data Deletion</h1>
        <p>
          This page provides the instructions required for Google Play Console. Deletion is performed directly inside the HisabDo mobile app.
        </p>
      </section>

      <section className="content-section">
        <div className="card warning-card">
          <h2>1. Delete Your Account &amp; Associated Data</h2>
          <p>Users can permanently delete their HisabDo account and associated data from the mobile app:</p>
          <p className="delete-path"><strong>HisabDo App → Settings → Danger Zone → Delete Account</strong></p>
          <ul>
            <li>Account deletion is permanent.</li>
            <li>Deletion is immediate.</li>
            <li>Deleted data cannot be restored.</li>
            <li>Local SQLite data and associated Supabase cloud data are deleted.</li>
            <li>The Supabase authentication account is also deleted.</li>
            <li>No additional retention period applies, except where legally required.</li>
          </ul>
        </div>

        <div className="card">
          <h2>2. Delete Your Data Without Deleting Your Account</h2>
          <p>Users can delete their data while keeping their account:</p>
          <p className="delete-path"><strong>HisabDo App → Settings → Danger Zone → Delete All My Data</strong></p>
          <ul>
            <li>User data is permanently deleted.</li>
            <li>The account itself remains active.</li>
            <li>Local SQLite data and associated Supabase cloud data are deleted.</li>
            <li>Deletion is immediate and cannot be restored.</li>
          </ul>
        </div>

        <div className="card">
          <h2>Important Note</h2>
          <p>Deletion is performed directly inside the HisabDo mobile app. This webpage only provides the instructions required for users and Google Play.</p>
        </div>
      </section>

      <style jsx global>{`
        :root { color-scheme: dark; --bg: #060d1a; --bg2: #0b1220; --surface: rgba(15,23,42,.78); --border: rgba(30,41,59,.9); --text: #f1f5f9; --muted: #94a3b8; --green: #22c55e; --green-dim: rgba(34,197,94,.12); }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
        .delete-data-shell { min-height: 100vh; background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,.08) 0%, transparent 70%), radial-gradient(ellipse at top, #0f1e35, var(--bg)); }
        .hero-section { text-align: center; padding: 100px 24px 70px; max-width: 860px; margin: 0 auto; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: var(--green-dim); border: 1px solid rgba(34,197,94,.3); color: var(--green); padding: 6px 16px; border-radius: 30px; font-size: 12.5px; font-weight: 600; margin-bottom: 22px; }
        .hero-section h1 { font-size: clamp(30px, 5.5vw, 56px); font-weight: 800; letter-spacing: -1.5px; margin: 0 0 16px; background: linear-gradient(135deg, #fff 40%, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-section p { color: var(--muted); font-size: 16px; line-height: 1.75; max-width: 720px; margin: 0 auto; }
        .content-section { max-width: 900px; margin: 0 auto; padding: 0 24px 80px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px 28px; margin-top: 20px; box-shadow: 0 12px 32px rgba(0,0,0,.18); }
        .warning-card { background: linear-gradient(135deg, rgba(34,197,94,.16), rgba(15,23,42,.72)); border-color: rgba(34,197,94,.3); }
        .card h2 { font-size: 20px; margin: 0 0 10px; color: var(--text); }
        .card p, .card li { color: #cbd5e1; font-size: 15px; line-height: 1.85; }
        .delete-path { margin: 12px 0 8px; padding: 12px 14px; background: rgba(34,197,94,.10); border: 1px solid rgba(34,197,94,.22); border-radius: 10px; color: var(--text); font-size: 15px; }
        .card ul { padding-left: 20px; margin: 12px 0 0; }
        .card li { margin-bottom: 8px; }
        @media (max-width: 768px) { .hero-section { padding: 80px 20px 60px; } .content-section { padding: 0 20px 60px; } .card { padding: 18px 16px; } }
      `}</style>
    </main>
  );
}
