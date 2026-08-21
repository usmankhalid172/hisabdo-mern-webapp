import React from 'react';

export const metadata = {
  title: 'HisabDo – Data Deletion',
  description: 'Learn how to permanently delete your HisabDo app data or account directly from the mobile app.',
};

export default function DeleteDataPage() {
  return (
    <main className="delete-data-shell">
      <section className="hero-section">
        <div className="badge">🗑️ Data Deletion</div>
        <h1>HisabDo – Data Deletion</h1>
        <p>
          Users can delete their data directly from the HisabDo mobile app. This page provides the official app-based steps for data and account deletion.
        </p>
      </section>

      <section className="content-section">
        <div className="card warning-card">
          <h2>Important Notice</h2>
          <p>
            Deletion is permanent, immediate, and cannot be restored. Applicable local SQLite data stored on your device and associated Supabase cloud data will be deleted.
          </p>
        </div>

        <div className="card">
          <h2>How to delete your data</h2>
          <p>To delete your data or account, follow these steps inside the HisabDo mobile app:</p>
          <ol>
            <li>Open the HisabDo app.</li>
            <li>Go to <strong>Settings</strong>.</li>
            <li>Open <strong>Danger Zone</strong>.</li>
            <li>Select <strong>Delete All My Data</strong> to permanently delete app/account-related data while keeping the account.</li>
            <li>Select <strong>Delete Account</strong> to permanently delete the account and associated data.</li>
          </ol>
        </div>

        <div className="card">
          <h2>What these options do</h2>
          <div className="option-grid">
            <div className="option-box">
              <h3>Delete All My Data</h3>
              <p>Deletes the user's data without deleting the account. This removes app-related data while keeping the account active.</p>
            </div>
            <div className="option-box">
              <h3>Delete Account</h3>
              <p>Deletes the user's account and associated data. This removes the account together with its related information.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Important note</h2>
          <p>No web-based deletion form or online deletion tool is available on this website. The actual deletion must remain inside the mobile app, as described above.</p>
        </div>
      </section>

      <style jsx global>{`
        :root {
          color-scheme: dark;
          --bg: #060d1a;
          --bg2: #0b1220;
          --surface: rgba(15,23,42,.78);
          --border: rgba(30,41,59,.9);
          --text: #f1f5f9;
          --muted: #94a3b8;
          --green: #22c55e;
          --green-dim: rgba(34,197,94,.12);
        }

        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }

        .delete-data-shell {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,.08) 0%, transparent 70%),
                      radial-gradient(ellipse at top, #0f1e35, var(--bg));
        }

        .hero-section {
          text-align: center;
          padding: 100px 24px 70px;
          max-width: 860px;
          margin: 0 auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--green-dim);
          border: 1px solid rgba(34,197,94,.3);
          color: var(--green);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 22px;
        }

        .hero-section h1 {
          font-size: clamp(30px, 5.5vw, 56px);
          font-weight: 800;
          letter-spacing: -1.5px;
          margin: 0 0 16px;
          background: linear-gradient(135deg, #fff 40%, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-section p {
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
          max-width: 720px;
          margin: 0 auto;
        }

        .content-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px 28px;
          margin-top: 20px;
          box-shadow: 0 12px 32px rgba(0,0,0,.18);
        }

        .warning-card {
          background: linear-gradient(135deg, rgba(34,197,94,.16), rgba(15,23,42,.72));
          border-color: rgba(34,197,94,.3);
        }

        .card h2 {
          font-size: 20px;
          margin: 0 0 10px;
          color: var(--text);
        }

        .card p,
        .card li {
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.85;
        }

        .card ol {
          padding-left: 20px;
          margin: 12px 0 0;
        }

        .card li {
          margin-bottom: 8px;
        }

        .option-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .option-box {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(148,163,184,.14);
          border-radius: 12px;
          padding: 16px;
        }

        .option-box h3 {
          font-size: 16px;
          margin: 0 0 8px;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .hero-section { padding: 80px 20px 60px; }
          .content-section { padding: 0 20px 60px; }
          .card { padding: 18px 16px; }
          .option-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
