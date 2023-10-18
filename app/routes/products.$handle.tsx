import {Suspense, useEffect, useState} from 'react';
import {defer, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {
  Await,
  Link,
  useLoaderData,
  type V2_MetaFunction,
  type FetcherWithComponents,
} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantsQuery,
  ProductVariantFragment,
} from 'storefrontapi.generated';

import {
  Image,
  Money,
  VariantSelector,
  type VariantOption,
  getSelectedProductOptions,
  CartForm,
} from '@shopify/hydrogen';
import type {
  CartLineInput,
  SelectedOption,
} from '@shopify/hydrogen/storefront-api-types';
import {getVariantUrl} from '~/utils';
import {
  JudgemeMedals,
  JudgemeCarousel,
  JudgemeReviewsTab,
  JudgemePreviewBadge,
  JudgemeReviewWidget,
  JudgemeVerifiedBadge,
  JudgemeAllReviewsCount,
  JudgemeAllReviewsRating,
} from '@judgeme/shopify-hydrogen';
import {cn} from '@/lib/utils';
import {Button, buttonVariants} from '@/components/ui/button';
import * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';
import Slider from 'react-slick';

export const meta: V2_MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data.product.title}`}];
};

export async function loader({params, request, context}: LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option: SelectedOption) =>
        option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      return redirectToFirstVariant({product, request});
    }
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  return defer({product, variants});
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductFragment;
  request: Request;
}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  throw redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const {product, variants} = useLoaderData<typeof loader>();
  const {selectedVariant, images} = product;
  const [windowSize, setWindowSize] = useState([0, 0]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div className="product pt-3 pb-7 px-3.5 md:flex">
      <ProductTite className="md:hidden" product={product} />
      <ProductImage
        image={selectedVariant?.image}
        images={images}
        windowSize={windowSize[0]}
      />
      <div className="md:w-[52%]">
        <ProductMain
          selectedVariant={selectedVariant}
          product={product}
          variants={variants}
          windowSize={windowSize[0]}
        />
        <div className="hidden md:block w-[244px] -mr-[244px] float-left">
          <div className="rounded-lg py-3 px-4">
            <AddToCartButton
              disabled={!selectedVariant || !selectedVariant.availableForSale}
              onClick={() => {
                window.location.href = window.location.href + '#cart-aside';
              }}
              lines={
                selectedVariant
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: 1,
                      },
                    ]
                  : []
              }
            >
              {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImage({
  image,
  images,
  windowSize,
}: {
  image: ProductVariantFragment['image'];
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  windowSize?: number;
}) {
  let sliderSettings = new Object();
  if (typeof windowSize === 'undefined' || windowSize >= 768) {
    sliderSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      className: '',
      // appendDots: (dots: any) => (
      //   <div style={{position: 'absolute', left: '0'}}>
      //     <ul style={{margin: '0px'}}> {dots} </ul>
      //   </div>
      // ),
      appendDots: (dots: any) => {
        return (
          <div className="absolute left-0">
            <ul className="md:flex md:flex-col md:mt-8"> {dots} </ul>
          </div>
        );
      },
      customPaging: (i: any) => {
        return (
          <a className="block border border-primary rounded-lg">
            <img className="rounded-lg" src={`${images.nodes[i].url}`} />
          </a>
        );
      },
    };
  } else {
    sliderSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
    };
  }

  if (!image) {
    return <div className="product-image" />;
  }
  // if (images.nodes.length > 1) {
  return (
    <div className="block md:w-[45%] md:mr-[2%] md:top-14 md:sticky md:float-left ">
      <Slider {...sliderSettings}>
        {images.nodes.map((image) => (
          <Image
            alt={image.altText || 'Product Image'}
            aspectRatio="4/5"
            data={image}
            crop="center"
            key={image.id}
            parent-fit="cover"
            srcSetOptions={{
              intervals: 3,
              startingWidth: 288,
              incrementSize: 128,
              placeholderWidth: 288,
            }}
            height="100%"
            className=""
          />
        ))}
      </Slider>
    </div>
  );
  // }
  // return (
  //   <div className="flex items-center justify-center mb-1">
  //     <div className="product-image h-72 max-w-fit flex items-center justify-center">
  //       <Image
  //         alt={image.altText || 'Product Image'}
  //         aspectRatio="4/5"
  //         data={image}
  //         crop="center"
  //         key={image.id}
  //         parent-fit="cover"
  //         srcSetOptions={{
  //           intervals: 3,
  //           startingWidth: 288,
  //           incrementSize: 128,
  //           placeholderWidth: 288,
  //         }}
  //         height="100%"
  //         className=""
  //       />
  //     </div>
  //   </div>
  // );
}

function ProductTite({
  product,
  className,
}: {
  product: ProductFragment;
  className?: string;
}) {
  return (
    <div className={cn(className, 'product-title')}>
      <h1 className="text-sm mb-1 md:text-2xl md:font-bold">{product.title}</h1>
    </div>
  );
}

function ProductMain({
  selectedVariant,
  product,
  variants,
  windowSize,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Promise<ProductVariantsQuery>;
  windowSize?: number;
}) {
  const {title, descriptionHtml} = product;
  return (
    <div className="product-main md:w-[48.5%] md:pr-[6.5%] md:float-left">
      <ProductTite
        className="product-main-title hidden md:block"
        product={product}
      />
      <div className="border-t-2 border-neutral-700 pt-7">
        {/* <span className="none md:inline-flex text-sm">Price:&nbsp;</span> */}
        <ProductPrice
          selectedVariant={selectedVariant}
          className="text-4xl md:text-3xl"
        />
      </div>
      <Suspense
        fallback={
          <ProductForm
            product={product}
            selectedVariant={selectedVariant}
            variants={[]}
          />
        }
      >
        <Await
          errorElement="There was a problem loading product variants"
          resolve={variants}
        >
          {(data) => (
            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              variants={data.product?.variants.nodes || []}
            />
          )}
        </Await>
      </Suspense>
      <div className="block md:hidden">
        <br />
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            window.location.href = window.location.href + '#cart-aside';
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
        <br />
      </div>
      <div className="flex-col marker:w-full">
        <h3 className="pb-2 text-lg md:text-base md:inline-block font-bold">
          Product Details
        </h3>
        <div
          className="text-[15px]"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      </div>
      <br />
    </div>
  );
}

function ProductPrice({
  selectedVariant,
  className,
}: {
  selectedVariant: ProductFragment['selectedVariant'];
  className?: string;
}) {
  return (
    <div className="product-price inline-flex">
      {selectedVariant?.compareAtPrice ? (
        <>
          <p>Sale</p>
          <br />
          <div className="product-price-on-sale">
            {selectedVariant ? (
              <Money
                className={cn(className)}
                data={selectedVariant.price}
                withoutTrailingZeros
              />
            ) : null}
            <s>
              <Money
                className={cn(className)}
                data={selectedVariant.compareAtPrice}
                withoutTrailingZeros
              />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && (
          <Money
            className={cn(className)}
            data={selectedVariant?.price}
            withoutTrailingZeros
          />
        )
      )}
    </div>
  );
}

function ProductForm({
  product,
  selectedVariant,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Array<ProductVariantFragment>;
}) {
  return (
    <div className="product-form">
      <VariantSelector
        handle={product.handle}
        options={product.options}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      {/* <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          window.location.href = window.location.href + '#cart-aside';
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton> */}
    </div>
  );
}

function ProductOptions({option}: {option: VariantOption}) {
  return (
    <div className="product-options" key={option.name}>
      <h5>{option.name}</h5>
      <div className="product-options-grid py-3.5">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="product-options-item"
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                border: isActive ? '1px solid black' : '1px solid transparent',
                opacity: isAvailable ? 1 : 0.3,
              }}
            >
              {value}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: CartLineInput[];
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className={buttonVariants({
              size: 'default',
              className: cn('w-full rounded-full h-11', {
                'opacity-50 cursor-not-allowed': disabled,
              }),
            })}
          >
            {children}
          </Button>
        </>
      )}
    </CartForm>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    images(first: 5) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
` as const;
