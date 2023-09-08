const db = require('./config/connection');

async function getEmployees() {
    const sql = `SELECT DISTINCT id, CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee`;
    const [employees] = await db.query(sql);

    return employees.map((employee) => {
        return {
            name: employee.name,
            value: employee.id
        }
    })
}
async function getRoles() {
    const sql = `SELECT DISTINCT title, id FROM role`;
    const [roles] = await db.query(sql);

    return roles.map((role) => {
        return {
            name: role.title,
            value: role.id
        }
    })
}
async function getDepartments() {
    const sql = `SELECT DISTINCT id, name FROM department`;
    const [departments] = await db.query(sql);

    return departments.map((department) => {
        return {
            name: department.name,
            value: department.id
        }
    })
}

module.exports = {getEmployees, getRoles, getDepartments}