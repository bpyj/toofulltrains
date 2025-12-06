// ---------------- CONFIG ----------------

// (Start, Target)
const LEVELS = [
  { start: 5, target: 3, message: "Take away 2 friends." },
  { start: 6, target: 4, message: "We can only carry 4!" },
  { start: 7, target: 5, message: "Too full! Let's only keep 5." },
  { start: 4, target: 2, message: "Only 2 passengers today." }
];

const ANIMAL_EMOJIS = ["🐶", "🐻", "🐰", "🦊", "🐷", "🐸", "🐨", "🐼"];

// ---------------- STATE ----------------

let currentLevelIndex = 0;
let currentLevel = null;
let remainingPassengers = 0;
let targetCount = 0;

// ---------------- DOM ----------------

const passengersContainer = document.getElementById("passengers-container");
const statusMessage = document.getElementById("status-message");
const removedCountDisplay = document.getElementById("removed-count");
const removedFriendsList = document.getElementById("removed-friends-list");
const nextLevelButton = document.getElementById("next-level-btn");

// If you added the optional 3-line status layout:
// Helpers to see if we have multi-line layout
const line1El = document.getElementById("line1");
const line2El = document.getElementById("line2");
const line3El = document.getElementById("line3");

function hasLines() {
  return line1El && line2El && line3El;
}

// ---------- TEXT HELPERS ----------

// Initial instructions for a level
function setInstructionText(start, target) {
  if (hasLines()) {
    line1El.textContent = `There are ${start} friends.`;
    line2El.textContent = `The train can only carry ${target}.`;
    line3El.textContent = `Tap the extra friends to help them off.`;
  } else {
    statusMessage.textContent =
      `There are ${start} friends. ` +
      `The train can only carry ${target}. ` +
      `Tap the extra friends to help them off.`;
  }
}

// Shown when the child gets it exactly right
function showSuccessText() {
  if (hasLines()) {
    line1El.textContent = "✅ Perfect!";
    line2El.textContent = `Now there are exactly ${targetCount} friends left.`;
    line3El.textContent = "All aboard! 🚂";
  } else {
    statusMessage.textContent =
      `✅ Perfect! Now there are exactly ${targetCount} friends left! All aboard! 🚂`;
  }
}

// Shown while still removing extras
function showProgressText() {
  if (hasLines()) {
    line1El.textContent = `${remainingPassengers} friends are still on the train.`;
    line2El.textContent = `We only want ${targetCount} friends to stay.`;
    line3El.textContent = "Tap another extra friend to help them hop off.";
  } else {
    statusMessage.textContent =
      `${remainingPassengers} left. Keep going! We need ${targetCount}.`;
  }
}

// Shown if they try to remove more after it's perfect
function showStopText() {
  if (hasLines()) {
    line1El.textContent = "🛑 Stop!";
    line2El.textContent = `We already have exactly ${targetCount} friends.`;
    line3El.textContent = "The train is ready to go!";
  } else {
    statusMessage.textContent =
      `🛑 Stop! We have exactly ${targetCount} friends. The train is ready!`;
  }
}

// When all levels are done
function showAllDone() {
  if (hasLines()) {
    line1El.textContent = "🎉 All done!";
    line2El.textContent = "You finished all the train challenges.";
    line3El.textContent = "Great job, little conductor!";
  } else {
    statusMessage.textContent =
      "🎉 You finished all the challenges! Great job, conductor!";
  }
  passengersContainer.innerHTML = "";
  removedCountDisplay.textContent = "0";
  removedFriendsList.innerHTML = "";
  nextLevelButton.style.display = "none";
}

// ---------------- GAME LOGIC ----------------

function startGame() {
  // If we've finished all levels, you can either stop…
  if (currentLevelIndex >= LEVELS.length) {
    showAllDone();
    return;
    // Or loop back to start by uncommenting the next line:
    // currentLevelIndex = 0;
  }

  currentLevel = LEVELS[currentLevelIndex];
  remainingPassengers = currentLevel.start;
  targetCount = currentLevel.target;

  // Reset UI
  passengersContainer.innerHTML = "";
  removedFriendsList.innerHTML = "";
  removedCountDisplay.textContent = "0";
  nextLevelButton.style.display = "none";

  // Show instructions
  setInstructionText(remainingPassengers, targetCount);

  // Build the passengers in the train car
  for (let i = 0; i < remainingPassengers; i++) {
    const passenger = document.createElement("div");
    passenger.className = "passenger";
    passenger.textContent = ANIMAL_EMOJIS[i % ANIMAL_EMOJIS.length];

    passenger.addEventListener("click", () => handlePassengerClick(passenger));

    passengersContainer.appendChild(passenger);
  }
}

function handlePassengerClick(passengerEl) {
  // Already removed? do nothing
  if (passengerEl.classList.contains("removed")) return;

  // If we still have more than the target, we can remove one
  if (remainingPassengers > targetCount) {
    passengerEl.classList.add("removed");
    passengerEl.style.transform = "translateY(40px)";
    passengerEl.style.opacity = "0.4";
    passengerEl.style.cursor = "default";

    remainingPassengers--;

    // Move emoji into the removed friends row
    if (removedFriendsList) {
      const ghost = document.createElement("span");
      ghost.className = "removed-friend-emoji";
      ghost.textContent = passengerEl.textContent;
      removedFriendsList.appendChild(ghost);
    }

    const removedCount = currentLevel.start - remainingPassengers;
    removedCountDisplay.textContent = String(removedCount);

    // Check win condition
    if (remainingPassengers === targetCount) {
      showSuccessText();
      currentLevelIndex++;
      setTimeout(() => {
        nextLevelButton.style.display = "block";
      }, 1500);
    } else {
      showProgressText();
    }
  } else if (remainingPassengers === targetCount) {
    // Already perfect – tell the toddler to stop
    showStopText();
  }
}

// ---------------- INIT ----------------

window.onload = startGame;
