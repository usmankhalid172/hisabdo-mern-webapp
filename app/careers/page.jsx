import Link from 'next/link';

export const metadata = {
  title: 'Careers — HisabDo | Join Our Team',
  description: "Join the HisabDo team. Explore career opportunities, internships, and open roles at HisabDo — Pakistan's digital ledger app.",
};

export default function Careers() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="badge">🚀 We're Building Something Big</div>
        <h1>Careers at HisabDo</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '560px', margin: '0 auto 28px' }}>
          Join the HisabDo team and help us build a digital finance app for users and small businesses in Pakistan. We value talent, hustle, and people who want to create real impact.
        </p>
        <a className="btn" href="https://forms.gle/YhAfaw1CzCF9mEZo9" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-paper-plane"></i> Register for Internship
        </a>
      </section>

      {/* ANNOUNCEMENT BANNER */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', transform: 'translateY(-28px)' }}>
        <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.25)', borderRadius: '14px', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                🚀 Applications Open — 60-Day Remote Internship Bootcamp
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>
                Applications are now open for our <strong style={{ color: '#e2e8f0' }}>60-Day Remote Internship Bootcamp (August–September 2026)</strong> for Undergraduate Students and Recent Graduates.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px' }}>📅 Start: 1 August 2026</span>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px' }}>🏠 Remote (WFH)</span>
              </div>
              <div style={{ background: 'rgba(234,179,8,.06)', border: '1px solid rgba(234,179,8,.2)', borderRadius: '8px', padding: '10px 14px', color: '#fbbf24', fontSize: '13px' }}>
                ⚠️ Limited Seats — Register as soon as possible to secure your spot.
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a className="btn" href="https://forms.gle/YhAfaw1CzCF9mEZo9" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-paper-plane"></i> Register Now
            </a>
          </div>
        </div>
      </div>

      {/* WHY HISABDO */}
      <section className="section">
        <h2 className="fade-up">Why Work With Us?</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up">
          <div className="card card-left">
            <div className="card-icon"><i className="fas fa-rocket"></i></div>
            <h3>Early Stage Impact</h3>
            <p>Join early and shape the product, culture, and direction of a growing startup from the ground up.</p>
          </div>
          <div className="card card-left">
            <div className="card-icon"><i className="fas fa-brain"></i></div>
            <h3>Learn & Grow Fast</h3>
            <p>Work directly with the founding team. No bureaucracy — just real work, real feedback, and real growth.</p>
          </div>
          <div className="card card-left">
            <div className="card-icon"><i className="fas fa-globe"></i></div>
            <h3>Real-World Product</h3>
            <p>Your work reaches real users across Pakistan and helps shape a product that supports everyday business needs.</p>
          </div>
          <div className="card card-left">
            <div className="card-icon"><i className="fas fa-users"></i></div>
            <h3>Collaborative Culture</h3>
            <p>A small, focused team where every person's contribution matters and ideas are always welcome.</p>
          </div>
        </div>
      </section>

      {/* OPEN ROLES */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">Open Roles</h2>
        <div className="section-divider fade-up"></div>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div id="jobs-container">
            {/* Note: In the future, you will map your Bilal's backend API data here to show jobs dynamically. For now, it stays empty just like the original HTML. */}
          </div>
          <noscript><p className="section-sub" style={{ marginTop: '20px' }}>Current openings are loaded dynamically. Please contact support@hisabdo.app if the roles list does not appear.</p></noscript>
        </div>
      </section>

      {/* HOW TO APPLY */}
      <section className="section">
        <h2 className="fade-up">How to Apply</h2>
        <div className="section-divider fade-up"></div>
        <div className="card fade-up" style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 26px' }}>
          <p style={{ lineHeight: '1.8', color: 'var(--muted)' }}>Send us your application through the internship registration form. Include a short introduction, your current experience, and what you would like to learn while working with the HisabDo team. If you are applying for a mentorship or mock interview session, mention your goals clearly so we can prepare the best feedback for you.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.14)', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>What to Share</h3>
              <ul style={{ lineHeight: '1.8', listStyle: 'disc', marginLeft: '18px' }}>
                <li>Your name and current program</li>
                <li>Relevant skills or projects</li>
                <li>Why you want to join HisabDo</li>
                <li>What you want to learn</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.14)', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>What We Offer</h3>
              <ul style={{ lineHeight: '1.8', listStyle: 'disc', marginLeft: '18px' }}>
                <li>Mentorship by the founding team</li>
                <li>Hands-on work in app development and product design</li>
                <li>Feedback on real software, product and go-to-market work</li>
                <li>Practical guidance for professional growth</li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a className="btn" href="https://forms.gle/YhAfaw1CzCF9mEZo9" target="_blank" rel="noopener noreferrer"><i className="fas fa-paper-plane"></i> Apply Now</a>
          </div>
        </div>
      </section>

      {/* WHAT WE LOOK FOR */}
      <section className="section" style={{ background: 'rgba(248,250,252,.9)', border: '1px solid rgba(148,163,184,.16)', borderRadius: '18px', padding: '30px 24px' }}>
        <h2 className="fade-up">What We Look For</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="card card-left"><h3>Curiosity</h3><p>We welcome learners who are passionate about solving real product problems and improving their skills every day.</p></div>
          <div className="card card-left"><h3>Practical Skill</h3><p>Prior experience with apps, web design, or product thinking is helpful, but we value persistence, logical thinking and a strong work ethic.</p></div>
          <div className="card card-left"><h3>Ownership</h3><p>Take responsibility for your tasks and contribute ideas that make the product more useful for real people.</p></div>
          <div className="card card-left"><h3>Communication</h3><p>Remote work requires clear, timely updates so the team can move faster together.</p></div>
        </div>
      </section>

      {/* INTERNSHIPS */}
      <section className="section">
        <h2 className="fade-up">Internships</h2>
        <div className="section-divider fade-up"></div>
        <div className="card fade-up" style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div className="badge" style={{ margin: 0 }}>🎓 Now Open</div>
            <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 600 }}>August – September 2026</span>
          </div>
          <h3 style={{ fontSize: '21px', marginBottom: '12px' }}>60-Day Remote Internship Bootcamp</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>We're excited to launch our 60-Day Remote Internship Bootcamp for Undergraduate Students and Recent Graduates. The program focuses on hands-on learning, mentorship, and real-world software development experience.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(15,23,42,.5)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ color: 'var(--green)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Duration</div>
              <div style={{ color: '#e2e8f0', fontSize: '14px' }}>60 Days</div>
            </div>
            <div style={{ background: 'rgba(15,23,42,.5)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ color: 'var(--green)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Start Date</div>
              <div style={{ color: '#e2e8f0', fontSize: '14px' }}>1 August 2026</div>
            </div>
            <div style={{ background: 'rgba(15,23,42,.5)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ color: 'var(--green)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Mode</div>
              <div style={{ color: '#e2e8f0', fontSize: '14px' }}>Remote (Work From Home)</div>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Who Can Apply</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>Undergraduate Students</span>
              <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>Recent Graduates / Freshers</span>
              <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>Passionate Learners</span>
            </div>
          </div>
          <div style={{ background: 'rgba(234,179,8,.06)', border: '1px solid rgba(234,179,8,.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', color: '#fbbf24', fontSize: '13.5px' }}>
            ⚠️ Limited Seats Available! Registration is on a first-come, first-served basis.
          </div>
          <a className="btn" href="https://forms.gle/YhAfaw1CzCF9mEZo9" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px', padding: '12px 28px' }}><i className="fas fa-paper-plane"></i> Register Now</a>
        </div>
      </section>

      {/* MOCK INTERVIEW */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">Mock Interview Program</h2>
        <div className="section-divider fade-up"></div>
        <div className="card fade-up" style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 28px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="card-icon" style={{ flexShrink: 0 }}><i className="fas fa-comments"></i></div>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Practice Before You Apply</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>Mian Usman Khalid (Founder & CEO) is personally conducting mock interviews to help aspiring developers, designers, and entrepreneurs prepare for real-world job interviews.</p>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Whether you're a student, fresh graduate, or career switcher — this is a free opportunity to get honest feedback, improve your interview skills, and learn what hiring managers actually look for.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>✅ Free of Cost</span>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>✅ Conducted by Founder</span>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>✅ Honest Feedback</span>
                <span style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: 'var(--green)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px' }}>✅ Open to All</span>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(148,163,184,.08)', border: '1px solid rgba(148,163,184,.2)', color: 'var(--muted)', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', cursor: 'not-allowed', opacity: .5, pointerEvents: 'none' }}><i className="fas fa-ban"></i> Currently Unavailable</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero" style={{ padding: '80px 24px' }}>
        <h2>Want to Work With Us?</h2>
        <p>We're not hiring right now, but you can still book a mock interview or get in touch.</p>
        <div className="hero-buttons">
          <span className="btn" style={{ opacity: .45, cursor: 'not-allowed', pointerEvents: 'none' }}><i className="fas fa-ban"></i> Currently Unavailable</span>
          <Link className="btn-outline" href="/contact"><i className="fas fa-envelope"></i> Contact Us</Link>
        </div>
      </section>
    </>
  );
}