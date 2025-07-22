// Wait for the DOM to finish loading before running the code
document.addEventListener("DOMContentLoaded", function () {

    // Get DOM Elements
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");
    
    // Load previous task list items
    loadTasks();

    // Add event listener to addButton to add a new task when the button is clicked
    addButton.addEventListener("click", addTask)




})

/**
 * Take the task input and add a new task to the task list or throw and alert, if no task input has been provided.
 */
function addTask(){
    // Get the value from the task input field and trim any white space
    const task = taskInput.value.trim();

    // If task has been entered create a new task list element and clear the input field
    if(task){
        createTaskElement(task);
        taskInput.value = "";
        // Save task to local storage
        saveTasks();
    } else {
        // If no task has been entered, alert the user to enter a task
        alert("Please enter a task!");
    }
}

/**
 * Create a new list item with the task input as content and append it to the existing task list.
 */
function createTaskElement(task){
    // Create new list item 
    const listItem = document.createElement("li");
    // Add task input content to list item
    listItem.textContent = task;

    // Add delete button to task element
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    // Add styles to delete button
    deleteButton.className = "deleteTask";
    // Append delete button to list item
    listItem.appendChild(deleteButton);

    // Append new list item to tasklist
    taskList.appendChild(listItem);

    // Add event listener for delete button, so that the current task is deleted when the button is clicked
    deleteButton.addEventListener("click", function(){
        taskList.removeChild(listItem);
        // Save the updated task list to the local storage
        saveTasks();
    })
}

/**
 * Save task list to local storage
 */
function saveTasks(){
    // Select all list elements from the task list and save their content in an array
    // Text content from the delete button gets saved as well, so it gets replaced with ""
    let taskArray = [];
    taskList.querySelectorAll("li").forEach((item) => {
        taskArray.push(item.textContent.replace("Delete", "").trim());
    });

    // Save taskArray to the local storage
    localStorage.setItem("tasks", JSON.stringify(taskArray));
}

/**
 * Load tasks from local storage so that the previously added tasks still show when the page is refreshed
 */
function loadTasks(){
    // Get tasks from local storage. If there are no previous tasks stored in the local storage, return an empty array
    const taskArray = JSON.parse(localStorage.getItem("tasks")) || [];
    // Create task elements for each stored task
    taskArray.forEach(createTaskElement);
}