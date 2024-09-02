import Sale from '@database/models/sale';
import Store from '@database/models/store';
import Transaction from '@database/models/transaction';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { ReportTransactionRow } from '@src/types/transaction.types';
import { Op } from 'sequelize';
import { s } from './security';
import { format } from 'date-fns';

export const findQueryGenerators = (
  modelAttributes: { [key: string]: any },
  queryData?: GetAllRequestQuery,
  additionalData?: any
) => {
  const { skip, limit, sort, search, role } = queryData ?? {};

  const findQuery: any = { distinct: true };

  skip && (findQuery['offset'] = skip);
  limit && (findQuery['limit'] = limit);
  sort && (findQuery['order'] = Object.entries(sort).map(([key, value]) => [...key.split('.'), value]));

  // add the query to order things by created date
  findQuery['order'] = [...(findQuery['order'] || []), ['createdAt', 'DESC']];

  if (additionalData) {
    Object.assign(findQuery, additionalData);
  }

  if (role) {
    findQuery.where = {
      ...findQuery['where'],
      role: {
        [Op.in]: [...role, findQuery['where']?.role],
      },
    };
  }

  if (search) {
    const attributesSearch = Object.entries(modelAttributes).reduce((prev, [attribute, attributeValue]) => {
      if (attributeValue.type.constructor.name === 'STRING') {
        prev.push({
          [attribute]: { [Op.like]: `%${search}%` },
        });
      }
      return prev;
    }, [] as any[]);

    findQuery.where = {
      ...findQuery['where'],
      [Op.or]: attributesSearch,
    };

    // if (findQuery.include && Array.isArray(findQuery.include)) {
    //   findQuery.include = findQuery.include.map((include: IncludeOptions) => {
    //     if (typeof include === 'object') {
    //       if (include.where && search) {
    //         include.where = {
    //           ...include['where'],
    //           // [Op.or]: attributesSearch,
    //         }
    //       } else {
    //         // include['where'] = {
    //         //   [Op.or]: attributesSearch,
    //         // }
    //       }
    //     }
    //     return include
    //   })
    // }
  }

  return findQuery;
};

export const generateFirstDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};
export const generateLastDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

