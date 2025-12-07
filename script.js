// ---------------- CONFIG ----------------

// How many random levels per run
const NUM_LEVELS = 4;

// Filled at runtime with objects: { start, target }
let LEVELS = [];

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
const trainCarEl = document.getElementById("train-car");
const wheelsRowEl = document.getElementById("wheels-row");

// 3-line status layout
const line1El = document.getElementById("line1");
const line2El = document.getElementById("line2");
const line3El = document.getElementById("line3");

function hasLines() {
  return line1El && line2El && line3El;
}

// ---------------- LEVEL GENERATION ----------------

function generateLevels() {
  LEVELS = [];
  const usedPairs = new Set();

  while (LEVELS.length < NUM_LEVELS) {

    // start: 2 to 10
    const start = Math.floor(Math.random() * 9) + 2; // 2..10

    // target:
    // must be at least 2
    // never equal to start
    // must satisfy subtract ≤ 3 → target ≥ start - 3
    const minTarget = Math.max(2, start - 3);
    const maxTarget = start - 1;

    // If start = 2 or 3, this prevents invalid ranges
    if (minTarget > maxTarget) continue;

    const target =
      Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;

    const key = `${start}-${target}`;
    if (usedPairs.has(key)) continue;

    usedPairs.add(key);
    LEVELS.push({ start, target });
  }
}


// ---------------- TEXT HELPERS ----------------

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

// ---------------- VICTORY PARADE ----------------

function launchParade() {
  if (!trackContainer) return;

  // Hide original train car + wheels, keep them in DOM
  if (trainCarEl) trainCarEl.style.visibility = "hidden";
  if (wheelsRowEl) wheelsRowEl.style.visibility = "hidden";

  // Remove any existing parade
  const oldParade = trackContainer.querySelector(".parade-train");
  if (oldParade) oldParade.remove();

  const train = document.createElement("div");
  train.className = "parade-train";

  const isMobile = window.innerWidth <= 480;
  const numCars = isMobile ? 3 : 5;
  const passengersPerCar = 3;
  let emojiIndex = 0;

  for (let c = 0; c < numCars; c++) {
    const wrapper = document.createElement("div");
    wrapper.className = "parade-car-wrapper";

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

// ---------------- END-OF-GAME ----------------

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

  launchParade();
  restartButton.style.display = "block";
}

// ---------------- GAME LOGIC ----------------

function startGame() {
  if (currentLevelIndex >= LEVELS.length) {
    showAllDone();
    return;
  }

  currentLevel = LEVELS[currentLevelIndex];
  remainingPassengers = currentLevel.start;
  targetCount = currentLevel.target;

  passengersContainer.innerHTML = "";
  removedFriendsList.innerHTML = "";
  removedCountDisplay.textContent = "0";
  nextLevelButton.style.display = "none";

  setInstructionText(remainingPassengers, targetCount);

  for (let i = 0; i < remainingPassengers; i++) {
    const passenger = document.createElement("div");
    passenger.className = "passenger";
    passenger.textContent = ANIMAL_EMOJIS[i % ANIMAL_EMOJIS.length];

    passenger.addEventListener("click", () => handlePassengerClick(passenger));
    passengersContainer.appendChild(passenger);
  }
}

function handlePassengerClick(passengerEl) {
  if (passengerEl.classList.contains("removed")) return;

  if (remainingPassengers > targetCount) {
    passengerEl.classList.add("removed");
    passengerEl.style.transform = "translateY(40px)";
    passengerEl.style.opacity = "0.4";
    passengerEl.style.cursor = "default";

    remainingPassengers--;

    if (removedFriendsList) {
      const ghost = document.createElement("span");
      ghost.className = "removed-friend-emoji";
      ghost.textContent = passengerEl.textContent;
      removedFriendsList.appendChild(ghost);
    }

    const removedCount = currentLevel.start - remainingPassengers;
    removedCountDisplay.textContent = String(removedCount);

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
    showStopText();
  }
}

// ---------------- RESTART HANDLER ----------------

restartButton.addEventListener("click", () => {
  // New random levels each time you restart
  generateLevels();
  currentLevelIndex = 0;

  const parade = trackContainer.querySelector(".parade-train");
  if (parade) parade.remove();

  if (trainCarEl) trainCarEl.style.visibility = "visible";
  if (wheelsRowEl) wheelsRowEl.style.visibility = "visible";

  restartButton.style.display = "none";
  nextLevelButton.style.display = "none";

  startGame();
});

// ---------------- INIT ----------------

window.onload = () => {
  generateLevels();
  currentLevelIndex = 0;
  startGame();
};
