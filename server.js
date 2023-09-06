// packages needed for application
const inquirer = require('inquirer')
// Import and require mysql2
const mysql = require('mysql2');

var figlet = require('figlet');

const express = require('express');

// import and configure dotenv
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
).promise();


// Get employees, managers, roles, and departments
const employees = [];
const managers = [];
const roles = [];
const departments = [];

async function getEmployees() {
    const sql = `SELECT DISTINCT CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee`;
    const result = await db.query(sql);
    for (let i = 0; i < result[0].length; i++) {
        employees.push(result[0][i].name);
    }
}
async function getManagers() {
    const sql = `SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id WHERE employee.manager_id IS NOT NULL`;
    const result = await db.query(sql);
    for (let i = 0; i < result[0].length; i++) {
        managers.push(result[0][i].manager);
    }
}
async function getRoles() {
    const sql = `SELECT DISTINCT title FROM role`;
    const result = await db.query(sql);
    for (let i = 0; i < result[0].length; i++) {
        roles.push(result[0][i].title);
    }
}
async function getDepartments() {
    const sql = `SELECT DISTINCT name FROM department`;
    const result = await db.query(sql);
    for (let i = 0; i < result[0].length; i++) {
        departments.push(result[0][i].name);
    }
}

// Get department, role, and manager ids
async function getDepartmentId(department) {
    const sql = `SELECT id FROM department WHERE name = ?`;
    const result = await db.query(sql, department);
    return result[0][0].id;
}
async function getRoleId(title) {
    const sql = `SELECT id FROM role WHERE title = ?`;
    const result = await db.query(sql, title);
    return result[0][0].id;
}
async function getManagerId(manager) {
    const sql = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;
    const params = manager.split(' ');
    const result = await db.query(sql, params);
    return result[0][0].id;
}


// create an array of questions for initial user prompts
const questions = [
    {
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Update Employee Manager', new inquirer.Separator(), 'View All Roles', 'Add Role', new inquirer.Separator(), 'View All Departments', 'Add Department', new inquirer.Separator(), 'Quit', new inquirer.Separator()],
        name: 'choice'
    }
];
// questions for adding/updating employee
const add_employee_questions = [
    {
        message: 'What is the employee\'s first name?', type: 'input', name: 'first_name'
    },
    {
        message: 'What is the employee\'s last name?', type: 'input', name: 'last_name'
    },
    {
        message: 'What is the employee\'s role?',
        type: 'list',
        choices: roles,
        name: 'role',
        loop: false
    },
    {
        message: 'Who is the employee\'s manager?',
        type: 'list',
        choices: managers,
        name: 'manager',
        loop: false
    }
];
const update_employee_questions = [
    {
        message: 'Who\'s role would you like to update?',
        type: 'list',
        choices: employees,
        name: 'name',
        loop: false
    },
    {
        message: 'Which role do you want to assign the selected employee?',
        type: 'list',
        choices: roles,
        name: 'role',
        loop: false
    }
];
const update_employee_manager_questions = [
    {
        message: 'Who\'s role would you like to update?',
        type: 'list',
        choices: employees,
        name: 'name',
        loop: false
    },
    {
        message: 'Which manager do you want to assign the selected employee?',
        type: 'list',
        choices: managers,
        name: 'manager',
        loop: false
    }
];

// questions for adding new department
const add_department_questions = [
    {
        message: 'What is the name of the department?', type: 'input', name: 'department'
    }
];
// questions for adding new role
const add_role_questions = [
    {
        message: 'What is the name of the role?', type: 'input', name: 'role_name'
    },
    {
        message: 'What is the salary of the role?', type: 'input', name: 'salary'
    },
    {
        message: 'What department does the role belong to?',
        type: 'list',
        choices: departments,
        name: 'department',
        loop: false
    }
];

// employee related functions
async function addEmployee() {
    await getManagers();
    await getRoles();
    inquirer.prompt(add_employee_questions).then(async (answers) => {
        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
        const firstName = answers.first_name;
        const lastName = answers.last_name;
        const roleId = await getRoleId(answers.role);
        const managerId = await getManagerId(answers.manager);

        const params = [firstName, lastName, roleId, managerId];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
            }
        })
            .catch(console.log)
            .then(() => {
                ask();
            })
    })
}
function viewEmployees() {
    // manager id should return the first and last name of the manager
    const sql = `SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
    db.query(sql)
        .then(([rows, fields]) => {
            console.log();
            console.table(rows);
        })
        .catch(console.log)
        .then(() => {
            ask();
        });
}
async function updateEmployee() {
    await getEmployees();
    await getRoles();
    inquirer.prompt(update_employee_questions).then(async (answers) => {
        const sql = `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`;
        const name = answers.name;
        const firstName = name.split(' ')[0];
        const lastName = name.split(' ')[1];
        const roleId = await getRoleId(answers.role);

        const params = [roleId, firstName, lastName];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
            }
        })
            .catch(console.log)
            .then(() => {
                ask();
            })
    })
}
async function updateEmployeeManager() {
    await getEmployees();
    await getManagers();
    inquirer.prompt(update_employee_manager_questions).then(async (answers) => {
        const sql = `UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?`;
        const name = answers.name;
        const firstName = name.split(' ')[0];
        const lastName = name.split(' ')[1];
        const managerId = await getManagerId(answers.manager);

        const params = [managerId, firstName, lastName];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
            }
        })
            .catch(console.log)
            .then(() => {
                ask();
            })
    })
}

// role related functions
function viewRoles() {
    const sql = `SELECT * FROM role`;
    db.query(sql)
        .then(([rows, fields]) => {
            console.log();
            console.table(rows);
        })
        .catch(console.log)
        .then(() => {
            ask();
        });
}
async function addRole() {
    await getDepartments();
    inquirer.prompt(add_role_questions).then(async (answers) => {
        const roleName = answers.role_name;
        const salary = answers.salary;
        const department = answers.department;

        const departmentId = await getDepartmentId(department);

        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

        const params = [roleName, salary, departmentId];
        // insert statement to add new role
        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
            }
        })
            .catch(console.log)
            .then(() => {
                ask();
            })
    })
}

// department related functions
function viewDepartments() {
    const sql = `SELECT * FROM department`;
    db.query(sql)
        .then(([rows, fields]) => {
            console.log();
            console.table(rows);
        })
        .catch(console.log)
        .then(() => {
            ask();
        });
}
function addDepartment() {
    inquirer.prompt(add_department_questions).then((answers) => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        const departmentName = answers.department;

        db.query(sql, departmentName, (err, result) => {
            if (err) {
                console.log(err);
            }
        })
            .catch(console.log)
            .then(() => {
                ask();
            })
    })
}

function ask() {
    inquirer.prompt(questions)
        .then((answers) => {
            if (answers.choice === 'View All Employees') {
                viewEmployees();
            }
            else if (answers.choice === 'Add Employee') {
                addEmployee();
            }
            else if (answers.choice === 'Update Employee Role') {
                updateEmployee();
            }
            else if (answers.choice === 'Update Employee Manager') {
                updateEmployeeManager();
            }
            else if (answers.choice === 'View All Roles') {
                viewRoles();
            }
            else if (answers.choice === 'Add Role') {
                addRole();
            }
            else if (answers.choice === 'View All Departments') {
                viewDepartments();
            }
            else if (answers.choice === 'Add Department') {
                addDepartment();
            }
            else if (answers.choice === 'Quit') {
                db.end();
            }

        })
}

function init() {
    // display welcome message
    let welcome_message = figlet.textSync("Employee Tracker");
    console.log(welcome_message);
    ask();
}

init();