/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Sales',
      [
        {
          id: '7ffdcde2-a8dc-427f-bac2-863f52401fc0',
          paymentMethod: 'CASH',
          clientId: '143e4667-a81d-12d3-c356-469311174301',
          clientType: 'USER',
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          createdAt: new Date(),
        }
      ],
      {}
    )
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Sales', null, {})
  },
}
