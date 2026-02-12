import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";

/**
 * Check if a path matches an allowed pattern.
 * Supports * as wildcard at the end of patterns.
 */
const matchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    return path === prefix.slice(0, -1) || path.startsWith(prefix);
  }
  return path === pattern;
};

const enforceAllowList = (
  roles: string[],
  allowedRoutes: string[],
  readOnlyRoutes: string[],
) => {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction,
  ) => {
    const authContext = (
      req as MedusaRequest & {
        auth_context?: { actor_id?: string };
      }
    ).auth_context;
    const userId = authContext?.actor_id;

    if (!userId) {
      return next();
    }

    try {
      const userService = req.scope.resolve("user");
      const user = await userService.retrieveUser(userId);

      const userRole = user.metadata?.role as string | undefined;

      if (!userRole || !roles.includes(userRole)) {
        return next();
      }

      const isAllowed = allowedRoutes.some((pattern) =>
        matchesPattern(req.baseUrl, pattern),
      );

      if (!isAllowed) {
        throw new MedusaError(
          MedusaError.Types.UNAUTHORIZED,
          `Access denied. Users with role "${userRole}" cannot access this resource`,
        );
      }

      const isReadOnly = readOnlyRoutes.some((pattern) =>
        matchesPattern(req.baseUrl, pattern),
      );

      if (isReadOnly && req.method !== "GET") {
        throw new MedusaError(
          MedusaError.Types.UNAUTHORIZED,
          `Access denied. Users with role "${userRole}" can only view this resource, not modify it`,
        );
      }

      next();
    } catch (error) {
      if (error instanceof MedusaError) {
        throw error;
      }

      next();
    }
  };
};

export default enforceAllowList;
