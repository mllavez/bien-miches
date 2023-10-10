import {
  json,
  redirect,
  type ActionArgs,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  Link,
  useActionData,
  type V2_MetaFunction,
} from '@remix-run/react';
import type {CustomerCreateMutation} from 'storefrontapi.generated';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';
import {Button, buttonVariants} from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {Input} from '@/components/ui/input';

type ActionResponse = {
  error: string | null;
  newCustomer:
    | NonNullable<CustomerCreateMutation['customerCreate']>['customer']
    | null;
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Login'}];
};

export async function loader({context}: LoaderArgs) {
  if (await context.session.get('customerAccessToken')) {
    return redirect('/account');
  }
  return json({});
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const LOGIN_MUTATION = `#graphql
  mutation login($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerCreate
const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate(
    $input: CustomerCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const REGISTER_LOGIN_MUTATION = `#graphql
  mutation registerLogin(
    $input: CustomerAccessTokenCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
` as const;

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const {session, storefront} = context;
    const form = await request.formData();
    const {_action, ...values} = Object.fromEntries(form);

    if (_action === 'sign-in') {
      const email = String(form.has('email') ? form.get('email') : '');
      const password = String(form.has('password') ? form.get('password') : '');
      const validInputs = Boolean(email && password);

      if (!validInputs) {
        throw new Error('Please provide both an email and a password.');
      }

      const {customerAccessTokenCreate} = await storefront.mutate(
        LOGIN_MUTATION,
        {
          variables: {
            input: {email, password},
          },
        },
      );

      if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
        throw new Error(
          customerAccessTokenCreate?.customerUserErrors[0].message,
        );
      }

      const {customerAccessToken} = customerAccessTokenCreate;
      session.set('customerAccessToken', customerAccessToken);

      return redirect('/account', {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    }
    if (_action === 'register') {
      const email = String(form.has('email') ? form.get('email') : '');
      const password = form.has('password')
        ? String(form.get('password'))
        : null;
      const passwordConfirm = form.has('passwordConfirm')
        ? String(form.get('passwordConfirm'))
        : null;

      const validPasswords =
        password && passwordConfirm && password === passwordConfirm;

      const validInputs = Boolean(email && password);

      if (!validPasswords) {
        throw new Error('Passwords do not match');
      }

      if (!validInputs) {
        throw new Error('Please provide both an email and a password.');
      }

      const {customerCreate} = await storefront.mutate(
        CUSTOMER_CREATE_MUTATION,
        {
          variables: {
            input: {email, password},
          },
        },
      );

      if (customerCreate?.customerUserErrors?.length) {
        throw new Error(customerCreate?.customerUserErrors[0].message);
      }

      const newCustomer = customerCreate?.customer;
      if (!newCustomer?.id) {
        throw new Error('Could not create customer');
      }

      // get an access token for the new customer
      const {customerAccessTokenCreate} = await storefront.mutate(
        REGISTER_LOGIN_MUTATION,
        {
          variables: {
            input: {
              email,
              password,
            },
          },
        },
      );

      if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
        throw new Error('Missing access token');
      }
      session.set(
        'customerAccessToken',
        customerAccessTokenCreate?.customerAccessToken,
      );

      return json(
        {error: null, newCustomer},
        {
          status: 302,
          headers: {
            'Set-Cookie': await session.commit(),
            Location: '/account',
          },
        },
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
};

export default function Login() {
  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <MaxWidthWrapper className="pt-5 pd-7">
      <div className="login w-full">
        <h1 className="text-xl pb-1 text-stone-300">
          Ximopanōltih, Bienvenidos, Welcome
        </h1>
        <Accordion
          type="single"
          collapsible
          className="accordion-signin-signup-page pt-1.5 pb-4"
        >
          <AccordionItem
            value="sign-in"
            className="accordion-row-signin border-neutral-700 solid border-2 rounded-tl rounded-tr"
          >
            <AccordionTrigger className="accordion-row-header flex pl-14 py-3.5 pr-4 w-full">
              {/* <Input
                className="absolute left-7 h-7 w-7 -mt-1"
                id="signedIn"
                type="radio"
                name="status"
                checked
              /> */}
              <span className="text-base">Sign in.&nbsp;</span>
              <span className="text-sm pr-2">Already a customer?</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-3.5">
              <Form method="POST">
                <fieldset className="flex-col gap-3.5">
                  <Input
                    className="h-12 text-stone-300 rounded"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    aria-label="Email address"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                  <Input
                    className="h-12 text-stone-300 rounded"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    aria-label="Password"
                    minLength={8}
                    required
                  />
                </fieldset>
                {error ? (
                  <p>
                    <mark>
                      <small>{error}</small>
                    </mark>
                  </p>
                ) : (
                  <br />
                )}
                <Button
                  type="submit"
                  aria-label="Sign in"
                  name="_action"
                  value="sign-in"
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'default',
                    className: 'w-full rounded-lg',
                  })}
                >
                  Sign in
                </Button>
              </Form>
              <div>
                <p>
                  <Link
                    to="/account/recover"
                    className={buttonVariants({
                      size: 'lg',
                      variant: 'link',
                      className: 'm-0 p-0 leading-none -mb-2',
                    })}
                  >
                    Forgot password →
                  </Link>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="register"
            className="accordion-row-register border-neutral-700 solid border-b-2 border-l-2 border-r-2 rounded-bl rounded-br"
          >
            <AccordionTrigger className="accordion-row-header flex pl-14 py-3.5 pr-4 w-full">
              {/* <Input
                className="absolute left-7 h-7 w-7 -mt-1"
                id="register"
                type="radio"
                name="status"
              /> */}
              <span className="text-base">Create account.&nbsp;</span>
              <span className="text-sm pr-2">New to Bien Miches?</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3.5">
              <Form method="POST">
                <fieldset className="flex-col gap-3.5">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email"
                    aria-label="Email"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    aria-label="Password"
                    minLength={8}
                    required
                  />
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Re-enter password"
                    aria-label="Re-enter password"
                    minLength={8}
                    required
                  />
                </fieldset>
                {error ? (
                  <p>
                    <mark>
                      <small>{error}</small>
                    </mark>
                  </p>
                ) : (
                  <br />
                )}
                <Button
                  type="submit"
                  aria-label="Register"
                  name="_action"
                  value="register"
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'default',
                    className: 'w-full rounded-lg',
                  })}
                >
                  Register
                </Button>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </MaxWidthWrapper>
  );
}
