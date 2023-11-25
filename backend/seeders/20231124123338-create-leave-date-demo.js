'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const leaveRequestsQuery = await queryInterface.sequelize.query('SELECT id FROM "LeaveRequests"', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    const leaveRequests = leaveRequestsQuery.map(item => item.id);
    const data =[]
    for (let i = 1; i <= 50; i++) {
      data.push({
        date: new Date(new Date() - 86400000*i),
        requestId: leaveRequests[Math.floor((Math.random() * leaveRequests.length))],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } 

    await queryInterface.bulkInsert('LeaveDays', data, {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('LeaveDays', null, {});
  }
};
