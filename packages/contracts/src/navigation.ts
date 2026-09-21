import { z } from 'zod';

export const ModuleNavigationBadgeSchema = z.enum(['ERP', 'PRO', 'AO_VIVO', 'BETA']);

export const NavigationItemSchema = z.object({
  title: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  badge: ModuleNavigationBadgeSchema.optional(),
  requiredPermissions: z.array(z.string()).default([]),
  featureFlag: z.string().optional(),
  children: z.array(z.lazy(() => NavigationItemSchema)).optional(),
});

export const ModuleManifestSchema = z.object({
  moduleId: z.string(),
  moduleName: z.string(),
  description: z.string(),
  badge: ModuleNavigationBadgeSchema.optional(),
  featureFlag: z.string().optional(),
  navigation: z.array(NavigationItemSchema),
});

export type ModuleNavigationBadge = z.infer<typeof ModuleNavigationBadgeSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
