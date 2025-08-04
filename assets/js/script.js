/* jshint esversion: 11 */

// Get DOM Elements (define them globally so that they can be accessed by all functions and don't throw a warning/error in JSHint)
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const resetButton = document.getElementById("resetButton");
const scrollButton = document.getElementById("scrollButton");

// Get root variables from CSS script
const rootStyles = getComputedStyle(document.documentElement);

// Wait for the DOM to finish loading before running the code
document.addEventListener("DOMContentLoaded", function () {

    // Set the min attribute of the deadline input to "today" so that users cannot input a deadline from the past
    deadlineInput.min = new Date().toISOString().split("T")[0];

    // Add event listener to task input field to add a new task when pressing enter
    taskInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
            // Set cursor focus back on task input field
            taskInput.focus();
        }
    });

    // Add event listener to deadline input field to add a new task when pressing enter
    deadlineInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
            // Set cursor focus back on task input field
            taskInput.focus();
        }
    });

    // Add event listener to addButton to add a new task when the button is clicked
    addButton.addEventListener("click", function (e) {
        addTask();
        // Set cursor focus back on task input field
        taskInput.focus();
    });

    // Add event listener to resetButton to reset task list when the button is clicked
    resetButton.addEventListener("click", function (e) {
        resetTasks();
        // Set cursor focus back on task input field
        taskInput.focus();
    });

    // Load previous task list items
    loadTasks();

    // Add event listener to scrollButton so that it only appears when scrolling down
    window.addEventListener("scroll", scrollFunction);

    // Add event listener to scrollButton to scroll to top when clicked
    scrollButton.addEventListener("click", topFunction);

    // Set cursor focus on task input when page is refreshed/loaded
    taskInput.focus();
});

/**
 * Take the task and deadline input and add a new task to the task list or throw and alert, if no task and/or deadline input has been provided.
 */
function addTask() {
    // Get the value from the task input field and trim any white space
    const task = taskInput.value.trim();

    // Get the value from the deadline input field 
    const deadline = deadlineInput.value;

    // If task has been entered create a new task list element and clear the input fields
    if (task && deadline) {
        createTaskElement(task, deadline);
        taskInput.value = "";
        deadlineInput.value = "";
        // Save task to local storage
        saveTasks();
    } else if (task && !deadline) {
        // If no deadline has been entered, alert the user to enter a deadline
        alert("Please enter a deadline!");
    } else if (!task && deadline) {
        // If no task has been entered, alert the user to enter a task
        alert("Please enter a task!");
    } else {
        // If no deadline and no deadline have been entered, alert the user to enter a task and deadline
        alert("Please enter a task and a deadline!");
    }

    // Sort task list when adding a new task
    sortTasksByStatus();
}

/**
 * Create a new list item with a checkbox, the deadline, the task input and a delete icon as content and append it to the existing task list.
 * @param {*} task
 * @param {*} deadline
 * @param {*} status
 * @returns listItem
 */
