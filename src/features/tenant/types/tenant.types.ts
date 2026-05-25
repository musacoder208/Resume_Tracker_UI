import type { MenuItem } from "@/app/menu/menu.types";
import type { TenantTheme } from "@/theme/theme.types";

export type TenantConfig = {
  menu?: MenuItem[];
  theme?: TenantTheme;
};
