import { z } from 'zod';

export const ModuleNavigationBadgeSchema = z.enum(['ERP', 'PRO', 'AO_VIVO', 'BETA']);

export type ModuleNavigationBadge = z.infer<typeof ModuleNavigationBadgeSchema>;

export type NavigationItem = {
  title: string;
  href: string;
  icon?: string;
  badge?: ModuleNavigationBadge;
  requiredPermissions: string[];
  featureFlag?: string;
  children?: NavigationItem[];
};

export const NavigationItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    badge: ModuleNavigationBadgeSchema.optional(),
    requiredPermissions: z.array(z.string()).default([]),
    featureFlag: z.string().optional(),
    children: z.array(NavigationItemSchema).optional(),
  }),
);


export const ModuleManifestSchema = z.object({
  moduleId: z.string(),
  moduleName: z.string(),
  description: z.string(),
  badge: ModuleNavigationBadgeSchema.optional(),
  featureFlag: z.string().optional(),
  navigation: z.array(NavigationItemSchema),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

