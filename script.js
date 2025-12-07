// ---------------- CONFIG ----------------

// Each level only needs start and target now
const LEVELS = [
  { start: 5, target: 3 },
  { start: 6, target: 4 },
  { start: 7, target: 5 },
  { start: 4, target: 2 }
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
const trackContainer = document.getElementById("track-container");
const restartButton = document.getElementById("restart-btn");

// New:
const trainCarEl = document.getElementById("train-car");
const wheelsRowEl = document.getElementById("wheels-row");




// 3-line status layout
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

function launchParade() {
  if (!trackContainer) return;

  // Hide the original train car + wheels, but keep them in DOM
  if (trainCarEl) trainCarEl.style.visibility = "hidden";
  if (wheelsRowEl) wheelsRowEl.style.visibility = "hidden";

  // Remove any existing parade (defensive)
  const oldParade = trackContainer.querySelector(".parade-train");
  if (oldParade) oldParade.remove();

  // Build parade train wrapper
  const train = document.createElement("div");
  train.className = "parade-train";

  // Fewer cars if small screen
  const isMobile = window.innerWidth <= 480;
  const numCars = isMobile ? 3 : 5;
  const passengersPerCar = 3;
  let emojiIndex = 0;

  for (let c = 0; c < numCars; c++) {
    const wrapper = document.createElement("div");
    wrapper.className = "parade-car-wrapper";

    // --- CAR BODY ---
    const car = document.createElement("div");
    car.className = "parade-car";

    const row = document.createElement("div");
    row.className = "parade-passengers";

    for (let p = 0; p < passengersPerCar; p++) {
      const span = document.createElement("span");
      span.textContent = ANIMAL_EMOJIS[emojiIndex % ANIMAL_EMOJIS.length];
      emojiIndex++;
      row.appendChild(span);
    }

    car.appendChild(row);

    // --- WHEELS BELOW CAR ---
    const wheelsRow = document.createElement("div");
    wheelsRow.className = "parade-wheels";

    for (let w = 0; w < 2; w++) {
      const wheel = document.createElement("div");
      wheel.className = "parade-wheel";
      wheelsRow.appendChild(wheel);
    }

    wrapper.appendChild(car);
    wrapper.appendChild(wheelsRow);

    train.appendChild(wrapper);
  }

  trackContainer.appendChild(train);
}



// When all levels are done
function showAllDone() {
  if (hasLines()) {
    line1El.textContent = "🎉 All done!";
    line2El.textContent = "All cars hooked up and ready to go!";
    line3El.textContent = "Great job, conductor!";
  } else {
    statusMessage.textContent =
      "🎉 All cars hooked up and ready to go! Great job, conductor!";
  }
  passengersContainer.innerHTML = "";
  removedCountDisplay.textContent = "0";
  removedFriendsList.innerHTML = "";
  nextLevelButton.style.display = "none";

  // 🚂 Launch the final reward animation
  launchParade();
  restartButton.style.display = "block";   // 👈 show restart button

}



// ---------------- GAME LOGIC ----------------

function startGame() {
  // If we've finished all levels, stop or loop
  if (currentLevelIndex >= LEVELS.length) {
    showAllDone();
    return;
    // Or loop back to start:
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
      }, 500);
    } else {
      showProgressText();
    }
  } else if (remainingPassengers === targetCount) {
    // Already perfect – tell the toddler to stop
    showStopText();
  }
}

// ---------------- INIT ----------------

restartButton.addEventListener("click", () => {
  // Reset level index
  currentLevelIndex = 0;

  // Remove parade if present
  const parade = trackContainer.querySelector(".parade-train");
  if (parade) parade.remove();

  // Show original train car + wheels again
  if (trainCarEl) trainCarEl.style.visibility = "visible";
  if (wheelsRowEl) wheelsRowEl.style.visibility = "visible";

  // Hide restart button + clear status
  restartButton.style.display = "none";
  nextLevelButton.style.display = "none";

  // Start from first level again
  startGame();
});



window.onload = startGame;


