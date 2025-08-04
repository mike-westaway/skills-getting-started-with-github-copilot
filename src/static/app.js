document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", handleSignup);
});

async function loadActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();

    displayActivities(activities);
    populateActivityDropdown(activities);
  } catch (error) {
    console.error("Error loading activities:", error);
    document.getElementById("activities-list").innerHTML =
      "<p>Error loading activities. Please try again later.</p>";
  }
}

function displayActivities(activities) {
  const activitiesList = document.getElementById("activities-list");
  activitiesList.innerHTML = "";

  for (const [name, details] of Object.entries(activities)) {
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";

    const participantsList = details.participants
      .map((email) => `<li>${email}</li>`)
      .join("");
    const participantsSection =
      details.participants.length > 0
        ? `<div class="participants-section">
                <h5>Current Participants (${details.participants.length}/${details.max_participants}):</h5>
                <ul class="participants-list">${participantsList}</ul>
               </div>`
        : `<div class="participants-section">
                <h5>Participants (0/${details.max_participants}):</h5>
                <p class="no-participants">No participants yet - be the first to join!</p>
               </div>`;

    activityCard.innerHTML = `
            <h4>${name}</h4>
            <p><strong>Description:</strong> ${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants} students</p>
            ${participantsSection}
        `;

    activitiesList.appendChild(activityCard);
  }
}

function populateActivityDropdown(activities) {
  const activitySelect = document.getElementById("activity");
  activitySelect.innerHTML = "<option value=''>-- Select an activity --</option>";

  for (const name of Object.keys(activities)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    activitySelect.appendChild(option);
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const activity = document.getElementById("activity").value;
  const messageDiv = document.getElementById("message");

  if (!email || !activity) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(email)}`,
      }
    );

    if (response.ok) {
      showMessage(`Successfully signed up for ${activity}!`, "success");
      document.getElementById("signup-form").reset();
      loadActivities(); // Refresh the activities list
    } else {
      const error = await response.json();
      showMessage(
        error.detail || "Signup failed. Please try again.",
        "error"
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    showMessage("Network error. Please try again.", "error");
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove("hidden");

  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}
