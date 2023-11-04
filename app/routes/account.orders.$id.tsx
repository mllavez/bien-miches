import {json, redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type V2_MetaFunction} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import type {OrderLineItemFullFragment} from 'storefrontapi.generated';
import {ChevronLeft} from 'lucide-react';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';
import {Button, buttonVariants} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export const meta: V2_MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: LoaderArgs) {
  const {session, storefront} = context;

  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const customerAccessToken = await session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect('/account/login');
  }

  const {order} = await storefront.query(CUSTOMER_ORDER_QUERY, {
    variables: {orderId},
  });

  if (!order || !('lineItems' in order)) {
    throw new Response('Order not found', {status: 404});
  }

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
  });
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage} =
    useLoaderData<typeof loader>();
  return (
    <>
      <Link
        className="flex py-3.5 bg-zinc-800 md:hidden"
        to={`/account/orders`}
      >
        <MaxWidthWrapper>
          <ChevronLeft className="-ml-2" />
          Your Orders
        </MaxWidthWrapper>
      </Link>
      <div className="account-order grid gap-4">
        <div className="bg-card">
          <MaxWidthWrapper className="flex flex-col">
            <h2 className="text-3xl my-3">Order details</h2>
            <h3 className="text-xl font-semibold">Order {order.name}</h3>
            <p className="text-sm">
              {new Date(order.processedAt!).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              })}
            </p>
            <div>
              <div className="py-5 grid gap-5">
                {lineItems.map((lineItem, lineItemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                ))}
              </div>
            </div>
            <hr className="bg-zinc-700 h-0.5" />
            <div className="py-5">
              {((discountValue && discountValue.amount) ||
                discountPercentage) && (
                <tr>
                  <th scope="row" colSpan={3}>
                    <p>Discounts</p>
                  </th>
                  <th scope="row">
                    <p>Discounts</p>
                  </th>
                  <td>
                    {discountPercentage ? (
                      <span>-{discountPercentage}% OFF</span>
                    ) : (
                      discountValue && <Money data={discountValue!} />
                    )}
                  </td>
                </tr>
              )}
              <div className="a-row flex">
                <div className="a-column w-[50%]">
                  <p>Subtotal</p>
                </div>
                <div className="a-column w-[50%] text-right">
                  <Money data={order.subtotalPriceV2!} />
                </div>
              </div>
              <div className="row flex">
                <div className="a-column w-[50%]">Tax</div>
                <div className="a-column w-[50%] text-right">
                  <Money data={order.totalTaxV2!} />
                </div>
              </div>
              <div className="a-row flex">
                <div className="a-column w-[50%]">Total</div>
                <div className="a-column w-[50%] text-right">
                  <Money data={order.totalPriceV2!} />
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
        <div className="bg-card py-7">
          <MaxWidthWrapper className="flex flex-col gap-4">
            <h3 className="text-xl">Shipping Address</h3>
            {order?.shippingAddress ? (
              <address className="not-italic">
                <p>
                  {order.shippingAddress.firstName &&
                    order.shippingAddress.firstName + ' '}
                  {order.shippingAddress.lastName}
                </p>
                {order?.shippingAddress?.formatted ? (
                  order.shippingAddress.formatted.map((line: string) => (
                    <p key={line}>{line}</p>
                  ))
                ) : (
                  <></>
                )}
              </address>
            ) : (
              <p>No shipping address defined</p>
            )}
            <h3 className="text-xl">Status</h3>
            <div>
              <p>{order.fulfillmentStatus}</p>
            </div>
          </MaxWidthWrapper>
        </div>

        <p>
          <Link
            to={order.statusUrl}
            rel="noreferrer"
            className={cn(
              buttonVariants({
                size: 'lg',
                variant: 'default',
                className: 'w-full',
              }),
            )}
          >
            View Order Status →
          </Link>
        </p>
      </div>
    </>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <div key={lineItem.variant!.id} className="a-row flex">
      <div className="a-col w-[21.25%] mr-[5%] float-left min-h-[0.1rem] overflow-visible">
        <Link
          to={`/products/${lineItem.variant!.product!.handle}`}
          className="p-0"
        >
          {lineItem?.variant?.image && (
            <div className="relative inline-block">
              <Image
                data={lineItem.variant.image}
                width={96}
                height={96}
                className="rounded-md"
              />
            </div>
          )}
        </Link>
      </div>
      <div className="inline-flex w-[73.75%]">
        <div className="leading-snug p-0 w-[75%] mr-[5%] min-h-[0.1rem] overflow-visible">
          <p>
            {lineItem.quantity > 1 ? `${lineItem.quantity} x ` : ``}{' '}
            {lineItem.title}
          </p>
          <p>{lineItem.variant!.title}</p>
        </div>
        <div className="w-[20%] float-right mr-0 text-right">
          {!lineItem.discountedTotalPrice ? (
            <Money data={lineItem.variant!.price!} />
          ) : (
            <Money data={lineItem.discountedTotalPrice!} />
          )}
        </div>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Order
const CUSTOMER_ORDER_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        ...OrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment OrderLineProductVariant on ProductVariant {
    id
    image {
      altText
      height
      url
      id
      width
    }
    price {
      ...OrderMoney
    }
    product {
      handle
    }
    sku
    title
  }
  fragment OrderLineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...OrderMoney
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...OrderMoney
    }
    discountedTotalPrice {
      ...OrderMoney
    }
    variant {
      ...OrderLineProductVariant
    }
  }
  fragment Order on Order {
    id
    name
    orderNumber
    statusUrl
    processedAt
    fulfillmentStatus
    totalTaxV2 {
      ...OrderMoney
    }
    totalPriceV2 {
      ...OrderMoney
    }
    subtotalPriceV2 {
      ...OrderMoney
    }
    shippingAddress {
      ...AddressFull
    }
    discountApplications(first: 100) {
      nodes {
        ...DiscountApplication
      }
    }
    lineItems(first: 100) {
      nodes {
        ...OrderLineItemFull
      }
    }
  }
  query Order(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    order: node(id: $orderId) {
      ... on Order {
        ...Order
      }
    }
  }
` as const;