function createTaskElement(task, deadline, status = "open") {
    // Create new list item
    const listItem = document.createElement("li");

    // Store status ("open"/"in-progress"/"done") as data attribute of the listItem
    listItem.dataset.status = status;

    // Store deadline as data attribute of the listItem
    listItem.dataset.deadline = deadline;

    // "Done" Checkbox ----------------------------------------------------- //
    // Create checkbox input field to mark a task as "done"
    const taskCheckbox = document.createElement("input");
    taskCheckbox.setAttribute("type", "checkbox");
    // Add title to the checkbox which shows when hovering over the checkbox
    taskCheckbox.setAttribute("title", "Mark task as done");
    taskCheckbox.setAttribute("aria-label", "Mark task as done");
    taskCheckbox.className = "taskCheckbox";

    // Set the checkbox to "checked" depending on the status (important for refreshing the page)
    taskCheckbox.checked = status === "done";

    // Add checkbox to list item
    listItem.appendChild(taskCheckbox);

    // Task text incl. deadline ------------------------------------------- //
    // Create deadline span
    const deadlineSpan = document.createElement("span");
    deadlineSpan.textContent = `${deadline}: `;
    deadlineSpan.className = "deadlineText";

    // Create span element with the deadline and task input text
    const taskSpan = document.createElement("span");
    taskSpan.textContent = task;
    taskSpan.className = "taskText";

    // deadline + task
    const deadlineTaskSpan = document.createElement("span");
    deadlineTaskSpan.className = "deadlineTaskText";
    deadlineTaskSpan.appendChild(deadlineSpan);
    deadlineTaskSpan.appendChild(taskSpan);

    // Apply styles depending on the status
    applyTaskStatusStyles(deadlineTaskSpan, status);

    // Add task input content to list item
    listItem.appendChild(deadlineTaskSpan);

    // Delete button ----------------------------------------------------- //
    // Add delete icon "X" to task element
    const deleteButton = document.createElement("i");
    deleteButton.className = "fas fa-times deleteTask";
    // Add title to the button which shows when hovering over the button
    deleteButton.setAttribute("title", "Delete task");
    deleteButton.setAttribute("aria-label", "Delete task");
    // Append delete button to list item
    listItem.appendChild(deleteButton);

    // Append new list item to tasklist ----------------------------------- //
    taskList.appendChild(listItem);

    // Event listeners ---------------------------------------------------- //
    // Add event listener for the checkbox to toggle the status between done and open/in-progress when the checkbox is clicked
    taskCheckbox.addEventListener("change", () => {
        // If checkbox is changed to "checked", change the status to "done", otherwise change it to "open"
        let newStatus;
        if (taskCheckbox.checked) {
            newStatus = "done";
        } else {
            newStatus = "open";
        }

        listItem.dataset.status = newStatus;

        // Apply styles depending on the status
        applyTaskStatusStyles(deadlineTaskSpan, newStatus);

        // Sort task list
        sortTasksByStatus();

        // Save the updated task list to the local storage
        saveTasks();

        // Adjust style for overdue tasks
        styleOverdueTasks(listItem, listItem.dataset.deadline, newStatus);
    });

    // Add event listener for the task text to toggle the status between open/in-progress when the text is clicked
    deadlineTaskSpan.addEventListener("click", () => {
        const currentStatus = listItem.dataset.status;
        if (["open", "in-progress"].includes(currentStatus)) {
            // Change status from open to in-progress and vice versa
            const newStatus = currentStatus === "open" ? "in-progress" : "open";
            listItem.dataset.status = newStatus;
            // Apply styles depending on the status
            applyTaskStatusStyles(deadlineTaskSpan, newStatus);

            // Sort task list
            sortTasksByStatus();

            // Save the updated task list to the local storage
            saveTasks();
        }
    });

    // Add event listener for delete button, so that the current task is deleted when the button is clicked
    deleteButton.addEventListener("click", () => {
        taskList.removeChild(listItem);

        // Save the updated task list to the local storage
        saveTasks();
    });

    // Adjust style for overdue tasks
    styleOverdueTasks(listItem, deadline, status);
}

/**
 * Save task list to local storage
 */
function saveTasks() {
    // Select all list elements from the task list and save their content in an array
    let taskArray = [];
    taskList.querySelectorAll("li").forEach((item) => {
        const text = item.querySelector(".taskText").textContent;
        const status = item.dataset.status;
        const deadline = item.dataset.deadline;
        taskArray.push({
            text,
            deadline,
            status,
        });
    });

    // Save taskArray to the local storage
    localStorage.setItem("tasks", JSON.stringify(taskArray));
}

/**
 * Load tasks from local storage so that the previously added tasks still show when the page is refreshed
 */
function loadTasks() {
    // Get tasks from local storage. If there are no previous tasks stored in the local storage, return an empty array
    const taskArray = JSON.parse(localStorage.getItem("tasks")) || [];
    // Create task elements for each stored task
    taskArray.forEach((task) => {
        createTaskElement(task.text, task.deadline, task.status);
    });
}

