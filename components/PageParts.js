import Link from 'next/link';

export function Hero({ eyebrow, title, children }) { return <section className="hero"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="hero-copy">{children}</div></section>; }
export function Section({ eyebrow, title, tone = '', children }) { return <section className={`section ${tone}`}><div className="section-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{children}</section>; }
export function Button({ href, outline = false, children }) { return <Link className={outline ? 'button button-outline' : 'button'} href={href}>{children}</Link>; }
export function Cards({ items }) { return <div className="card-grid">{items.map((item, index) => <article className="info-card" key={item.title}><span className="card-index">{item.index || `0${index + 1}`}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>; }
