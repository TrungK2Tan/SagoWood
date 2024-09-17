import {
  IconHome,
  IconExposure,
  IconBookmark,
  IconBrandTelegram,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

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
    icon: <IconSettings />,
    url: "/",
  },
];
