import logoUrl from '../assets/zenOSmosis-logo.svg';
import './LogoBar.css';

export function LogoBar() {
  return (
    <header className="logo-bar">
      <img src={logoUrl} alt="zenOSmosis" className="logo" />
    </header>
  );
}
