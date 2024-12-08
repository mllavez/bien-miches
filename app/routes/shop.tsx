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
import MaxWidthWrapper from '~/components/MaxWidthWrapper';
import {cn} from '@/lib/utils';

export const meta: V2_MetaFunction = () => {
  return [{title: 'Bien Miches Micheladas, Santa Cruz CA | Shop'}];
};

export async function loader({context}: LoaderArgs) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({featuredCollection, recommendedProducts});
}

export default function ShopPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <PreFeaturedCollection />
      <div className="md:hidden">
        <HeroIntro />
      </div>
      <div className="md:hidden">
        <UserSignUpSignIn />
      </div>
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

// Rest of the code remains the same as _index.tsx (all the component functions)