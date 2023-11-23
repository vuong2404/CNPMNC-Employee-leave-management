'use strict';
const bcrypt = require('bcrypt')
const faker = require("faker");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const clientPassword = await bcrypt.hash("employee", 10);
        const managerPassword = await bcrypt.hash("manager", 10);
        const clients = Array.from({ length: 10 }, (item, index) => ({
            username: `employee${index}`,
            email: faker.internet.email(),
            phone: faker.phone.phoneNumber(),
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            gender: Math.random < 0.5,
            birthday: faker.date.past(),
            avatar: faker.image.avatar(),
            hashedPassword: clientPassword,
            role: "employee",
            remainingDays: 12,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        const admins = [
            {
                username: `manager`,
                email: faker.internet.email(),
                phone: faker.phone.phoneNumber(),
                firstname: faker.name.firstName(),
                lastname: faker.name.lastName(),
                gender: Math.random < 0.5,
                birthday: faker.date.past(),
                avatar: faker.image.avatar(),
                hashedPassword: managerPassword,
                role: "manager",
                remainingDays: 12,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]
        await queryInterface.bulkInsert('Users', clients);
        await queryInterface.bulkInsert('Users', admins);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Users', null, {});
    }
};
