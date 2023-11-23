'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING,
            },
            phone: {
                type: Sequelize.STRING
            },
            firstname: {
                type: Sequelize.STRING,
			    allowNull: false,
            },
            lastname: {
                type: Sequelize.STRING,
			    allowNull: false,
            },
            remainingDays: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            gender: {
                type: Sequelize.BOOLEAN
            },
            birthday: {
                type: Sequelize.DATE
            },
            avatar: {
                type: Sequelize.BLOB
            },
            role: {
                type: Sequelize.STRING,
			    allowNull: false,
                default: "employee"
            },
            hashedPassword: {
                type: Sequelize.STRING,
			    allowNull: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                default: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Users');
    }
};