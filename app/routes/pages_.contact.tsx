import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type V2_MetaFunction} from '@remix-run/react';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

export const meta: V2_MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data.page.title}`}];
};
export async function loader({params, context}: LoaderArgs) {
  // if (!params.handle) {
  //   console.log('params', params);
  //   throw new Error('Missing page handle');
  // }

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: 'contact',
    },
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return json({page});
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="page mt-7 mb-6">
      <header>
        <MaxWidthWrapper>
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        </MaxWidthWrapper>
      </header>
      <main>
        <MaxWidthWrapper>
          <div className="flex flex-col md:flex-row">
            <div className="w-full">
              <p>
                If you have any comments, questions, or concerns, please feel
                free to send them our way.
              </p>
              <p> We will get back to you as soon as possible.</p>
              <div className="text-lg mt-4">
                <div className="mb-2">
                  <span className="font-bold">Email:</span>{' '}
                  <a href="mailto:help@bienmiches.com" target="_blank">
                    help@bienmiches.com
                  </a>
                </div>
                <div className="mb-2">
                  <span className="font-bold">Phone:</span>{' '}
                  <a href="tel:831-222-0622" target="_blank">
                    (831) 222-0622
                  </a>
                </div>
                <div className="mb-2">
                  <span className="font-bold">Address:</span>{' '}
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Get%20Faded%20Barbershop,%201007%20Cedar%20St,%20Santa%20Cruz,%20CA%2095060"
                    target="_blank"
                  >
                    907 Cedar St, Santa Cruz, CA 95060
                  </a>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </main>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
