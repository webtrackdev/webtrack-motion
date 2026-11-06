// Envuelve una composicion con la marca de su plataforma.
import type { ComponentType } from 'react';
import { BrandProvider, type Brand } from './theme';

export const withBrand = <P extends object>(brand: Brand, Component: ComponentType<P>) => {
  const Branded = (props: P) => (
    <BrandProvider value={brand}>
      <Component {...props} />
    </BrandProvider>
  );
  Branded.displayName = `withBrand(${Component.displayName ?? Component.name})`;
  return Branded;
};
