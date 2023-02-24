import type { NextPage, NextComponentType, NextPageContext } from "next";
import type { AppProps } from "next/app";
import type { LayoutKeys } from "~/layout";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  Layout?: LayoutKeys;
};

export type NextComponentTypeWithLayout = AppProps & {
  Component: NextComponentType<NextPageContext, any, any> & {
    Layout?: LayoutKeys;
  };
};
