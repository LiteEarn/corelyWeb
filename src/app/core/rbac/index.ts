export { Role } from './role.enum';
export { PermissionService } from './permission.service';
export { FeatureGateService } from './feature-gate.service';
export { roleGuard } from './role.guard';
export { HasPermissionDirective } from './has-permission.directive';
export {
  MENU_PERMISSIONS,
  ROUTE_PERMISSIONS,
  ENDPOINT_PERMISSIONS,
  ROLE_DEFAULT_ROUTES,
} from './permission-matrix';
export type { MenuItemDef, RouteDef, EndpointDef } from './permission-matrix';
