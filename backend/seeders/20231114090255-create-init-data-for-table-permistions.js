'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let d = new Date();
        return queryInterface.bulkInsert('Permissions', [
            { role: 'manager', resource: 'leave_reqs', action: 'read:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'leave_reqs', action: 'create:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'leave_reqs', action: 'update:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'leave_reqs', action: 'delete:any', attributes: '*', createdAt: d, updatedAt: d },
            
            { role: 'manager', resource: 'users', action: 'read:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'users', action: 'create:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'users', action: 'update:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'users', action: 'delete:any', attributes: '*', createdAt: d, updatedAt: d },
        
            { role: 'manager', resource: 'permissions', action: 'read:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'permissions', action: 'create:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'permissions', action: 'update:any', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'manager', resource: 'permissions', action: 'delete:any', attributes: '*', createdAt: d, updatedAt: d },
            
            { role: 'employee', resource: 'users', action: 'read:own', attributes: '*', createdAt: d, updatedAt: d },
            // { role: 'employee', resource: 'users', action: 'update:own', attributes: '*', createdAt: d, updatedAt: d },
          
            { role: 'employee', resource: 'leave_reqs', action: 'read:own', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'employee', resource: 'leave_reqs', action: 'create:own', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'employee', resource: 'leave_reqs', action: 'update:own', attributes: '*', createdAt: d, updatedAt: d },
            { role: 'employee', resource: 'leave_reqs', action: 'delete:own', attributes: '*', createdAt: d, updatedAt: d },
            
            
        ]   
        , {});
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Permissions', null, {});
    }
};
