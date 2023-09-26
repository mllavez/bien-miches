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

export const meta: V2_MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
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
      <PreFeaturedCollection />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function PreFeaturedCollection({}: {}) {
  return (
    <>
      <section className="flex pt-12 pb-9 bg-black flex-col justify-center items-center gap-5">
        <img src="https://cdn.shopify.com/s/files/1/0814/6478/7227/files/Screenshot_2023-08-23_at_1.02_1.png?v=1695306779" />
        <div className="flex-section flex-col justify-start items-center gap-4 ">
          <div className="self-stretch text-white text-3xl font-normal font-['Denk One']">
            Pour. Mix. Enjoy. <br />
            Simple.
          </div>
          <div className="self-stretch text-white text-xl font-normal font-['Denk One']">
            No Prep; Authentic Flavor
          </div>
          <div className="self-stretch text-white text-xl font-normal font-['Denk One']">
            Recipe from Juan Cosalá, México; to you.
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-5 max-w-sm">
          <Link
            to="/products/bien-miches-michelada-mix"
            className="self-stretch px-10 py-3 bg-orange-400 rounded-lg border-2 border-neutral-700 justify-center items-center gap-2.5 inline-flex"
          >
            <div className="text-neutral-700 text-xl font-normal font-['Denk One']">
              SHOP ONLINE
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
                    sizes="(min-width: 45em) 20vw, 50vw"
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
