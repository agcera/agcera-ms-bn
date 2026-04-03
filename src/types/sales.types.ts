import { PaymentMethodsEnum } from '@database/models/paymentMethods';
import { SortDirectionEnum } from './common.types';
import { ClientTypesEnum, UserRolesEnum } from './user.types';

export interface CreateSaleRequestProducts {
  [key: string]: number;
}

export interface CreateSalePayment {
  paymentMethod: PaymentMethodsEnum;
  amount: number;
}

export interface CreateSaleRequest {
  variations?: CreateSaleRequestProducts;
  mixtures?: CreateSaleRequestProducts;
  payments: CreateSalePayment[];
  phone: string;
  clientName: string;
  isMember: boolean;
  storeId: string;
  doneOn?: Date;
}

export interface GetAllRequestQuery<
  Sort extends { [key: string]: SortDirectionEnum } | string = { [key: string]: SortDirectionEnum },
> {
  search?: string;
  skip?: number;
  limit?: number;
  sort?: Sort;
  role?: [UserRolesEnum];
  storeId?: string;
  clientPhone?: string;
}
