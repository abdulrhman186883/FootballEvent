// Database.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBY9dP3a-fX81J2cy_JrVZ-YuZSzK1I5oo",
  authDomain: "football-weimar.firebaseapp.com",
  databaseURL:
    "https://football-weimar-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "football-weimar",
  storageBucket: "football-weimar.appspot.com",
  messagingSenderId: "1003972364967",
  appId: "1:1003972364967:web:5df44983ff987c6e56e982",
  measurementId: "G-DBRZLDNC7D",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Function to display events with modify, delete, join, and view participants options
function displayEvents(events) {
  const eventDisplay = document.getElementById("eventDisplay");
  eventDisplay.innerHTML = ""; // Clear previous content

  events.forEach((event) => {
    const eventDiv = document.createElement("div");
    const formattedTime = new Date(event.time).toLocaleString(); // Format the time
    eventDiv.id = event.key; // Set a unique ID for each event div
    eventDiv.innerHTML = `
    <hr>
    <div class= "match_container">
      <p><strong>Football Match Available </strong></p>
      <p><strong>Location:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank">${event.location}</a></p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Creator:</strong> ${event.creator}</p>
      <p><strong>Participants:</strong> <span id="participantsCount-${event.key}">0</span></p>
      <button class="join-button" data-key="${event.key}">Join</button>
      <button class="view-participants-button" data-key="${event.key}">View Participants</button>
      <button class="modify-button" data-key="${event.key}">Event Modify</button>
      <button style="background-color: red;" class="delete-button" data-key="${event.key}">Delete Event</Ev></button>

      <hr>
    </div>
  `;
    eventDisplay.appendChild(eventDiv);
    updateParticipantsCount(event.key); // Update participants count initially
  });

  // Add event listener for the dynamically created buttons
  eventDisplay.addEventListener("click", function (e) {
    if (e.target.classList.contains("join-button")) {
      const key = e.target.dataset.key;
      joinEvent(key);
    } else if (e.target.classList.contains("view-participants-button")) {
      const key = e.target.dataset.key;
      viewParticipants(key);
    } else if (e.target.classList.contains("modify-button")) {
      const key = e.target.dataset.key;
      // Call modifyEvent function with the key and other parameters
      modifyEvent(key /* other parameters as needed */);
    } else if (e.target.classList.contains("delete-button")) {
      const key = e.target.dataset.key;
      // Call deleteEvent function with the key
      deleteEvent(key);
    }
  });
}

// Function to fetch events from Firebase and display them
export function fetchAndDisplayEvents() {
  const eventsRef = ref(db, "events");

  onValue(eventsRef, (snapshot) => {
    const eventsData = snapshot.val();
    if (eventsData) {
      const eventsArray = Object.entries(eventsData).map(([key, value]) => ({
        key,
        ...value,
      }));
      displayEvents(eventsArray);
    }
  });
}

function closeModal() {
  const modal = document.getElementById("eventModal");
  modal.style.display = "none";
}

// Function to submit events to Firebase
export function handleFirebaseSubmit() {
  document.getElementById("submit").addEventListener("click", function (e) {
    e.preventDefault();

    // Get the input values from the form
    const location = document.getElementById("location").value;
    const time = document.getElementById("time").value;
    const creator = document.getElementById("creator").value;

    // Check if any value is empty
    if (location === "" || time === "" || creator === "") {
      alert("Please fill in all the fields before submitting.");
      return; // Exit the function if any value is empty
    }

    // Store event details in Firebase
    const eventsRef = ref(db, "events");
    const newEventRef = push(eventsRef, {
      location: location,
      time: time,
      creator: creator,
    });

    // Add a participants node to the new event
    const participantsRef = ref(db, `events/${newEventRef.key}/participants`);
    set(participantsRef, {}); // Initialize participants as an empty object

    // Reset input values to null
    document.getElementById("location").value = "";
    document.getElementById("time").value = "";
    document.getElementById("creator").value = "";

    // Fetch and display updated events
    fetchAndDisplayEvents();

    // Close the modal after successfully adding data
    closeModal();
  });
}

// Function to delete an event from Firebase
export function deleteEvent(key) {
  // Use SweetAlert2 to confirm the deletion
  Swal.fire({
    title: "Delete Event",
    text: "Are you sure you want to delete this event?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // User confirmed, proceed with deletion
      const eventRef = ref(db, `events/${key}`);
      remove(eventRef)
        .then(() => {
          console.log("Event deleted successfully");
          // Optionally, you can remove the HTML element from the UI as well
          const eventDiv = document.getElementById(key);
          if (eventDiv) {
            eventDiv.remove();
          }
        })
        .catch((error) => {
          console.error("Error deleting event: ", error);
        });
    }
  });
}

