'use strict';
/* eslint-disable @typescript-eslint/no-unused-vars */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Deleteds',


      [
        {
          // This should always be there. It is the main store main
          id: '3b07d2f3-89fa-4e94-bb11-5369ff9ddbd7',
          deletedBy: JSON.stringify({
            "name": "Gustavo",
            "phone": "+21341123423"
          }),
          description: JSON.stringify({
            "store": {
              "id": "143e4667-a81d-12d3-c356-469311174301",
              "name": "Store 2",
              "location": "Maputo 13",
              "phone": "+258840000001",
              "isActive": true,
              "createdAt": "2024-05-19T10:55:45.919Z",
              "updatedAt": "2024-05-19T10:55:53.472Z",
              "deletedAt": "2024-05-19T10:55:53.471Z",
              "users": [
                  {
                      "id": "8215a8ea-cf39-4037-81e6-86f6b439dcf5",
                      "name": "keeper 1",
                      "email": "keeper1@gmail.com",
                      "phone": "+123456789024",
                      "gender": "UNSPECIFIED",
                      "location": "Maputo Center",
                      "role": "keeper",
                      "image": "https://via.placeholder.com/150?text=image%20not%20found",
                      "isActive": true
                  },
                  {
                      "id": "8215a8ea-cf39-4037-81e6-86f6b439dcf7",
                      "name": "user 1",
                      "email": "user1@gmail.com",
                      "phone": "+123456789026",
                      "gender": "UNSPECIFIED",
                      "location": "Maputo Center",
                      "role": "user",
                      "image": "https://via.placeholder.com/150?text=image%20not%20found",
                      "isActive": true
                  }
              ],
              "products": [
                  {
                      "id": "a5aa7e8b-9306-4ff2-a19a-5ab633c206c4",
                      "quantity": 50,
                      "storeId": "143e4667-a81d-12d3-c356-469311174301",
                      "productId": "123e4567-e89b-12d3-a456-426614174001",
                      "store": {
                          "id": "143e4667-a81d-12d3-c356-469311174301",
                          "name": "Store 2",
                          "location": "Maputo 13",
                          "phone": "+258840000001",
                          "isActive": true
                      },
                      "product": {
                          "id": "123e4567-e89b-12d3-a456-426614174001",
                          "name": "UnoProducto",
                          "image": "https://via.placeholder.com/150?text=image%20not%20found",
                          "description": "Producto de prueba en la base de datos",
                          "type": "STANDARD"
                      }
                  },
                  {
                      "id": "a5aa7e8b-9306-4ff2-a19a-5ab633c206c5",
                      "quantity": 50,
                      "storeId": "143e4667-a81d-12d3-c356-469311174301",
                      "productId": "123e4567-e89b-12d3-a456-426614174002",
                      "store": {
                          "id": "143e4667-a81d-12d3-c356-469311174301",
                          "name": "Store 2",
                          "location": "Maputo 13",
                          "phone": "+258840000001",
                          "isActive": true
                      },
                      "product": {
                          "id": "123e4567-e89b-12d3-a456-426614174002",
                          "name": "DuoProducto",
                          "image": "https://via.placeholder.com/150?text=image%20not%20found",
                          "description": "Producto de prueba en la base de datos",
                          "type": "STANDARD"
                      }
                  },
                  {
                      "id": "a5aa7e8b-9306-4ff2-a19a-5ab633c206c6",
                      "quantity": 10,
                      "storeId": "143e4667-a81d-12d3-c356-469311174301",
                      "productId": "123e4567-e89b-12d3-a456-426614174003",
                      "store": {
                          "id": "143e4667-a81d-12d3-c356-469311174301",
                          "name": "Store 2",
                          "location": "Maputo 13",
                          "phone": "+258840000001",
                          "isActive": true
                      },
                      "product": {
                          "id": "123e4567-e89b-12d3-a456-426614174003",
                          "name": "TresProducto",
                          "image": "https://via.placeholder.com/150?text=image%20not%20found",
                          "description": "Producto de prueba en la base de datos",
                          "type": "STANDARD"
                      }
                  },
                  {
                      "id": "a5aa7e8b-9306-4ff2-a19a-5ab633c206c7",
                      "quantity": 50,
                      "storeId": "143e4667-a81d-12d3-c356-469311174301",
                      "productId": "b3c15f17-2756-434d-a01e-0b1e7209cb47",
                      "store": {
                          "id": "143e4667-a81d-12d3-c356-469311174301",
                          "name": "Store 2",
                          "location": "Maputo 13",
                          "phone": "+258840000001",
                          "isActive": true
                      },
                      "product": {
                          "id": "b3c15f17-2756-434d-a01e-0b1e7209cb47",
                          "name": "Agcera",
                          "image": "https://via.placeholder.com/150?text=image%20not%20found",
                          "description": "Producto de prueba en la base de datos",
                          "type": "SPECIAL"
                      }
                  }
              ]
          }
          }),
          table: 'store',
          createdAt: new Date().toISOString(),
        },


        // Store 2
        {
          id: '8db3f450-3ab5-41e5-94d2-d5106930c4ad',
          description: JSON.stringify({"sale": {
            "id": "7ffdcde2-a8dc-427f-bac2-863f52401fb0",
            "paymentMethod": "CASH",
            "clientId": "8215a8ea-cf39-4037-81e6-86f6b439dcf7",
            "clientType": "USER",
            "storeId": "143e4667-a81d-12d3-c356-469311174301",
            "createdAt": "2024-05-14T17:27:52.583Z",
            "updatedAt": "2024-05-18T18:21:25.236Z",
            "deletedAt": "2024-05-18T18:21:25.235Z",
            "store": {
                "id": "143e4667-a81d-12d3-c356-469311174301",
                "name": "Store 2",
                "location": "Maputo 13",
                "phone": "+258840000001",
                "isActive": true
            },
            "variations": [
                {
                    "id": "5d432d64-5991-4c00-9f70-7bc89e4375e0",
                    "quantity": 20,
                    "saleId": "7ffdcde2-a8dc-427f-bac2-863f52401fb0",
                    "variationId": "3f33b9d1-9b11-4d85-a3c3-8d1676a67110",
                    "variation": {
                        "id": "3f33b9d1-9b11-4d85-a3c3-8d1676a67110",
                        "name": "Unit",
                        "number": 1,
                        "costPrice": "100",
                        "sellingPrice": "200",
                        "productId": "123e4567-e89b-12d3-a456-426614174001",
                        "product": {
                            "id": "123e4567-e89b-12d3-a456-426614174001",
                            "name": "UnoProducto",
                            "image": "https://via.placeholder.com/150?text=image%20not%20found",
                            "description": "Producto de prueba en la base de datos",
                            "type": "STANDARD"
                        }
                    }
                },
                {
                    "id": "5d432d64-5991-4c00-9f70-7bc89e4375e1",
                    "quantity": 10,
                    "saleId": "7ffdcde2-a8dc-427f-bac2-863f52401fb0",
                    "variationId": "3f33b9d1-9b11-4d85-a3c3-8d1676a67111",
                    "variation": {
                        "id": "3f33b9d1-9b11-4d85-a3c3-8d1676a67111",
                        "name": "Unit",
                        "number": 1,
                        "costPrice": "200",
                        "sellingPrice": "400",
                        "productId": "123e4567-e89b-12d3-a456-426614174002",
                        "product": {
                            "id": "123e4567-e89b-12d3-a456-426614174002",
                            "name": "DuoProducto",
                            "image": "https://via.placeholder.com/150?text=image%20not%20found",
                            "description": "Producto de prueba en la base de datos",
                            "type": "STANDARD"
                        }
                    }
                }
            ]
        }}),
          deletedBy: JSON.stringify({
            "name": "Gustavo",
            "phone": "+21341123423"
          }),
          table: 'sale',
          createdAt: new Date().toISOString(),
        },


        // store 3
        {
          id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
          description: JSON.stringify({
            "user": {
              "id": "8215a8ea-cf39-4037-81e6-86f6b439dcf5",
              "name": "keeper 1",
              "email": "keeper1@gmail.com",
              "phone": "+123456789024",
              "gender": "UNSPECIFIED",
              "location": "Maputo Center",
              "role": "keeper",
              "storeId": "143e4667-a81d-12d3-c356-469311174301",
              "image": "https://via.placeholder.com/150?text=image%20not%20found",
              "isActive": true,
              "createdAt": "2024-05-19T11:17:40.387Z",
              "updatedAt": "2024-05-19T11:17:44.239Z",
              "deletedAt": "2024-05-19T11:17:44.239Z",
              "store": {
                  "id": "143e4667-a81d-12d3-c356-469311174301",
                  "name": "Store 2",
                  "location": "Maputo 13",
                  "phone": "+258840000001",
                  "isActive": true
              }
          }
          }),
          deletedBy: JSON.stringify({
            "name": "Gustavo",
            "phone": "+21341123423"
          }),
          table: 'user',
          createdAt: new Date().toISOString(),
        },
        // product 1
        {
          id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d9',
          description: JSON.stringify({
            "product": {
              "id": "123e4567-e89b-12d3-a456-426614174001",
              "name": "UnoProducto",
              "image": "https://via.placeholder.com/150?text=image%20not%20found",
              "description": "Producto de prueba en la base de datos",
              "type": "STANDARD",
              "createdAt": "2024-05-19T14:22:03.774Z",
              "updatedAt": "2024-05-19T14:23:01.363Z",
              "deletedAt": "2024-05-19T14:23:01.363Z",
              "variations": [
                  {
                      "id": "3f33b9d1-9b11-4d85-a3c3-8d1676a67110",
                      "name": "Unit",
                      "number": 1,
                      "sellingPrice": "200",
                      "productId": "123e4567-e89b-12d3-a456-426614174001"
                  }
              ]
          }
          }),
          deletedBy: JSON.stringify({
            "name": "Gustavo",
            "phone": "+21341123423"
          }),
          table: 'product',
          createdAt: new Date().toISOString(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Deleteds', null, {});
  },
};
