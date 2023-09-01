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
    },
    console.log(`Connected to the books_db database.`)
);

// create an array of questions for initial user prompts
const questions = [
    {
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
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

function init() {
    inquirer.prompt(questions)
        .then((answers) => {
            if (answers.choice === 'View All Employees') {
            }
            else if (answers.choice === 'Add Employee') {
            }
            else if (answers.choice === 'Update Employee Role') {
            }
            else if (answers.choice === 'View All Roles') {
            }
            else if (answers.choice === 'Add Role') {
                inquirer.prompt(role_questions).then((answers) => {
                    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    const departmentId = {
                        Engineering: '1',
                        Finance: '2',
                        Legal: '3',
                        Sales: '4',
                        Service: '5'
                    }
                    const roleName = answers.role_name;
                    const salary = answers.salary;
                    const department = answers.department;

                    const params = [roleName, salary, departmentId[department]];

                    db.query(sql, params, (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log(result);
                    });
                })
                
            }
            else if (answers.choice === 'View All Departments') {
            }
            else if (answers.choice === 'Add Department') {

            }
            else if (answers.choice === 'Quit') {
            }
        })
}

init();