export const generateReport = ({
  from,
  to,
  store,
  remainingProducts,
  sales,
  transactions,
  isAdmin,
}: {
  from: Date;
  to: Date;
  store?: Store | null;
  remainingProducts: { [key: string]: { count: number; price: number } };
  sales: Sale[];
  transactions: Transaction[];
  isAdmin: boolean;
}) => {
  const paymentsObjRows: {
    [paymentMethod: string]: { salesCount: number; transactionsCount: number; amount: number };
  } = {};
  let totalSalesProfitLoss: number = 0;
  let totalSalesSellingPrice: number = 0;
  let totalSalesCostPrice: number = 0;
  const salesProducts: {
    [key: string]: { count: number; costPrice: number; sellingPrice: number; profitLoss: number };
  } = {};
  const salesProductsTotals: { count: number; costPrice: number; sellingPrice: number; profitLoss: number } = {
    count: 0,
    costPrice: 0,
    sellingPrice: 0,
    profitLoss: 0,
  };
  const salesRows = sales.map((sale) => {
    const store = sale.store;
    const storeVariations = sale.variations;
    const { totalCostPrice, totalSellingPrice, products } = storeVariations.reduce(
      (acc, storeVariation) => {
        // Collect the salesProducts table data
        const productName = storeVariation.variation.product.name;
        const productQuantity = storeVariation.quantity || 0;
        const productCount = productQuantity * storeVariation.variation.number;
        const productCostPrice = parseFloat(`${storeVariation.variation.costPrice}`) * productQuantity;
        const productSellingPrice = parseFloat(`${storeVariation.variation.sellingPrice}`) * productQuantity;
        const productProfitLoss = productSellingPrice - productCostPrice;
        salesProducts[productName] = {
          count: (salesProducts[productName]?.count || 0) + productCount,
          costPrice: (salesProducts[productName]?.costPrice || 0) + productCostPrice,
          sellingPrice: (salesProducts[productName]?.sellingPrice || 0) + productSellingPrice,
          profitLoss: (salesProducts[productName]?.profitLoss || 0) + productProfitLoss,
        };
        salesProductsTotals.count += productCount;
        salesProductsTotals.costPrice += productCostPrice;
        salesProductsTotals.sellingPrice += productSellingPrice;
        salesProductsTotals.profitLoss += productProfitLoss;

        console.log(productName, productSellingPrice, 'product selling price');

        // Collect the sales table data
        acc.products.push({
          name: productName,
          variation: storeVariation.variation.name,
          price: (storeVariation.quantity || 0) * storeVariation.variation.sellingPrice,
        });
        acc.totalCostPrice += (storeVariation.quantity || 1) * storeVariation.variation.costPrice;
        acc.totalSellingPrice += (storeVariation.quantity || 1) * storeVariation.variation.sellingPrice;
        return acc;
      },
      { products: [], totalCostPrice: 0, totalSellingPrice: 0 } as {
        products: { name: string; variation: string; price: number }[];
        totalSellingPrice: number;
        totalCostPrice: number;
      }
    );
    paymentsObjRows[sale.paymentMethod] = {
      salesCount: (paymentsObjRows[sale.paymentMethod]?.salesCount || 0) + 1,
      amount: (paymentsObjRows[sale.paymentMethod]?.amount || 0) + totalSellingPrice,
      transactionsCount: paymentsObjRows[sale.paymentMethod]?.transactionsCount || 0,
    };
    const profitLoss = totalSellingPrice - totalCostPrice;
    totalSalesSellingPrice += totalSellingPrice;
    totalSalesCostPrice += totalCostPrice;
    totalSalesProfitLoss += profitLoss;
    return {
      doneAt: format(new Date(sale.createdAt), 'E dd/MM/yyyy HH:mm'),
      store: store.name,
      products,
      totalCostPrice,
      totalSellingPrice,
      profitLoss,
      method: sale.paymentMethod,
    };
  });

  let totalTransactionsProfitLoss: number = 0;
  let totalTransactionsIncomes: number = 0;
  let totalTransactionsExpenses: number = 0;
  const { incomeTransactionsRows, expenseTransactionsRows } = transactions.reduce(
    (acc, transaction) => {
      const store = transaction.store;
      const type = transaction.type;
      const action = transaction.description;
      const amount = parseFloat((type === 'INCOME' ? transaction.amount : -transaction.amount).toString());
      if (type === 'INCOME') {
        totalTransactionsIncomes += amount;
        acc.incomeTransactionsRows.push({
          doneAt: format(new Date(transaction.createdAt), 'E dd/MM/yyyy HH:mm'),
          store: store.name,
          method: transaction.paymentMethod,
          type,
          action,
          amount,
        });
      } else {
        totalTransactionsExpenses += amount;
        acc.expenseTransactionsRows.push({
          doneAt: format(new Date(transaction.createdAt), 'E dd/MM/yyyy HH:mm'),
          store: store.name,
          method: transaction.paymentMethod,
          type,
          action,
          amount,
        });
      }
      paymentsObjRows[transaction.paymentMethod] = {
        transactionsCount: (paymentsObjRows[transaction.paymentMethod]?.transactionsCount || 0) + 1,
        amount: (paymentsObjRows[transaction.paymentMethod]?.amount || 0) + amount,
        salesCount: paymentsObjRows[transaction.paymentMethod]?.salesCount || 0,
      };
      totalTransactionsProfitLoss += amount;
      return acc;

      // return {
      //   doneAt: new Date(transaction.createdAt).toDateString(),
      //   store: store.name,
      //   type,
      //   action,
      //   amount,
      // };
    },
    { incomeTransactionsRows: [], expenseTransactionsRows: [] } as {
      incomeTransactionsRows: ReportTransactionRow[];
      expenseTransactionsRows: ReportTransactionRow[];
    }
  );

  const totalPayments = totalSalesSellingPrice + totalTransactionsProfitLoss;

  const netProfitLoss = totalSalesProfitLoss + totalTransactionsProfitLoss;

  const totalRevenues = totalSalesSellingPrice + totalTransactionsIncomes;

  return (
    `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Report from ${from.toLocaleDateString()} to ${to.toLocaleDateString()}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
        rel="stylesheet"
      />
    </head>
    <style>
      html,
      body {
        font-family: 'Nunito', sans-serif;
        font-size: 14px;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
    </style>
    <body class="bg-white flex justify-center px-4">
      <div class="bg-white m-auto w-full max-w-[900px]">
        <div>
          <div>
            <h1 class="font-bold text-3xl text-center">${s(store?.name) || 'Agceramoz'} report</h1>
            <h1 class="mb-2 text-center font-light">
              Report from <span class="font-semibold">${from.toDateString()}</span> to
              <span class="font-semibold">${to.toDateString()}</span>
            </h1>
          </div>
          <div>
            <h1 class="mb-4 text-center font-light">Generated on: <span class="font-semibold">${new Date().toDateString()}</span></h1>
          </div>
        </div>

        ${
          isAdmin
            ? `
        <!-- Report overview -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Report overview on ${new Date().toDateString()}</p>
        </div>
        <div class="w-full bg-gray-100 px-3">
          <table class="w-full">
            <tbody>
              <tr class="bg-gray-100 *:p-2">
                <td align="left" class="font-semibold text-lg">TOTAL Incomes:</td>
                <td align="right">${totalTransactionsIncomes} MZN</td>
              </tr>
              <tr class="bg-gray-100 *:px-2">
                <td align="left" class="font-semibold text-lg">TOTAL Sales:</td>
                <td align="left">
                  <table class="w-full">
                    <thead>
                      <tr>
                        <th class="text-sm" align="center">Quantity</th>
                        <th class="text-sm pr-4" align="center">Profit</th>
                        <th class="text-sm" align="center">Cost Price</th>
                        <th class="text-sm " align="right">Selling Price</th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td align="center">${sales.length}</td>
                        <td align="center" class="pr-4">${totalSalesProfitLoss} MZN</td>
                        <td align="center" >${totalSalesCostPrice}</td>
                        <td align="right">${totalSalesSellingPrice} MZN</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="rounded-full h-[1px] bg-black" colspan="100"></td>
              </tr>
                   <tr class="bg-gray-100 *:p-2">
                <td align="left" class="font-semibold text-lg">TOTAL Revenue:</td>
                <td align="right">${totalRevenues} MZN</td>
              </tr>

              <tr class="bg-gray-100 *:p-2">
                <td align="left" class="font-semibold text-lg">TOTAL Expenses:</td>
                <td align="right">${totalTransactionsExpenses < 0 ? totalTransactionsExpenses * -1 : totalTransactionsExpenses} MZN</td>
              </tr>

              <tr>
                <td class="rounded-full h-[1px] bg-black" colspan="100"></td>
              </tr>
              <tr class="bg-gray-100 *:p-2">
                <td align="left" class="font-bold text-xl">${netProfitLoss < 0 ? 'NET Loss' : 'NET Profit'}:</td>
                ${
                  netProfitLoss < 0
                    ? `<td align="right" class="text-lg" style="color: lightcoral">(${netProfitLoss.toFixed(2)} MZN)</td>`
                    : `<td align="right" class="text-lg">${netProfitLoss.toFixed(2)} MZN</td>`
                }
              </tr>
            </tbody>
          </table>
        </div>
        `
            : ''
        }

        <!-- Payments report section -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 font-bold mt-2">
          <p>Payments Report</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Payment method</th>
              <th align="center">N<sup>o</sup> of sales</th>
              <th align="center">N<sup>o</sup> of transactions</th>
              <th align="right">Total amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(paymentsObjRows)
              .map((key) => {
                const { salesCount, transactionsCount, amount } = paymentsObjRows[key];
                return `
                  <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                    <td align="left">${s(key.toLocaleUpperCase())}</td>
                    <td align="center">${salesCount}</td>
                    <td align="center">${transactionsCount}</td>
                    ${
                      amount < 0
                        ? `<td align="right" style="color: lightcoral">(${amount} MZN)</td>`
                        : `<td align="right">${amount} MZN</td>`
                    }
                  </tr>
              `;
              })
              .join(' ')}
          </tbody>
        </table>
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3">
          <p>Total Payments</p>
            ${
              totalPayments < 0
                ? `<td align="right" style="color: lightcoral">(${totalPayments} MZN)</td>`
                : `<td align="right">${totalPayments} MZN</td>`
            }
        </div>

        ${
          isAdmin
            ? `
        <!-- Sales Products report -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Sold Products report</p>
        </div>
        <table class="w-full" style="page-break-after: always;">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Product name</th>
              <th align="center">Quantity</th>
              <th align="center">Total Cost price</th>
              <th align="center">Total selling price</th>
              <th align="right">Total Profit</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(salesProducts)
              .map((productName) => {
                return `
                <tr class="bg-gray-50 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${s(productName)}</td>
                  <td align="center">${salesProducts[productName].count}</td>
                  <td align="center">${salesProducts[productName].costPrice} MZN</td>
                  <td align="center">${salesProducts[productName].sellingPrice} MZN</td>
                  ${
                    salesProducts[productName].profitLoss < 0
                      ? `<td align="right" style="color: lightcoral">(${salesProducts[productName].profitLoss} MZN)</td>`
                      : `<td align="right">${salesProducts[productName].profitLoss} MZN</td>`
                  }
                </tr>
              `;
              })
              .join(' ')}
            <tr class="bg-gray-100 *:py-3">
              <td align="left" class="pl-2">Total</td>
              <td align="center" class="pr-2">${salesProductsTotals.count}</td>
              <td align="center" class="pr-2">${salesProductsTotals.costPrice} MZN</td>
              <td align="center" class="pr-2">${salesProductsTotals.sellingPrice} MZN</td>
              ${
                salesProductsTotals.profitLoss < 0
                  ? `<td align="right" style="color: lightcoral" class="pr-2">(${salesProductsTotals.profitLoss} MZN)</td>`
                  : `<td align="right" class="pr-2">${salesProductsTotals.profitLoss} MZN</td>`
              }
            </tr>
          </tbody>
        </table>
        `
            : ''
        }

        <!-- Remaining products report -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Remaining products report</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Product name</th>
              <th align="center">Products remaining</th>
              <th align="right">Total selling price</th>
            </tr>
          </thead>
          <tbody>
          ${Object.keys(remainingProducts)
            .map(
              (productName) =>
                `
                <tr class="bg-gray-50 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${s(productName)}</td>
                  <td align="center">${remainingProducts[productName].count}</td>
                  <td align="right">${remainingProducts[productName].price * remainingProducts[productName].count} MZN</td>
                </tr>
              `
            )
            .join(' ')}
            <tr class="bg-gray-100 *:py-3">
              <td align="left" class="pl-2">Total selling price</td>
              <td align="center" class="pr-2">${Object.values(remainingProducts).reduce((acc, p) => acc + p.count, 0)}</td>
              <td align="right" class="pr-2">${Object.values(remainingProducts).reduce((acc, p) => acc + p.price * p.count, 0)} MZN</td>
            </tr>
          </tbody>
        </table>` +
    (isAdmin
      ? `
        <!-- Sales report section -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 font-bold mt-2">
          <p>Sales Report</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Done at</th>
              <th align="left">Store</th>
              <th align="left">Products</th>
              <th align="left">Payment method</th>
              <th align="left">Total Cost price</th>
              <th align="left">Total Selling price</th>
              <th align="right">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows
              .map(({ doneAt, method, store, products, totalCostPrice, totalSellingPrice, profitLoss }) => {
                return `
                  <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                    <td align="left">${doneAt}</td>
                    <td align="left" class="truncate">${s(store)}</td>
                    <td align="left">
                      <ul>
                        ${products
                          .map(({ name, variation, price }, index) => {
                            return `<li class="w-full ${index % 2 === 0 ? 'bg-[#E6EEF5]' : 'bg-[#CFCFCF]'} px-2 my-1">${s(name)}; ${s(variation)}; ${price} MZN</li>`;
                          })
                          .join(' ')}
                      </ul>
                    </td>
                    <td align="left">${method}</td>
                    <td align="left">${totalCostPrice} MZN</td>
                    <td align="left">${totalSellingPrice} MZN</td>
                    ${
                      profitLoss < 0
                        ? `<td align="right" style="color: lightcoral">(${profitLoss} MZN)</td>`
                        : `<td align="right">${profitLoss} MZN</td>`
                    }
                  </tr>
              `;
              })
              .join(' ')}
          </tbody>
        </table>
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3">
          <p>Total Profit/Loss</p>
          ${
            totalSalesProfitLoss < 0
              ? `<p style="color: lightcoral">(${totalSalesProfitLoss.toFixed(2)} MZN)</p>`
              : `<p>${totalSalesProfitLoss.toFixed(2)} MZN</p>`
          }
        </div>`
      : '') +
    `
        <!-- Transactions report -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Transactions Report</p>
        </div>
        <div class="bg-green-300 *:p-2 font-bold">
          <p>Incomes</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Done at</th>
              <th align="left">Store</th>
              <th align="left">Type</th>
              <th align="left">Payment method</th>
              <th align="left">Action</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${incomeTransactionsRows
              .map(({ doneAt, method, store, type, action, amount }) => {
                return `
                <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${doneAt}</td>
                  <td align="left" class="truncate">${s(store)}</td>
                  <td align="left" ${type.toString() === 'EXPENSE' ? 'style="color: lightcoral"' : ''}>${s(type)}</td>
                  <td align="left">${method}</td>
                  <td align="left" class="truncate max-w-[200px]" title="${s(action)}">${s(action)}</td>
                  ${
                    amount < 0
                      ? `<td align="right" style="color: lightcoral">(${amount} MZN)</td>`
                      : `<td align="right">${amount} MZN</td>`
                  }
                </tr>
              `;
              })
              .join(' ')}
          </tbody>
        </table>
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3">
          <p>Total income</p>
          ${
            totalTransactionsIncomes < 0
              ? `<p style="color: lightcoral">(${totalTransactionsIncomes} MZN)</p>`
              : `<p>${totalTransactionsIncomes} MZN</p>`
          }
        </div>

        <div class="bg-green-300 *:p-2 font-bold mt-1">
          <p>Expenses</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Done at</th>
              <th align="left">Store</th>
              <th align="center">Type</th>
              <th align="left">Action</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseTransactionsRows
              .map(({ doneAt, store, type, action, amount }) => {
                return `
                <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${doneAt}</td>
                  <td align="left" class="truncate">${s(store)}</td>
                  <td align="center" ${type.toString() === 'EXPENSE' ? 'style="color: lightcoral"' : ''}>${type}</td>
                  <td align="left" class="truncate max-w-[200px]" title="${s(action)}">${s(action)}</td>
                  ${
                    amount < 0
                      ? `<td align="right" style="color: lightcoral">(${amount} MZN)</td>`
                      : `<td align="right">${amount} MZN</td>`
                  }
                </tr>
              `;
              })
              .join(' ')}
          </tbody>
        </table>
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3">
          <p>Total expenses</p>
          ${
            totalTransactionsExpenses < 0
              ? `<p style="color: lightcoral">(${totalTransactionsExpenses} MZN)</p>`
              : `<p>${totalTransactionsExpenses} MZN</p>`
          }
        </div>

        <!-- Calculate net transactions profit or loss -->
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3 border-t-2 border-green-600">
          <p>Total Transactions Profit/Loss</p>
          ${
            totalTransactionsProfitLoss < 0
              ? `<p style="color: lightcoral">(${totalTransactionsProfitLoss} MZN)</p>`
              : `<p>${totalTransactionsProfitLoss} MZN</p>`
          }
        </div>` +
    (isAdmin
      ? `
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3 border-t-2 border-green-600 mt-2">
          <p>${netProfitLoss < 0 ? 'Net Loss' : 'Net Profit'}</p>
          ${
            netProfitLoss < 0
              ? `<p style="color: lightcoral">(${netProfitLoss.toFixed(2)} MZN)</p>`
              : `<p>${netProfitLoss.toFixed(2)} MZN</p>`
          }
        </div>`
      : '') +
    `
      </div>
    </body>
  </html>`
  );
};
