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

// create an array of questions for initial user prompts
const questions = [
    {
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', new inquirer.Separator(), 'View All Roles', 'Add Role', new inquirer.Separator(), 'View All Departments', 'Add Department', new inquirer.Separator(), 'Quit', new inquirer.Separator()],
        name: 'choice'
    }
];

const department_questions = [
    {
        message: 'What is the name of the department?', type: 'input', name: 'department'
    }
];

const role_questions = [
    {
        message: 'What is the name of the role?', type: 'input', name: 'role_name'
    },
    {
        message: 'What is the salary of the role?', type: 'input', name: 'salary'
    },
    {
        message: 'What department does the role belong to?',
        type: 'list',
        choices: ['Engineering', 'Finance', 'Legal', 'Sales', 'Service'],
        name: 'department'
    }
];

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

async function getDepartmentId(department) {
    const sql = `SELECT id FROM department WHERE name = ?`;
    const result = await db.query(sql, department);
    return result[0][0].id;
}

function addRole() {
    inquirer.prompt(role_questions).then(async (answers) => {
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
    inquirer.prompt(department_questions).then((answers) => {
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
            }
            else if (answers.choice === 'Update Employee Role') {
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
    let welcome_message = figlet.textSync("Employee Tracker");

    console.log(welcome_message);
    ask();
}

init();