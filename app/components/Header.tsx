import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

const LUMIERE_NAV = [
  {title: 'HOME', url: '#hero'},
  {title: 'FEATURE', url: '#feature'},
  {title: 'INGREDIENTS', url: '#ingredients'},
  {title: 'VOICE', url: '#voice'},
  {title: 'PRICE', url: '#price'},
] as const;

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const [isStuck, setIsStuck] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`lum-header${isStuck ? ' is-stuck' : ''}`}>
      <div className="container lum-header-inner">
        {/* Logo */}
        <NavLink prefetch="intent" to="/" className="lum-logo">
          <span className="lum-logo-main">Lumi&egrave;re</span>
          <span className="lum-logo-sub">BEAUTY PROTEIN</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="lum-site-nav" aria-label="メインナビゲーション">
          <ul>
            {LUMIERE_NAV.map((item) => (
              <li key={item.title}>
                <a href={item.url}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Icon buttons */}
        <div className="lum-header-icons">
          <SearchToggle />
          <AccountLink isLoggedIn={isLoggedIn} />
          <CartToggle cart={cart} />
          {/* Mobile hamburger */}
          <button
            className="lum-nav-toggle"
            aria-label="メニュー"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <nav
          className="lum-site-nav is-open"
          id="mobileNav"
          aria-label="モバイルナビゲーション"
        >
          <ul>
            {LUMIERE_NAV.map((item) => (
              <li key={item.title}>
                <a href={item.url} onClick={() => setMobileNavOpen(false)}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="lum-icon-btn"
      aria-label="検索"
      onClick={() => open('search')}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="11"
          cy="11"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M20 20l-3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function AccountLink({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  return (
    <NavLink prefetch="intent" to="/account" className="lum-icon-btn" aria-label="アカウント">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="9"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </NavLink>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="lum-icon-btn lum-cart-btn"
      aria-label={`カート（${count}点）`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4h2.2l2 12h12l2-9H7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="lum-cart-badge" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

// Keep exported for backward-compat with PageLayout mobile aside
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const className = `header-menu-${viewport}`;
  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" to="/">
          Home
        </NavLink>
      )}
      {LUMIERE_NAV.map((item) => (
        <a
          key={item.title}
          className="header-menu-item"
          href={item.url}
          onClick={close}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
