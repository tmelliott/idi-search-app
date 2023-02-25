import type { NextPage, NextComponentType, NextPageContext } from "next";
import type { AppProps } from "next/app";
import type { LayoutKeys } from "~/layout";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: LayoutKeys;
};

export type NextComponentTypeWithLayout = AppProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: NextComponentType<NextPageContext, any, any> & {
    Layout?: LayoutKeys;
  };
};

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
