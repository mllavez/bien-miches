import type {EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://monorail-edge.shopifysvc.com',
      'https://static-forms.klaviyo.com',
      'https://static.klaviyo.com', //✅
      'https://static-tracking.klaviyo.com',
      'https://fast.a.klaviyo.com',
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://static.klaviyo.com', //✅
      'https://static-tracking.klaviyo.com', //✅
      'https://cdn.judge.me',
      'https://monorail-edge.shopifysvc.com',
      'https://static-forms.klaviyo.com',
      'https://fast.a.klaviyo.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.shopify.com',
      'https://static.klaviyo.com', //✅
      'https://static-tracking.klaviyo.com', //✅
      'https://fast.a.klaviyo.com',
      'https://monorail-edge.shopifysvc.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
