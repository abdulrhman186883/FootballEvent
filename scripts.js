// scripts.js

function handleCreateEvent() {
  // You can replace the alert with your actual event creation code
  openModal(); // Open the modal after creating the event
  displayEvent(); // Display the created event
}

function openModal() {
  document.getElementById("eventModal").style.display = "block";
}

function closeModal() {
  document.getElementById("eventModal").style.display = "none";
}

function submitEvent(event) {
  // Prevent the default form submission
  event.preventDefault();

  closeModal();
  displayEvent(); // Display the created event
  // You can replace the alert with your actual submission code
}

function formatDateTime() {
  const dateTimeInput = document.getElementById("time");
  const rawDateTime = dateTimeInput.value;

  // Parse the rawDateTime to a Date object
  const parsedDateTime = new Date(rawDateTime);

  // Format the date and time
  const formattedDate = `${parsedDateTime.getFullYear()}-${(
    parsedDateTime.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${parsedDateTime.getDate().toString().padStart(2, "0")}`;
  const formattedTime = `Time: ${parsedDateTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${parsedDateTime
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Set the formatted value back to the input
  dateTimeInput.value = `${formattedDate} ${formattedTime}`;
}
