module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LeaveRequests', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LeaveRequests', 'userId');
  },
};