import Sale from '@database/models/sale';
import Store from '@database/models/store';
import Transaction from '@database/models/transaction';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { Op } from 'sequelize';

export const findQueryGenerators = (
  modelAttributes: { [key: string]: any },
  queryData?: GetAllRequestQuery,
  additionalData?: any
) => {
  const { skip, limit, sort, search, role } = queryData ?? {};

  const findQuery: any = { distinct: true };

  skip && (findQuery['offset'] = skip);
  limit && (findQuery['limit'] = limit);
  sort && (findQuery['order'] = Object.entries(sort).map(([key, value]) => [key, value]));

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
}: {
  from: Date;
  to: Date;
  store?: Store | null;
  remainingProducts: { [key: string]: number };
  sales: Sale[];
  transactions: Transaction[];
}) => {
  let totalSalesProfitLoss: number = 0;
  const salesRows = sales.map((sale) => {
    const store = sale.store;
    const storeVariations = sale.variations;
    const totalProducts = storeVariations.reduce(
      (acc, storeVariation) => acc + (storeVariation.quantity || 1) * storeVariation.variation.number,
      0
    );
    const totalCostPrice = storeVariations.reduce(
      (acc, storeVariation) =>
        acc + (storeVariation.quantity || 1) * storeVariation.variation.number * storeVariation.variation.costPrice,
      0
    );
    const totalSellingPrice = storeVariations.reduce(
      (acc, storeVariation) =>
        acc + (storeVariation.quantity || 1) * storeVariation.variation.number * storeVariation.variation.sellingPrice,
      0
    );
    const profitLoss = totalSellingPrice - totalCostPrice;
    totalSalesProfitLoss += profitLoss;
    return {
      doneAt: new Date(sale.createdAt).toDateString(),
      store: store.name,
      totalProducts,
      totalCostPrice,
      totalSellingPrice,
      profitLoss,
    };
  });

  let totalTransactionsProfitLoss: number = 0;
  const transactionsRows = transactions.map((transaction) => {
    const store = transaction.store;
    const type = transaction.type;
    const action = transaction.description;
    const amount = parseFloat((type === 'INCOME' ? transaction.amount : -transaction.amount).toString());
    totalTransactionsProfitLoss += amount;

    return {
      doneAt: new Date(transaction.createdAt).toDateString(),
      store: store.name,
      type,
      action,
      amount,
    };
  });

  const netProfitLoss = totalSalesProfitLoss + totalTransactionsProfitLoss;

  return `<!doctype html>
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
    <body class="bg-gray-100 flex justify-center">
      <div class="bg-white m-auto w-full max-w-[900px] rounded-md p-4">
        <div>
          <div>
            <h1 class="font-bold text-3xl text-center mt-2">${store?.name || 'Agceramoz'} report</h1>
            <h1 class="mb-2 text-center font-light">
              Report from <span class="font-semibold">${from.toDateString()}</span> to
              <span class="font-semibold">${to.toDateString()}</span>
            </h1>
          </div>
          <div>
            <h1 class="mb-4 text-center font-light">Generated on: <span class="font-semibold">${new Date().toDateString()}</span></h1>
          </div>
        </div>

        <!-- Remaining products report -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Remaining products report</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Product name</th>
              <th align="right">Products remaining</th>
            </tr>
          </thead>
          <tbody>
          ${Object.keys(remainingProducts)
            .map(
              (productName) =>
                `
                <tr class="bg-gray-50 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${productName}</td>
                  <td align="right">${remainingProducts[productName]}</td>
                </tr>
              `
            )
            .join(' ')}
            <tr class="bg-gray-100 *:py-3">
              <td align="left" class="pl-2">Total Products</td>
              <td align="right" class="pr-2">${Object.values(remainingProducts).reduce((acc, p) => acc + p, 0)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Sales report section -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 font-bold mt-2">
          <p>Sales Report</p>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-green-300 *:p-2">
              <th align="left">Done at</th>
              <th align="left">Store</th>
              <th align="center">N<sup>o</sup> of products</th>
              <th align="right">Total Cost price</th>
              <th align="left">Total Selling price</th>
              <th align="right">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows
              .map(({ doneAt, store, totalProducts, totalCostPrice, totalSellingPrice, profitLoss }) => {
                return `
                  <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                    <td align="left">${doneAt}</td>
                    <td align="left" class="text-ellipsis">${store}</td>
                    <td align="center">${totalProducts}</td>
                    <td align="right">${totalCostPrice} MZN</td>
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
              ? `<p style="color: lightcoral">(${totalSalesProfitLoss} MZN)</p>`
              : `<p>${totalSalesProfitLoss} MZN</p>`
          }
        </div>

        <!-- Transactions report -->
        <div class="bg-green-500 flex items-center justify-between px-2 py-3 mt-2 font-bold">
          <p>Transactions Report</p>
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
            ${transactionsRows
              .map(({ doneAt, store, type, action, amount }) => {
                return `
                <tr class="bg-gray-50/70 *:p-2 border-b border-blue_gray-A700">
                  <td align="left">${doneAt}</td>
                  <td align="left" class="text-ellipsis">${store}</td>
                  <td align="center">${type}</td>
                  <td align="left" class="text-ellipsis">${action}</td>
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
          <p>Total Profit/Loss</p>
          ${
            totalTransactionsProfitLoss < 0
              ? `<p style="color: lightcoral">(${totalTransactionsProfitLoss} MZN)</p>`
              : `<p>${totalTransactionsProfitLoss} MZN</p>`
          }
        </div>

        <!-- Calculate net profit or loss -->
        <div class="bg-gray-100 flex items-center justify-between px-2 py-3 border-t-2 border-green-600">
          <p>${netProfitLoss < 0 ? 'Net Loss' : 'Net Profit'}</p>
          ${
            netProfitLoss < 0
              ? `<p style="color: lightcoral">(${netProfitLoss} MZN)</p>`
              : `<p>${netProfitLoss} MZN</p>`
          }
        </div>
      </div>
    </body>
  </html>
  `;
};
