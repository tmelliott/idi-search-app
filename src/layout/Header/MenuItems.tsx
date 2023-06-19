import {
  ChartBarIcon,
  HomeIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  {
    name: "Home",
    href: "/",
    Icon: HomeIcon,
  },
  {
    name: "About",
    href: "/about",
    Icon: InformationCircleIcon,
  },
  {
    name: "Quick Stats",
    href: "/stats",
    Icon: ChartBarIcon,
  },
  {
    name: "Help",
    href: "/help",
    Icon: QuestionMarkCircleIcon,
  },
];

export default menuItems;
export {
  HomeIcon,
  InformationCircleIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
};
