import {Await, Link, useLocation} from '@remix-run/react';
import {Suspense} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/Cart';
import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';
import MaxWidthWrapper from './MaxWidthWrapper';
import {MapPin, ChevronDown} from 'lucide-react';
import {Logo} from '~/components/Logo';

export type LayoutProps = {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  footer: Promise<FooterQuery>;
  header: HeaderQuery;
  isLoggedIn: boolean;
};

const PLAIN_HEADER_PATHS = ['/account/login', '/account/activate'];
export function Layout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
}: LayoutProps) {
  const location = useLocation();
  console.log(location.pathname);
  if (PLAIN_HEADER_PATHS.some((path) => location.pathname.startsWith(path))) {
    return (
      <>
        <div className="h-[48px] flex items-center bg-black">
          <MaxWidthWrapper>
            <Logo />
          </MaxWidthWrapper>
        </div>
        <main className="py-2.5">{children}</main>
        <Suspense>
          <Await resolve={footer}>
            {(footer) => <Footer menu={footer.menu} />}
          </Await>
        </Suspense>
      </>
    );
  }
  return (
    <>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside menu={header.menu} />
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
      <MaxWidthWrapper className="bg-primary md:hidden">
        <Link
          to="https://www.google.com/maps/dir/?api=1&destination=Get%20Faded%20Barbershop,%201007%20Cedar%20St,%20Santa%20Cruz,%20CA%2095060"
          className="flex px-4 py-3 w-full"
        >
          <MapPin className="flex mr-5" />
          Pick up at Get Faded Barbershop <ChevronDown className="w-5" />
        </Link>
      </MaxWidthWrapper>
      <div className="bg-neutral-800">
        <MaxWidthWrapper className="hidden h-10 md:flex items-center">
          <HeaderMenu menu={header.menu} viewport="desktop" />
        </MaxWidthWrapper>
      </div>
      <main className="">{children}</main>
      <Suspense>
        <Await resolve={footer}>
          {(footer) => (
            <Footer menu={footer.menu} className="md:bg-transparent" />
          )}
        </Await>
      </Suspense>
    </>
  );
}

function CartAside({cart}: {cart: LayoutProps['cart']}) {
  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <PredictiveSearchForm>
          {({fetchResults, inputRef}) => (
            <div>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button type="submit">Search</button>
            </div>
          )}
        </PredictiveSearchForm>
        <PredictiveSearchResults />
      </div>
    </Aside>
  );
}

function MobileMenuAside({menu}: {menu: HeaderQuery['menu']}) {
  return (
    <Aside id="mobile-menu-aside" heading="MENU">
      <HeaderMenu menu={menu} viewport="mobile" />
    </Aside>
  );
}
