import {NavLink} from '@remix-run/react';

export function Logo() {
  return (
    <NavLink className="logo hover:no-underline" prefetch="intent" to="/" end>
      <span className="antialiased text-xl font-logo font-bold drop-shadow-xl uppercase bg-gradient-to-r bg-clip-text text-transparent from-green-800 from-[percentage:0%_25%] via-white via-[percentage:35%_65%] to-rose-700 to-[percentage:75%_100%]">
        Bien Miches
      </span>
    </NavLink>
  );
}
