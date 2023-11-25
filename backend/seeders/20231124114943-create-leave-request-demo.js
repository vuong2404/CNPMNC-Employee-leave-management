'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userIdsQuery = await queryInterface.sequelize.query('SELECT id FROM "Users"', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    const userIds = userIdsQuery.map(user => user.id);
    const data =[]
    for (let i = 1; i <= 20; i++) {
      data.push({
        title: `Leave Request ${i}`,
        reason: `Reason ${i}`,
        description: `Description ${i}`,
        status: 'pending',
        confirmMessage: "",
        userId: userIds[Math.floor((Math.random() * userIds.length))],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } 

    await queryInterface.bulkInsert('LeaveRequests', data, {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('LeaveRequests', null, {});
  }
};
