// packages needed for application
const inquirer = require('inquirer')
// Import and require mysql2
const mysql = require('mysql2');

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

function viewRoles() {
    const sql = `SELECT * FROM role`;
    db.query(sql)
        .then(([rows, fields]) => {
            console.log();
            console.table(rows);
        })
        .catch(console.log)
        .then(() => {
            db.end();
            ask();
        });
}

async function getDepartmentId(department) {
    const result = await db.query(`SELECT id FROM department WHERE name = ?`, department);
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
                db.end();
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
            db.end();
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
                db.end();
                ask();
            })
    })
}

function ask() {
    inquirer.prompt(questions)
        .then((answers) => {
            if (answers.choice === 'View All Employees') {
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
            }

        })
}

function init() {
    let welcome_message = ` 
    _____                 _                         __  __                                   
   | ____|_ __ ___  _ __ | | ___  _   _  ___  ___  |  \\/  | __ _ _ __   __ _  __ _  ___ _ __ 
   |  _| | '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\ | |\\/| |/ _\` | '_ \\ / _\` |/ _\` |/ _ \\ '__|
   | |___| | | | | | |_) | | (_) | |_| |  __/  __/ | |  | | (_| | | | | (_| | (_| |  __/ |   
   |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___| |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|   
                   |_|            |___/                                      |___/           
   `;
    console.log(welcome_message);
    ask();
}

init();