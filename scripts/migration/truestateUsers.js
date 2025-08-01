import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mapTaskName } from './taskNames.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const oldUsersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../exports/old-user-data.json'), 'utf8'));

// Migration functions
function generateNewUserId(index) {
    return `user${String(index + 1).padStart(3, '0')}`;
}

function generateNewTaskId(index) {
    return `task${String(index + 1).padStart(3, '0')}`;
}





function migrateUsers() {
    const migratedUsers = [];
    const extractedTasks = [];
    let taskCounter = 0;

    oldUsersData.forEach((user, userIndex) => {
        const newUserId = generateNewUserId(userIndex);
        
        // Create migrated user without tasks
        const migratedUser = {
            ...user,
            id: newUserId,
            userId: newUserId
        };
        
        // Remove tasks from user object
        delete migratedUser.tasks;
        
        // Extract and migrate tasks
        if (user.tasks && Array.isArray(user.tasks)) {
            user.tasks.forEach(task => {
                const newTaskId = generateNewTaskId(taskCounter);
                const migratedTask = {
                    ...task,
                    actionType: task.actionType ? (task.actionType).toLowerCase() : 'call',
                    agentId: 'TRUES03',
                    agentName: 'amit',
                    taskId: newTaskId,
                    userId: newUserId,
                    userName: user.name,
                    phoneNumber: user.phonenumber,
                    tag: (user.tag).toLowerCase(),
                    taskName: mapTaskName(task.taskName),
                    createdTimestamp: task.timestamp,
                    documents: [],
                };

                if(migratedTask.type == "Vault") {
                    migratedTask.taskType = "vault-service"
                }
                
                delete migratedTask.type;
                delete migratedTask.id;
                delete migratedTask.objectID;
                delete migratedTask.name;
                delete migratedTask.phonenumber;
                
                extractedTasks.push(migratedTask);
                taskCounter++;
            });
        }
        
        migratedUsers.push(migratedUser);
    });

    return { migratedUsers, extractedTasks };
}

// Perform migration
console.log('Starting migration...');
const { migratedUsers, extractedTasks } = migrateUsers();

// Save migrated data
const outputDir = path.join(__dirname, '../../exports');

fs.writeFileSync(
    path.join(outputDir, 'migrated-users-data.json'), 
    JSON.stringify(migratedUsers, null, 2)
);

fs.writeFileSync(
    path.join(outputDir, 'migrated-tasks-data.json'), 
    JSON.stringify(extractedTasks, null, 2)
);

console.log(`Migration completed!`);
console.log(`- Migrated ${migratedUsers.length} users`);
console.log(`- Extracted ${extractedTasks.length} tasks`);
console.log('Files created:');
console.log('- exports/migrated-users-data.json');
console.log('- exports/migrated-tasks-data.json');