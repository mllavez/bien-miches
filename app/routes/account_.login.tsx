import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  Link,
  useActionData,
  type V2_MetaFunction,
} from '@remix-run/react';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';
import {Button} from '@/components/ui/button';

type ActionResponse = {
  error: string | null;
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

export async function action({request, context}: ActionArgs) {
  const {session, storefront} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const form = await request.formData();
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
      throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Login() {
  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <MaxWidthWrapper>
      <div className="login w-full">
        <h1>Ximopanōltih, Bienvenidos, Welcome</h1>
        <div id="accordion-signin-signup-page">
          <div id="accordion-row-signin">
            <div className="accordion-row-header py-5 pr-7 pl-20 block">
              <input
                className="absolute left-7 h-9 w-9 -mt-1"
                id="signedIn"
                type="radio"
                name="status"
                checked
              />
              <h5 className="font-bold m-auto">
                <span className="text-xl">Sign In.</span>{' '}
                <span className="text-base">Already a customer?</span>
              </h5>
            </div>
            <Form method="POST">
              <fieldset>
                <label htmlFor="email">Email</label>
                <input
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
                <label htmlFor="password">Password</label>
                <input
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
              <Button type="submit">Sign in</Button>
            </Form>
          </div>
        </div>
        <br />
        <div>
          <p>
            <Link to="/account/recover">Forgot password →</Link>
          </p>
          <p>
            <Link to="/account/register">Register →</Link>
          </p>
        </div>
      </div>
    </MaxWidthWrapper>
  );
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
