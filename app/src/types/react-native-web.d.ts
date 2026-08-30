declare module 'react-native-web' {
  import type { ComponentType } from 'react';

  export function unstable_createElement(
    component: string,
    props?: Record<string, unknown>,
  ): ReturnType<ComponentType>;
}
