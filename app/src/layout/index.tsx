import DualLayout from "./DualLayout";
import MainLayout from "./MainLayout";

export const Layouts = {
  Main: MainLayout,
  Dual: DualLayout,
};

export type LayoutKeys = keyof typeof Layouts;

export { MainLayout, DualLayout };
