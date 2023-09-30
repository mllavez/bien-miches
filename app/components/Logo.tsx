import {NavLink} from '@remix-run/react';

export function Logo() {
  return (
    <NavLink className="logo" prefetch="intent" to="/" end>
      Bien Miches
    </NavLink>
  );
}