/**
 * Apply style of task text depending on the status
 * @param {*} span
 * @param {*} status
 */
function applyTaskStatusStyles(span, status) {
    // Remove prior status class
    span.classList.remove("open", "in-progress", "done");

    // Add class depending on status
    if (status === "open") {
        span.classList.add("open");
    } else if (status === "in-progress") {
        span.classList.add("in-progress");
    } else {
        span.classList.add("done");
    }
}

/**
 * Reset the task list to an empty list
 */
function resetTasks() {
    // Only attempt to reset the task list if there are any tasks
    if (localStorage.getItem("tasks") != "[]") {
        // Ask the user to confirm the reset
        const userConfirmed = confirm(
            "Are you sure you want to delete all tasks? This cannot be undone."
        );

        if (userConfirmed) {
            // localStorage.removeItem("tasks");
            localStorage.setItem("tasks", "[]");
            taskList.innerHTML = "";
        }
    }
}

// Explanation of sorting functionality: 
// https://www.freecodecamp.org/news/how-to-sort-array-of-objects-by-property-name-in-javascript/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
/**
 * Sort the task list by status and deadline, showing most urgent tasks first, and "done" always at the bottom of the list
 */
function sortTasksByStatus() {
    // Define a helper variable to set the right order for the status types
    const statusOrder = {
        "in-progress": 0,
        "open": 1,
        "done": 2
    };

    // Get task list items and store them as an array to be able to access "sort" function
    const taskArray = Array.from(taskList.querySelectorAll("li"));

    // Sorting algorithm
    // negative return value: a should come before b.
    // positive return value: a should come after b.
    const sorted = taskArray.sort((a, b) => {
        // Get the status and deadline per task
        const statusA = a.dataset.status;
        const statusB = b.dataset.status;
        // Transform deadline input to date format, so that it can be sorted
        const dateA = new Date(a.dataset.deadline);
        const dateB = new Date(b.dataset.deadline);

        // If one of the tasks is done and the other one isn't, put the "done" task at the end of the list, regardless of date
        if (statusA === "done" && statusB !== "done") return 1;
        if (statusA !== "done" && statusB === "done") return -1;

        // If both tasks are not "done", sort them by date
        const dateDiff = dateA - dateB;
        if (dateDiff !== 0) return dateDiff;

        // If both tasks have the same date, sort them by status ("in-progress" > "open")
        return statusOrder[statusA] - statusOrder[statusB];
    });

    // Clear the old tasklist and assign it the new sorted tasklist
    taskList.innerHTML = "";
    sorted.forEach((task) => taskList.appendChild(task));
}

/**
 * Change background color of overdue tasks, but only if they are not "done" yet
 * @param {*} listItem 
 * @param {*} deadline 
 * @param {*} status 
 */
function styleOverdueTasks(listItem, deadline, status) {
    // Get today's date and the deadline in the same format
    const today = new Date().setHours(0, 0, 0, 0);
    const taskDeadline = new Date(deadline).setHours(0, 0, 0, 0);

    // Change style only if task is overdue
    if (taskDeadline < today) {
        // If status is not done yet, set a different background color
        if (status != "done") {
            listItem.style.backgroundColor = rootStyles.getPropertyValue('--background-color-overdue').trim();
        } else {
            // If task is done yet, set normal background color
            listItem.style.backgroundColor = rootStyles.getPropertyValue('--background-color-primary').trim();
        }
    }
}

// Basic code of scroll-to-top functionality from:
// https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
/**
 * Show the scroll button when the user scrolls past the top of the task-input-section
 */
function scrollFunction() {
    const targetElement = document.getElementById("task-input-section");
    const targetOffsetTop = targetElement.offsetTop;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > targetOffsetTop) {
        scrollButton.style.display = "block";
    } else {
        scrollButton.style.display = "none";
    }
}

// Basic code of scroll-to-top functionality from:
// https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
/**
 * Scroll to the top of the task-input-section when the scrollButton is clicked
 */
function topFunction() {
    const target = document.getElementById("task-input-section");
    if (target) {
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}