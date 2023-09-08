const helper = require('../helper.js');

// questions for department
function add_questions() {
    return [
        {
            message: 'What is the name of the department?', type: 'input', name: 'department_name'
        }
    ]
};
async function delete_questions() {
    const departmentChoices = await helper.getDepartments();

    return [
        {
            message: 'Which department would you like to delete?',
            type: 'list',
            choices: departmentChoices,
            name: 'department_id',
            loop: false
        },
    ]
};
async function budget_questions() {
    const departmentChoices = await helper.getDepartments();

    return [
        {
            message: 'Which department\'s budget would you like to view?',
            type: 'list',
            choices: departmentChoices,
            name: 'department_id',
            loop: false
        },
    ]
};

module.exports = { add_questions, delete_questions, budget_questions }