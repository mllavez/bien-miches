import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {
  Await,
  useLoaderData,
  Link,
  type V2_MetaFunction,
} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

import bienMichesMobileBgVideo from '../../public/bien-miches-michelada-mix-santa-cruz-intro-v1-mobile.mp4';
import bienMichesDesktopBgVideo from '../../public/bien-miches-michelada-mix-santa-cruz-intro-v1-desktop.mp4';
import bienMichesBlackFullTriColorLogo from '../../public/bien-miches-michelada-mix-santa-cruz_black-full-tri-color-logo.png';
import {Button, buttonVariants} from '@/components/ui/button';

export const meta: V2_MetaFunction = () => {
  return [{title: 'Bien Miches Micheladas, Santa Cruz CA | Home'}];
};

export async function loader({context}: LoaderArgs) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({featuredCollection, recommendedProducts});
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <PreFeaturedCollection products={data.recommendedProducts} />
      <UserSignUpSignIn />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function PreFeaturedCollection({
  products,
}: {
  products: Promise<RecommendedProductsQuery>;
}) {
  return (
    <>
      <div className="h-[75vw]">
        {/* <img
          src={bienMichesBlackFullTriColorLogo}
          className="absolute right-0 top-28 aspect-[540/553] max-w-[140px] w-full h-fit object-contain opacity-70"
        /> */}
      </div>
      <section className="overflow-x-scroll overflow-y-hidden">
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {({products}) => (
              <div className="w-max my-1.5 ml-2 relative h-52 flex space-x-4">
                {products.nodes.map((product) => (
                  <Link
                    key={product.id}
                    className="w-[136px] h-52 bg-neutral-950 rounded float-left"
                    to={`/products/${product.handle}`}
                  >
                    <div className="h-11 p-1.5">
                      <h5 className="text-sm">{product.title}</h5>
                    </div>
                    <Image
                      data={product.images.nodes[0]}
                      aspectRatio="102/125"
                      sizes="(max-width: 7.875em) 20vw, 50vw"
                      className="w-full h-full object-cover -top-1.5"
                    />
                  </Link>
                ))}
              </div>
            )}
          </Await>
        </Suspense>
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
          src={bienMichesMobileBgVideo}
          autoPlay
          loop
          muted
        />
      </section>
    </>
  );
}

function UserSignUpSignIn() {
  return (
    <>
      <div className="flex flex-col justify-center items-left gap-4 bg-white p-4">
        <h4 className="text-neutral-900 text-lg font-bold">
          Sign in for the best experience
        </h4>
        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'text-white text-[16px] bg-rose-700 rounded-lg shadow',
          })}
          to="/account/login"
        >
          Sign In
        </Link>
        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'bg-green-800 text-[16px] text-white rounded-lg shadow',
          })}
          to="/account/login"
        >
          Vendor Sign In
        </Link>
        <Link className="text-black text-sm" to="account/login">
          Create an account
        </Link>
      </div>
    </>
  );
}

function AfterHeroSection() {
  return (
    <>
      <section className="flex pt-12 pb-9 bg-black/20 flex-col justify-center items-center gap-5">
        <img src="https://cdn.shopify.com/s/files/1/0814/6478/7227/files/Screenshot_2023-08-23_at_1.02_1.png?v=1695306779" />
        <div className="flex-section flex-col justify-st art items-center gap-4 ">
          <div className="self-stretch text-white text-3xl font-normal font-['Denk One']">
            Pour. Mix. Enjoy. Simple.
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-5 max-w-sm">
          <Link
            to="/products/bien-miches-michelada-mix"
            className="self-stretch px-10 py-3 bg-orange-400 rounded-lg border-2 border-neutral-700 justify-center items-center gap-2.5 inline-flex"
          >
            <div className="text-neutral-700 text-xl font-normal font-['Denk One']">
              Place an order
            </div>
          </Link>
          <Link
            to="https://www.google.com/maps/dir/?api=1&destination=Get%20Faded%20Barbershop,%201007%20Cedar%20St,%20Santa%20Cruz,%20CA%2095060"
            className="self-strech px-10 py-3 bg-red-700 rounded-lg border-2 border-neutral-700 justify-center items-center gap-2.5 inline-flex"
          >
            <div className="text-white text-xl font-normal font-['Denk One']">
              DIRECTIONS
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  const image = collection.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery>;
}) {
  return (
    <section className="recommended-products flex flex-col items-center bg-amber-700 py-6 gap-4">
      <h2 className="w-72 text-center text-white text-3xl font-normal font-['Denk One']">
        Latest
      </h2>
      <h3 className="w-72 text-center text-white text-xl font-normal font-['Denk One']">
        Stay Party-Ready with Our Freshest Michelada Gear.
      </h3>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {({products}) => (
            <div className="recommended-products-grid">
              {products.nodes.map((product) => (
                <Link
                  key={product.id}
                  className="recommended-product"
                  to={`/products/${product.handle}`}
                >
                  <Image
                    data={product.images.nodes[0]}
                    aspectRatio="102/125"
                    sizes="(max-height: 24em) 20vw, 50vw"
                  />
                  <h4>{product.title}</h4>
                  <small>
                    <Money data={product.priceRange.minVariantPrice} />
                  </small>
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
