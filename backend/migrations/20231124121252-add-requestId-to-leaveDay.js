module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LeaveDays', 'requestId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'LeaveRequests',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint("LeaveDays", {
      type: 'unique',
      fields: ['requestId', "date"],
      name: 'unique_requestId_date_constraint'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("LeaveDays", 'unique_requestId_date_constraint')
    await queryInterface.removeColumn('LeaveDays', 'requestId');
  },
};