// Function to modify an event in Firebase
export function modifyEvent(key, location, time, creator) {
  // Use SweetAlert2 to display a custom modification form
  Swal.fire({
    title: "Modify Event",
    html: `<input id="swal-input1" class="swal2-input" placeholder="New Name" value="">
      <input id="swal-input2" class="swal2-input" placeholder="New Location" value="">
      <p style = "color: black;"> Date </p>
      <input
        type="datetime-local"
        id="swal-input3" class="swal2-input"
        placeholder="New Date"
        name="time"
        required
        value="New Date"
        min="<?php echo date('Y-m-d\TH:i'); ?>"
       />`,

    focusConfirm: false,
    preConfirm: () => {
      // Retrieve the entered values
      const newName = document.getElementById("swal-input1").value;
      const newLocation = document.getElementById("swal-input2").value;
      const newTime = document.getElementById("swal-input3").value;

      return { newName, newLocation, newTime };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const { newName, newLocation, newTime } = result.value;

      // Check if all three fields are empty
      if (newName === "" && newLocation === "" && newTime === "") {
        // Use SweetAlert2 to display an error modal
        Swal.fire({
          title: "Error",
          text: "Please fill in at least one field.",
          icon: "error",
        });
        return; // Exit the function if all three fields are empty
      }

      // Check if any modification was made
      if (newName !== creator || newLocation !== location || newTime !== time) {
        const updatedData = {};
        if (newName !== creator) {
          updatedData.creator = newName;
        }
        if (newLocation !== location) {
          updatedData.location = newLocation;
        }
        if (newTime !== time) {
          updatedData.time = newTime;
        }

        // Update the event in Firebase
        const eventRef = ref(db, `events/${key}`);
        set(eventRef, updatedData).then(() => {
          // Use SweetAlert2 to display a success modal
          Swal.fire({
            title: "Event Modified",
            text: "Event modified successfully.",
            icon: "success",
          });

          // Optionally, you can update the HTML element in the UI as well
          const eventDiv = document.getElementById(key);
          if (eventDiv) {
            const nameElement = eventDiv.querySelector(
              "p strong:contains('Creator:')",
            );
            const locationElement = eventDiv.querySelector(
              "p strong:contains('Location:')",
            );
            const timeElement = eventDiv.querySelector(
              "p strong:contains('Time:')",
            );

            if (newName !== creator) {
              nameElement.nextElementSibling.textContent = ` ${newName}`;
            }
            if (newLocation !== location) {
              locationElement.nextElementSibling.textContent = ` ${newLocation}`;
            }
            if (newTime !== time) {
              timeElement.nextElementSibling.textContent = ` ${newTime}`;
            }
          }

          // Reinitialize Autocomplete after modifying the content
          initializeAutocomplete();
        });
      } else {
        // Use SweetAlert2 to display a warning modal if no changes were made
        Swal.fire({
          title: "Warning",
          text: "No changes were made.",
          icon: "warning",
        });
      }
    }
  });
}

// Function to join an event in Firebase
export function joinEvent(key) {
  // Use SweetAlert2 to display a custom input form
  Swal.fire({
    title: "Join Event",
    html: '<input id="swal-input1" class="swal2-input" placeholder="Enter your name">',
    focusConfirm: false,
    preConfirm: () => {
      // Retrieve the entered name
      return document.getElementById("swal-input1").value;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const name = result.value;
      // Check if the user entered a name
      if (name.trim() !== "") {
        const participantsRef = ref(db, `events/${key}/participants`);
        push(participantsRef, { name })
          .then(() => {
            // Use SweetAlert2 to display a success modal
            Swal.fire({
              title: "Joined Event",
              text: "Joined event successfully.",
              icon: "success",
            });
            console.log("Joined event successfully");
            updateParticipantsCount(key);
          })
          .catch((error) => {
            // Use SweetAlert2 to display an error modal
            Swal.fire({
              title: "Error",
              text: "Error joining event.",
              icon: "error",
            });
            console.error("Error joining event: ", error);
          });
      } else {
        // Use SweetAlert2 to display a warning modal for empty name
        Swal.fire({
          title: "Warning",
          text: "Please enter a valid name.",
          icon: "warning",
        });
      }
    }
  });
}
export function viewParticipants(key) {
  const participantsRef = ref(db, `events/${key}/participants`);
  onValue(participantsRef, (snapshot) => {
    const participantsData = snapshot.val();
    if (participantsData) {
      const participantsArray = Object.values(participantsData);

      // Use SweetAlert2 to display a modal with participants
      Swal.fire({
        title: "Participants",
        html: `Participants: ${participantsArray.map((participant) => participant.name).join(", ")}`,
      });
    } else {
      // Use SweetAlert2 to display a modal if no participants
      Swal.fire({
        title: "No Participants",
        text: "No participants yet.",
        icon: "info",
      });
    }
  });
}

// Function to update and display participants count
function updateParticipantsCount(key) {
  const participantsRef = ref(db, `events/${key}/participants`);
  onValue(participantsRef, (snapshot) => {
    const participantsData = snapshot.val();
    const count = participantsData ? Object.keys(participantsData).length : 0;
    document.getElementById(`participantsCount-${key}`).textContent = count;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  handleFirebaseSubmit();
  fetchAndDisplayEvents();
  initializeAutocomplete(); // Call this function to initialize Autocomplete
});

// Function to initialize Google Places Autocomplete
function initializeAutocomplete() {
  const locationInput = document.getElementById("location");
  const autocomplete = new google.maps.places.Autocomplete(locationInput, {
    componentRestrictions: { country: "DE" }, // Restrict to Germany (DE)
  });
}
