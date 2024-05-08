import { SortDirectionEnum } from '@src/types/common.types';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { UserRolesEnum } from '@src/types/user.types';
import { Request } from 'express';

// Throws an error if the sort query is invalid
export const formatSortQuery = (data: string): GetAllRequestQuery['sort'] => {
  const sorts = data.split(',').map((sort) => sort.trim());
  const sortQuery: GetAllRequestQuery['sort'] = {};

  for (const sort of sorts) {
    if (!sort.includes(':')) {
      throw new Error('Invalid sort query, must be in the format key:(ASC or DESC)]');
    }
    const [key, value] = sort.split(':').map((sort) => sort.trim());
    const direction = Object.values(SortDirectionEnum).find((sort) => sort === value.toUpperCase());
    direction && (sortQuery[key] = direction);
  }

  return sortQuery;
};
// Throws an error if the role query is invalid
export const formatRoleQuery = (data: string): GetAllRequestQuery['role'] => {
  const roles = data.split(',').map((role) => role.trim().toLowerCase());

  const userRoles = Object.values(UserRolesEnum);

  for (const role of roles) {
    if (!userRoles.includes(role as UserRolesEnum)) {
      throw new Error(`Invalid role query, one of the supplied roles is not valid: [${roles}]`);
    }
  }

  return roles as [UserRolesEnum];
};

export const getBackendUrl = (req: Request) => {
  return req.protocol + '://' + req.get('host');
};
