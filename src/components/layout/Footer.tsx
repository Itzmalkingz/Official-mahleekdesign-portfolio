import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Mahleek Design</span>
          <p>Independent brand identity, campaign design, and digital work from Lagos.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Navigation</h4>
            <Link href="/">Home</Link>
            <Link href="/web-projects">Web Projects</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <a href="https://wa.me/2349116537383" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="mailto:mahleekdesign@gmail.com">Email</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub (add your profile link)">
              GitHub
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Mahleek Design. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
