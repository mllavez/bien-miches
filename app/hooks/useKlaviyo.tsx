import React, {useEffect} from 'react';
import {useLoadScript} from '@shopify/hydrogen';
export function useKlaviyo() {
  const scriptStatus = useLoadScript(
    `//static.klaviyo.com/onsite/js/klaviyo.js?company_id=TdNuBs`,
  ).catch(() => {});
  useEffect(() => {
    if (scriptStatus === 'done') {
    }
  }, [scriptStatus]);

  return <div>{scriptStatus === 'done' && <p>Script loaded!</p>}</div>;
}
