'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {

     await queryInterface.bulkInsert('Clients', [{
      id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d9',
       name: 'John Doe',
       phone: '+123234234239',
      isMember: false,
      createdAt: new Date().toISOString(),
     },], {});
     await queryInterface.bulkInsert('Clients', [{
      id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d3',
       name: 'Hene James',
       phone: '+123234234239',
      isMember: false,
      createdAt: new Date().toISOString(),
     },], {});
     await queryInterface.bulkInsert('Clients', [{
      id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d4',
       name: 'John Doe',
       phone: '+123234234239',
      isMember: false,
      createdAt: new Date().toISOString(),
     },], {});

  },

  async down (queryInterface) {

     await queryInterface.bulkDelete('Clients', null, {});

  }
};
