import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/utils';
import {cn} from '@/lib/utils';
import {Button, buttonVariants} from '@/components/ui/button';

type CartLine = CartApiQueryFragment['lines']['nodes'][0];

type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: 'page' | 'aside';
};

export function CartMain({layout, cart}: CartMainProps) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart.discountCodes.filter((code) => code.applicable).length);
  const className = `cart-main${withDiscount ? ' with-discount' : ''}`;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </div>
  );
}

function CartDetails({layout, cart}: CartMainProps) {
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  return (
    <div className="cart-details">
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts className="mb-3" discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
      <CartLines
        className="border-t-2 border-neutral-700 pt-4"
        lines={cart?.lines}
        layout={layout}
      />
    </div>
  );
}

function CartLines({
  lines,
  layout,
  className,
}: {
  layout: CartMainProps['layout'];
  lines: CartApiQueryFragment['lines'] | undefined;
  className: string;
}) {
  if (!lines) return null;

  return (
    <div aria-labelledby="cart-lines" className={className}>
      <ul>
        {lines.nodes.map((line) => (
          <CartLineItem key={line.id} line={line} layout={layout} />
        ))}
      </ul>
    </div>
  );
}

function CartLineItem({
  layout,
  line,
}: {
  layout: CartMainProps['layout'];
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  return (
    <li key={id} className="cart-line flex flex-col">
      <div className="flex mb-5 mt-2">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={135}
            loading="lazy"
            width={135}
          />
        )}
        <div className="pl-4">
          <Link
            className="no-underline"
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                // close the drawer
                window.location.href = lineItemUrl;
              }
            }}
          >
            <p className="font-normal">{product.title}</p>
          </Link>
          <CartLinePrice line={line} as="span" />
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <CartLineQuantity line={line} />
    </li>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <Link
        className={cn(
          'my-3.5',
          buttonVariants({
            size: 'lg',
            variant: 'default',
            className: 'w-full',
          }),
        )}
        to={checkoutUrl}
        target="_self"
      >
        <p>Continue to checkout &rarr;</p>
      </Link>
    </div>
  );
}

export function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment['cost'];
  layout: CartMainProps['layout'];
}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      {/* <h4>Totals</h4> */}
      <div className="cart-subtotal mb-2">
        <span className="text-xl ">Subtotal&nbsp;</span>
        <div className="flex text-2xl leading-snug font-bold">
          <div className="text-sm leading-7">$</div>
          {cost?.subtotalAmount?.amount ? (
            <Money data={cost?.subtotalAmount} withoutCurrency />
          ) : (
            '-'
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function CartLineRemoveButton({lineIds}: {lineIds: string[]}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <Button
        type="submit"
        className={buttonVariants({
          size: 'sm',
          variant: 'outline',
          className:
            'bg-zinc-900 border-neutral-700 shadow-[0_0.2rem_0.5rem_0_rgba(66,66,66,0.5)]',
        })}
      >
        Delete
      </Button>
    </CartForm>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex">
      <div className="cart-line-quantiy h-9 w-32 float-left mr-2.5">
        <div className="w-[30%] flex items-center justify-center rounded-tl-xl rounded-bl-xl bg-gradient-to-b from-gray-50 to-gray-200 text-stone-950">
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <span>&#8722; </span>
            </button>
          </CartLineUpdateButton>
        </div>
        <div className="bg-white border-zinc-300 flex justify-center items-center w-[40%]">
          <div className="text-stone-950">{quantity}</div>
        </div>
        <div className="w-[30%] flex items-center justify-center rounded-tr-xl rounded-br-xl bg-gradient-to-b from-gray-50 to-gray-200 text-stone-950">
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
            >
              <span>&#43;</span>
            </button>
          </CartLineUpdateButton>
        </div>
      </div>
      <div>
        <CartLineRemoveButton lineIds={[lineId]} />
      </div>
    </div>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return (
    <div className="font-bold flex">
      <div className="text-xs font-normal leading-5">$</div>
      <Money
        withoutTrailingZeros
        withoutCurrency
        {...passthroughProps}
        data={moneyV2}
        className="text-xl leading-6"
      />
    </div>
  );
}

export function CartEmpty({
  hidden = false,
  layout = 'aside',
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link
        to="/collections"
        onClick={() => {
          if (layout === 'aside') {
            window.location.href = '/collections';
          }
        }}
      >
        Continue shopping →
      </Link>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  className,
}: {
  discountCodes: CartApiQueryFragment['discountCodes'];
  className?: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className={cn(className)}>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
  className,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
  className?: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
      className={className}
    >
      {children}
    </CartForm>
  );
}
