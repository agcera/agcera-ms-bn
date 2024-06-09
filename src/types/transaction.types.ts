export enum TransactionTypesEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface ReportTransactionRow {
  doneAt: string;
  store: string;
  type: TransactionTypesEnum;
  action: string;
  amount: number;
}
