import Link from 'next/link';

export const metadata = {
  title: 'Blog - HisabDo | Mian Usman Khalid',
  description: 'Articles, guides and insights on digital accounting, entrepreneurship and software engineering by Mian Usman Khalid, Founder & CEO of HisabDo.',
};

export default function Blog() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="badge">✍ Insights &amp; Articles</div>
        <h1>HisabDo Blog</h1>
        <p>Guides, tips, press releases and business insights for entrepreneurs, freelancers and small businesses — by Mian Usman Khalid.</p>
      </section>

      {/* PILLAR ARTICLE */}
      <section className="section">
        <h2 className="fade-up">Start Here</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">New to HisabDo or small business finance? Start with our comprehensive guide.</p>
        <div className="fade-up" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="card card-left" style={{ borderColor: 'rgba(34,197,94,.35)' }}>
            <div className="blog-meta">📊 Pillar Guide &nbsp;•&nbsp; HisabDo</div>
            <h3 style={{ fontSize: '20px' }}>The Complete Small Business Financial Management Guide</h3>
            <p>Everything a small business owner needs to know — income tracking, expense management, receivables, payables, cash flow, bookkeeping and more. All in one place.</p>
            <br />
            <Link className="btn" href="/blog/small-business-financial-management">Read the Complete Guide</Link>
          </div>
        </div>
      </section>

      {/* RECENT ARTICLES */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">Recent Articles</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">Practical guides covering expense tracking, cash flow, khata management and small business finance.</p>

        <div className="grid fade-up" style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Cash Flow Management for Small Businesses</h3>
            <p>Why profitable businesses run out of cash — and the practical habits that keep your cash position healthy.</p>
            <br /><Link className="btn" href="/blog/cash-flow-management">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>How to Track Customer Dues and Receivables</h3>
            <p>A practical system to record every credit transaction and follow up on unpaid dues without losing track.</p>
            <br /><Link className="btn" href="/blog/track-customer-dues">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Business Expense Categories: The Complete Guide</h3>
            <p>How to classify every business expense correctly so your records are organized and your reports are meaningful.</p>
            <br /><Link className="btn" href="/blog/business-expense-categories">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>How to Manage Supplier Payments and Payables</h3>
            <p>Track what you owe, pay on time and maintain strong supplier relationships with a simple payables system.</p>
            <br /><Link className="btn" href="/blog/supplier-payments-payables">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Expense Tracking for Small Business</h3>
            <p>Use simple routines to capture spending, reduce waste and improve visibility across the month.</p>
            <br /><Link className="btn" href="/blog/expense-tracking-for-small-business">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Digital Ledger vs Paper Ledger</h3>
            <p>Compare traditional bookkeeping with digital systems and see why many businesses are switching.</p>
            <br /><Link className="btn" href="/blog/digital-ledger-vs-paper-ledger">Read Article</Link>
          </div>
        </div>
      </section>

      {/* ALL ARTICLES */}
      <section className="section">
        <h2 className="fade-up">All Articles</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">More helpful reading for business owners, freelancers and first-time users.</p>
        <div className="grid fade-up" style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>How to Manage Daily Khata</h3>
            <p>Learn the habits and routines that keep your daily ledger accurate and easy to review.</p>
            <br /><Link className="btn" href="/blog/how-to-manage-daily-khata">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Best Khata App in Pakistan</h3>
            <p>See what matters most when choosing a local ledger app for your shop, business or household needs.</p>
            <br /><Link className="btn" href="/blog/best-khata-app-in-pakistan">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Bookkeeping Basics</h3>
            <p>Learn the core principles that make financial records more accurate and easier to maintain.</p>
            <br /><Link className="btn" href="/blog/bookkeeping-basics">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Freelancer Expense Tracking</h3>
            <p>Learn how to track invoices, reimbursements, subscriptions and business costs without confusion.</p>
            <br /><Link className="btn" href="/blog/freelancer-expense-tracking">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Business Finance Tips</h3>
            <p>Simple ways to improve decision-making, cash flow awareness and recordkeeping discipline.</p>
            <br /><Link className="btn" href="/blog/business-finance-tips">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Customer Credit Management</h3>
            <p>Use better habits and tools to track balances and reduce missed collections from regular customers.</p>
            <br /><Link className="btn" href="/blog/customer-credit-management">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>PDF Reports for Businesses</h3>
            <p>Understand how professional reports support trust, clarity and easier day-to-day administration.</p>
            <br /><Link className="btn" href="/blog/pdf-reports-for-businesses">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Shopkeeper Accounting Guide</h3>
            <p>Build a practical accounting routine that fits the fast pace of retail and daily customer transactions.</p>
            <br /><Link className="btn" href="/blog/shopkeeper-accounting-guide">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Receivable &amp; Payable Explained</h3>
            <p>Learn the difference between what is owed to you and what you owe to others, and how to manage both.</p>
            <br /><Link className="btn" href="/blog/receivable-payable-explained">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Complete Guide to HisabDo</h3>
            <p>See how HisabDo supports khata management, expense records, backups and reporting in one app.</p>
            <br /><Link className="btn" href="/blog/complete-guide-to-hisabdo">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Personal Budget Planning</h3>
            <p>Build a realistic budget that covers essentials, goals and unexpected costs without stress.</p>
            <br /><Link className="btn" href="/blog/personal-budget-planning">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Money Management Tips</h3>
            <p>Use practical habits to improve spending discipline, savings and long-term planning.</p>
            <br /><Link className="btn" href="/blog/money-management-tips">Read Article</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Guide • HisabDo</div>
            <h3>Why Offline Finance Apps Are Better</h3>
            <p>See why offline tools remain powerful in low-connectivity environments and for private financial records.</p>
            <br /><Link className="btn" href="/blog/why-offline-finance-apps-are-better">Read Article</Link>
          </div>
        </div>
      </section>

      {/* MORE RESOURCES */}
      <section className="section" style={{ background: 'rgba(34,197,94,.025)' }}>
        <h2 className="fade-up">More Resources</h2>
        <div className="section-divider fade-up"></div>
        <div className="grid fade-up" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="card card-left">
            <div className="blog-meta">Resource</div>
            <h3>How Small Businesses Can Manage Khata Digitally</h3>
            <p>A practical introduction to moving everyday khata records from paper into a structured digital workflow.</p>
            <Link className="btn-outline" href="/blog-small-business-khata">Read Resource</Link>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Founder Story</div>
            <h3>Why I Built HisabDo</h3>
            <p>Read the founder story behind HisabDo and the product decisions that shaped its offline-first approach.</p>
            <Link className="btn-outline" href="/why-i-built-hisabdo">Read Story</Link>
          </div>
        </div>
      </section>

      {/* EXTERNAL PUBLICATIONS */}
      <section className="section" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,.04) 0%, transparent 70%)' }}>
        <h2 className="fade-up">External Publications</h2>
        <div className="section-divider fade-up"></div>
        <p className="section-sub fade-up">HisabDo as featured in external publications and platforms.</p>
        <div className="grid fade-up" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="card card-left">
            <div className="blog-meta">Product Launch &nbsp;•&nbsp; StartupBase</div>
            <div className="card-icon"><i className="fas fa-rocket"></i></div>
            <h3>HisabDo on StartupBase</h3>
            <p>HisabDo is officially listed and featured on StartupBase — a platform for discovering and launching new products.</p>
            <br /><a className="btn" href="https://startupbase.io/products/hisabdo" target="_blank" rel="noopener noreferrer"><i className="fas fa-external-link-alt"></i> View on StartupBase</a>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Press Release &nbsp;•&nbsp; FreePressRelease</div>
            <div className="card-icon"><i className="fas fa-newspaper"></i></div>
            <h3>HisabDo Introduces a Smarter Digital Accounting Solution</h3>
            <p>How HisabDo is helping small businesses manage finances efficiently with an offline-first digital ledger system.</p>
            <br /><a className="btn" href="https://freepressrelease.io/press/hisabdo-introduces-a-smarter-digital-accounting-solution-to-help-small-businesses-manage-finances-efficiently" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Read Article</a>
          </div>
          <div className="card card-left">
            <div className="blog-meta">Article &nbsp;•&nbsp; Medium</div>
            <div className="card-icon"><i className="fab fa-medium"></i></div>
            <h3>How HisabDo is Helping Pakistani Small Businesses Embrace Digital Accounting</h3>
            <p>A deep dive into how HisabDo is transforming the way small businesses in Pakistan manage their finances.</p>
            <br /><a className="btn" href="https://medium.com/@usmankhalid17248/how-hisabdo-is-helping-pakistani-small-businesses-embrace-digital-accounting-431699297311" target="_blank" rel="noopener noreferrer"><i className="fas fa-external-link-alt"></i> Read on Medium</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero" style={{ padding: '80px 24px' }}>
        <div className="badge">🚀 Stay Updated</div>
        <h2>Want to Follow More Updates?</h2>
        <p>Follow Mian Usman Khalid on social media for the latest articles, insights and HisabDo news.</p>
        <div className="hero-buttons">
          <Link className="btn" href="/mian-usman-khalid">View Founder Profile</Link>
          <Link className="btn-outline" href="/contact">Get in Touch</Link>
        </div>
      </section>
    </>
  );
}