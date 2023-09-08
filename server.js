// packages needed for application
const inquirer = require('inquirer')
var figlet = require('figlet');

const db = require('./config/connection');

const helper = require('./helper.js');
const employee = require('./questions/employee_questions.js');
const department = require('./questions/department_questions.js');
const role = require('./questions/role_questions.js');

// create an array of questions for initial user prompts
const questions = [
    {
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View All Employees', 'View Employees by Manager', 'View Employees by Department', 'Add Employee', 'Update Employee Role', 'Update Employee Manager', 'Delete Employee', new inquirer.Separator(), 'View All Roles', 'Add Role', 'Delete Role', new inquirer.Separator(), 'View All Departments', 'View Department\'s Budget', 'Add Department', 'Delete Department', new inquirer.Separator(), 'Quit', new inquirer.Separator()],
        name: 'choice',
    }
];

// employee related functions
async function addEmployee() {
    const questions = await helper.add_questions();
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt(questions);

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

    const params = [first_name, last_name, role_id, manager_id];

    await db.query(sql, params);

    ask();
}
async function viewEmployees() {
    // manager id should return the first and last name of the manager
    const sql = `SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;

    const [rows] = await db.query(sql);
    console.log();
    console.table(rows);

    ask();
}
async function viewEmployeesByManager() {
    const questions = await employee.view_manager_questions();
    const { manager_id } = await inquirer.prompt(questions);

    const sql = `SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id where manager.id = ?`;

    const [rows] = await db.query(sql, manager_id);
    console.log();
    console.table(rows);

    ask();
}
async function viewEmployeesByDepartment() {
    const questions = await employee.view_department_questions();
    const { department_id } = await inquirer.prompt(questions);

    const sql = `SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id where department.id = ?`;

    const [rows] = await db.query(sql, department_id);

    console.log();
    console.table(rows);

    ask();
}
async function updateEmployeeRole() {
    const questions = await employee.update_role_questions();
    const { employee_id, role_id } = await inquirer.prompt(questions);

    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

    const params = [role_id, employee_id];

    await db.query(sql, params);

    ask();
}
async function updateEmployeeManager() {
    const questions = await employee.update_manager_questions();
    const { employee_id, manager_id } = await inquirer.prompt(questions);

    const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

    const params = [manager_id, employee_id];

    await db.query(sql, params);

    ask();
}
async function deleteEmployee() {
    const questions = await employee.delete_questions();
    const { employee_id } = await inquirer.prompt(questions);

    const sql = `DELETE FROM employee WHERE id = ?`;

    await db.query(sql, employee_id);

    ask();
}

// department related functions
async function viewDepartments() {
    const sql = `SELECT * FROM department`;

    const [rows] = await db.query(sql);

    console.log();
    console.table(rows);

    ask();
}
async function viewDepartmentsBudget() {
    const questions = await department.budget_questions();
    const { department_id } = await inquirer.prompt(questions);

    const sql = `SELECT department.name AS department, SUM(role.salary) as salary FROM employee JOIN role ON employee.role_id = role.id JOIN department  ON role.department_id = department.id WHERE department.id = ?`;

    const [rows] = await db.query(sql, department_id);

    console.log();
    console.table(rows);

    ask();

}
async function addDepartment() {
    const questions = await department.add_questions();
    const { department_name } = await inquirer.prompt(questions);

    const sql = `INSERT INTO department (name) VALUES (?)`;

    await db.query(sql, department_name);

    ask();
}
async function deleteDepartment() {
    const questions = await department.delete_questions();
    const { department_id } = await inquirer.prompt(questions);

    const sql = `DELETE FROM department WHERE id = ?`;

    await db.query(sql, department_id);

    ask();
}

// role related functions
async function viewRoles() {
    const sql = `SELECT role.id, title, department.name AS department, salary FROM role JOIN department ON role.department_id = department.id`;
    const [rows] = await db.query(sql);

    console.log();
    console.table(rows);

    ask();
}
async function addRole() {
    const questions = await role.add_questions();
    const { role_name, salary, department_id } = await inquirer.prompt(questions);

    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

    const params = [role_name, salary, department_id];

    await db.query(sql, params);

    ask();
}
async function deleteRole() {
    const questions = await role.delete_questions();
    const { role_id } = await inquirer.prompt(questions);

    const sql = `DELETE FROM role WHERE id = ?`;

    await db.query(sql, role_id);

    ask();
}

function ask() {
    inquirer.prompt(questions)
        .then((answers) => {
            if (answers.choice === 'View All Employees') {
                viewEmployees();
            }
            else if (answers.choice === 'View Employees by Manager') {
                viewEmployeesByManager();
            }
            else if (answers.choice === 'View Employees by Department') {
                viewEmployeesByDepartment();
            }
            else if (answers.choice === 'Add Employee') {
                addEmployee();
            }
            else if (answers.choice === 'Update Employee Role') {
                updateEmployeeRole();
            }
            else if (answers.choice === 'Update Employee Manager') {
                updateEmployeeManager();
            }
            else if (answers.choice === 'Delete Employee') {
                deleteEmployee();
            }
            else if (answers.choice === 'View All Roles') {
                viewRoles();
            }
            else if (answers.choice === 'Add Role') {
                addRole();
            }
            else if (answers.choice === 'Delete Role') {
                deleteRole();
            }
            else if (answers.choice === 'View All Departments') {
                viewDepartments();
            }
            else if (answers.choice === 'View Department\'s Budget') {
                viewDepartmentsBudget();
            }
            else if (answers.choice === 'Add Department') {
                addDepartment();
            }
            else if (answers.choice === 'Delete Department') {
                deleteDepartment();
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