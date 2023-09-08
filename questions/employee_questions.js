const helper = require('../helper.js');

// questions for employee
async function add_questions() {
    const roleChoices = await helper.getRoles();
    const employeeChoices = await helper.getEmployees();

    return [
        {
            message: 'What is the employee\'s first name?', type: 'input', name: 'first_name'
        },
        {
            message: 'What is the employee\'s last name?', type: 'input', name: 'last_name'
        },
        {
            message: 'What is the employee\'s role?',
            type: 'list',
            choices: roleChoices,
            name: 'role_id',
            loop: false
        },
        {
            message: 'Who is the employee\'s manager?',
            type: 'list',
            choices: employeeChoices,
            name: 'manager_id',
            loop: false
        }
    ];
}
async function update_role_questions() {
    const employeeChoices = await helper.getEmployees();
    const rolechoices = await helper.getRoles();

    return [
        {
            message: 'Who\'s role would you like to update?',
            type: 'list',
            choices: employeeChoices,
            name: 'employee_id',
            loop: false
        },
        {
            message: 'Which role do you want to assign the selected employee?',
            type: 'list',
            choices: rolechoices,
            name: 'role_id',
            loop: false
        }
    ]
};
async function update_manager_questions() {
    const employeeChoices = await helper.getEmployees();

    return [
        {
            message: 'Who\'s role would you like to update?',
            type: 'list',
            choices: employeeChoices,
            name: 'employee_id',
            loop: false
        },
        {
            message: 'Which manager do you want to assign the selected employee?',
            type: 'list',
            choices: ({ employee_id }) => {
                return employeeChoices.filter(({ value }) => {
                    return value !== employee_id
                })
            },
            name: 'manager_id',
            loop: false
        }
    ]
};
async function view_manager_questions() {
    const employeeChoices = await helper.getEmployees();

    return [
        {
            message: 'Which manager\'s employees would you like to view?',
            type: 'list',
            choices: employeeChoices,
            name: 'manager_id',
            loop: false
        },
    ]
};
async function view_department_questions() {
    const departmentChoices = await helper.getDepartments();

    return [
        {
            message: 'Which department\'s employees would you like to view?',
            type: 'list',
            choices: departmentChoices,
            name: 'department_id',
            loop: false
        },
    ]
};
async function delete_questions() {
    const employeeChoices = await helper.getEmployees();

    return [
        {
            message: 'Which employee would you like to delete?',
            type: 'list',
            choices: employeeChoices,
            name: 'employee_id',
            loop: false
        },
    ]
};

module.exports = { add_questions, update_role_questions, update_manager_questions, view_manager_questions, view_department_questions, delete_questions }