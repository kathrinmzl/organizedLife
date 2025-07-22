// Wait for the DOM to finish loading before running the code
document.addEventListener("DOMContentLoaded", function () {

    // Get DOM Elements
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");

    // Add event listener to addButton to add a new task when the button is clicked
    addButton.addEventListener("click", addTask)




})

/**
 * Function that adds new task to the list
 */
function addTask(){
    // Get the value from the task input field and trim any white space
    const task = taskInput.value.trim();

    // If task has been entered create a new task list element and clear the input field
    if(task){
        createTaskElement(task);
        taskInput.value = "";
    } else {
        // If no task has been entered, alert the user to enter a task
        alert("Please enter a task!");
    }
}

/**
 * Function that creates a new task element for the list
 */
function createTaskElement(task){

    // Create new list item 
    const listItem = document.createElement("li");
    // Add task input content to list item
    listItem.textContent = task;
    // Append new list item to tasklist
    taskList.appendChild(listItem);

}