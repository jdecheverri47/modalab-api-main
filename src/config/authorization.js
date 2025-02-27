// utils/authorization.js

import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

export const isAuthenticated = (context) => {
  if (!context.user) {
    throw new AuthenticationError('No autenticado');
  }
};

export const hasRole = (context, roles) => {
  isAuthenticated(context);
  if (!roles.includes(context.user.role)) {
    throw new ForbiddenError('No tienes permiso para realizar esta acción');
  }
};
