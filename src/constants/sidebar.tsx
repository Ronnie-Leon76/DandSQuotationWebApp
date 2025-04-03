import DashboardIcon from "@/icons/dashboard-icon";
import IntegrationsIcon from "@/icons/integrations-icon";
import { File } from "lucide-react";

type SIDE_BAR_MENU_PROPS = {
  label: string;
  icon: JSX.Element;
  path: string;
};

export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "dashboard",
  },
  {
    label: "Quotation",
    icon: <File />,
    path: "quotation",
  },
 
];
