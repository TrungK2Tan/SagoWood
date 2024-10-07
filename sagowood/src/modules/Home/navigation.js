import {
  IconHome,
  IconExposure,
  IconBookmark,
  IconBrandTelegram,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import DropdownMenu from "../../pop-up/DropdownMenu";

export const navigations = [
  {
    id: 1,
    name: "Feed",
    icon: <IconHome />,
    url: "/",
  },
  {
    id: 2,
    name: "Explore",
    icon: <IconExposure />,
    url: "/",

  },
  {
    id: 3,
    name: "My Favourite",
    icon: <IconBookmark />,
    url: "/profile?tab=saved",
  },
  {
    id: 4,
    name: "Direct",
    icon: <IconBrandTelegram />,
    url: "/direct",

  },
  {
    id: 5,
    name: "Profile",
    icon: <IconUser />,
    url: "/profile",
  },
  {
    id: 6,
    name: "Settings",
    icon: <DropdownMenu />, // Use the DropdownMenu component here
    url: "/", // This can be left or modified as needed
  },
];
