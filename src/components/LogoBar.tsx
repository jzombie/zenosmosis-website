import type { MouseEvent } from 'react';
import logoUrl from '../assets/zenOSmosis-logo.svg';
import './LogoBar.css';

export function LogoBar() {
  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="logo-bar">
      <a href="/" onClick={handleLogoClick}>
        <img src={logoUrl} alt="zenOSmosis" className="logo" />
      </a>
    </header>
  );
}
