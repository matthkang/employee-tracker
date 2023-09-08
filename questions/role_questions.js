const helper = require('../helper.js');

// questions for role
async function add_questions() {
    const departmentChoices = await helper.getDepartments();

    return [
        {
            message: 'What is the name of the role?', type: 'input', name: 'role_name'
        },
        {
            message: 'What is the salary of the role?', type: 'input', name: 'salary'
        },
        {
            message: 'What department does the role belong to?',
            type: 'list',
            choices: departmentChoices,
            name: 'department_id',
            loop: false
        }
    ]
};
async function delete_questions() {
    const roleChoices = await helper.getRoles();

    return [
        {
            message: 'Which role would you like to delete?',
            type: 'list',
            choices: roleChoices,
            name: 'role_id',
            loop: false
        },
    ]
};

module.exports = { add_questions, delete_questions }