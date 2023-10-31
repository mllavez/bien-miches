import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {json, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import type {CustomerFragment} from 'storefrontapi.generated';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

export function shouldRevalidate() {
  return true;
}

export async function loader({request, context}: LoaderArgs) {
  const {session, storefront} = context;
  const {pathname} = new URL(request.url);
  const customerAccessToken = await session.get('customerAccessToken');
  const isLoggedIn = Boolean(customerAccessToken?.accessToken);
  const isAccountHome = pathname === '/account' || pathname === '/account/';
  const isPrivateRoute =
    /^\/account\/(orders|orders\/.*|profile|addresses|addresses\/.*)$/.test(
      pathname,
    );

  if (!isLoggedIn) {
    if (isPrivateRoute || isAccountHome) {
      session.unset('customerAccessToken');
      return redirect('/account/login', {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    } else {
      // public subroute such as /account/login...
      return json({
        isLoggedIn: false,
        isAccountHome,
        isPrivateRoute,
        customer: null,
      });
    }
  } else {
    // loggedIn, default redirect to the orders page
    if (isAccountHome) {
      return redirect('/account/orders');
    }
  }

  try {
    const {customer} = await storefront.query(CUSTOMER_QUERY, {
      variables: {
        customerAccessToken: customerAccessToken.accessToken,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheNone(),
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return json(
      {isLoggedIn, isPrivateRoute, isAccountHome, customer},
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('There was a problem loading account', error);
    session.unset('customerAccessToken');
    return redirect('/account/login', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  }
}

export default function Acccount() {
  const {customer, isPrivateRoute, isAccountHome} =
    useLoaderData<typeof loader>();

  if (!isPrivateRoute && !isAccountHome) {
    return <Outlet context={{customer}} />;
  }

  return (
    <AccountLayout customer={customer as CustomerFragment}>
      <br />
      <Outlet context={{customer}} />
    </AccountLayout>
  );
}

function AccountLayout({
  customer,
  children,
}: {
  customer: CustomerFragment;
  children: React.ReactNode;
}) {
  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account w-full py-4">
      <MaxWidthWrapper>
        <h1>{heading}</h1>
      </MaxWidthWrapper>
      <br />
      <AccountMenu />
      <MaxWidthWrapper className="pt-4">{children}</MaxWidthWrapper>
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    let navLinkStyle = new Object({
      textDecoration: 'none',
      lineHeight: '1',
      width: 'auto',
      textAlign: 'center',
    });
    if (isActive) {
      return {
        color: '#bd002f',
        borderBottom: '1px solid #bd002f',
        paddingBottom: '.75rem',
        ...navLinkStyle,
      };
    }
    return navLinkStyle;
  }

  return (
    <nav role="navigation" className="border-t-[1px] border-zinc-700 pt-2.5">
      <MaxWidthWrapper className="flex justify-between">
        <NavLink to="/account/orders" style={isActiveStyle}>
          Orders
        </NavLink>
        |
        <NavLink to="/account/profile" style={isActiveStyle}>
          Profile
        </NavLink>
        |
        <NavLink to="/account/addresses" style={isActiveStyle}>
          Addresses
        </NavLink>
        |
        <Logout />
      </MaxWidthWrapper>
    </nav>
  );
}

function Logout() {
  return (
    <Form
      className="account-logout leading-none w-auto text-center"
      method="POST"
      action="/account/logout"
    >
      <button type="submit">Sign out</button>
    </Form>
  );
}

export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    acceptsMarketing
    addresses(first: 6) {
      nodes {
        ...Address
      }
    }
    defaultAddress {
      ...Address
    }
    email
    firstName
    lastName
    numberOfOrders
    phone
  }
  fragment Address on MailingAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    country
    province
    city
    zip
    phone
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/customer
const CUSTOMER_QUERY = `#graphql
  query Customer(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
` as const;
