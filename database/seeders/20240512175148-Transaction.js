'use strict';

/* eslint-disable @typescript-eslint/no-unused-vars */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // await queryInterface.bulkInsert(
    //   'Transactions',
    //   [
    //     // {
    //     //   "id": "a90c1a62-5e1d-4bf7-b902-8d74c89644d1",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "b1d6a7f4-5e9c-4bf9-a732-7e67b5a9c1e5",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "c2e7b8c5-6f0d-4bfa-b843-8f78c6a1d2f6",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "34567890-12de-4f01-4567-89012def0123",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "23456789-01cd-4ef0-3456-78901cdef016",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "12345678-90bc-4def-2345-67890bcdef08",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "12345678-90bc-4def-2345-67890bcdef01",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "a1234567-89ab-4cde-f012-3456789abcde",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "b2345678-90bc-4def-0123-4567890bcdef",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "c3456789-01cd-4ef0-1234-5678901cdef0",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "d4567890-12de-4f01-2345-6789012def05",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "e5678901-23ef-4f12-3456-7890123ef012",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "f6789012-34f0-4f23-4567-8901234f0123",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "01234567-89ab-4cde-1234-56789abcdef0",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "12345678-90bc-4def-2345-67890bcdef00",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "23456789-01cd-4ef0-3456-78901cdef012",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // },
    //     // {
    //     //   "id": "34567890-12de-4f01-4567-89012def0127",
    //     //   "amount": 1200,
    //     //   "description": "Initial deposit",
    //     //   "storeId": "143e4667-a81d-12d3-c356-469311174300",
    //     //   "userId": "8215a8ea-cf39-4037-81e6-86f6b439dcf4",
    //     //   "type": "EXPENSE",
    //     //   "createdAt": "2024-06-09T12:34:56.789Z"
    //     // }
    //   ],

    //   {}
    // );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
