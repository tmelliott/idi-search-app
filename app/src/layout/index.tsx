import MainLayout from "./MainLayout";

export const Layouts = {
  Main: MainLayout,
};

export type LayoutKeys = keyof typeof Layouts;

export { MainLayout };
