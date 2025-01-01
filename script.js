// script.js

// 1) Clear sessionStorage on every page load to always start fresh
window.addEventListener("load", () => {
  sessionStorage.clear();
});

// ===== DOM ELEMENTS =====
const newThoughtInput = document.getElementById("newThought");
const submitThoughtBtn = document.getElementById("submitThoughtBtn");

const resetSection = document.getElementById("reset-section");
const currentThoughtDisplay = document.getElementById("currentThoughtDisplay");
const newResetPhraseInput = document.getElementById("newResetPhrase");
const addResetPhraseBtn = document.getElementById("addResetPhraseBtn");

const thoughtList = document.getElementById("thoughtList");
const exportBtn = document.getElementById("exportBtn");

// ===== GLOBAL STATE (SESSION STORAGE KEY) =====
const STORAGE_KEY = "clearmindloopData";
let thoughtsData = loadData(); // Load from sessionStorage (will be empty due to the clear on load)

// ===== EVENT LISTENERS =====
submitThoughtBtn.addEventListener("click", handleNewThought);
addResetPhraseBtn.addEventListener("click", handleNewResetPhrase);
exportBtn.addEventListener("click", exportDataAsTxt);

// ===== INITIAL RENDER =====
renderThoughts();

// ------------------------------------
//             FUNCTIONS
// ------------------------------------

// Load data from sessionStorage or return an empty array
function loadData() {
  const json = sessionStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

// Save data back to sessionStorage
function saveData() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(thoughtsData));
}

// Handle submission of a new thought
function handleNewThought() {
  const text = newThoughtInput.value.trim();
  if (!text) {
    alert("Please enter at least one character for your thought.");
    return;
  }

  // Create a new thought object
  const newThought = {
    id: Date.now().toString(),
    text,
    resetPhrases: [],
  };

  // Insert at the beginning of the array
  thoughtsData.unshift(newThought);
  saveData();

  // Clear the input
  newThoughtInput.value = "";

  // Show reset phrase section
  showResetSection(newThought);

  // Re-render the list
  renderThoughts();
}

// Display the reset phrase creation UI
function showResetSection(thought) {
  currentThoughtDisplay.textContent = `Thought: "${thought.text}"`;
  resetSection.classList.remove("hidden");

  // Temporarily store the thought ID so we know where to attach the new reset phrase
  resetSection.dataset.thoughtId = thought.id;
  newResetPhraseInput.value = "";
  newResetPhraseInput.focus();
}

// Handle adding a reset phrase
function handleNewResetPhrase() {
  const phrase = newResetPhraseInput.value.trim();
  if (!phrase) {
    alert("Please enter at least one character for your reset phrase.");
    return;
  }

  // Find the thought by ID
  const thoughtId = resetSection.dataset.thoughtId;
  const thought = thoughtsData.find((t) => t.id === thoughtId);
  if (!thought) return;

  // Add the new reset phrase
  thought.resetPhrases.push({
    id: Date.now().toString(),
    text: phrase,
  });

  saveData();
  newResetPhraseInput.value = "";

  // Hide the reset section after adding the phrase
  resetSection.classList.add("hidden");

  // Re-render the list
  renderThoughts();
}

// Render the list of thoughts (and their reset phrases) in descending order
function renderThoughts() {
  thoughtList.innerHTML = "";

  // Loop through thoughtsData, which should already be newest first
  thoughtsData.forEach((thought) => {
    // Parent container for each thought
    const thoughtCard = document.createElement("div");
    thoughtCard.className = "bg-white shadow p-4 rounded";

    // Thought text & edit button container
    const thoughtHeader = document.createElement("div");
    thoughtHeader.className = "flex justify-between items-start mb-2";

    const thoughtText = document.createElement("span");
    thoughtText.textContent = thought.text;

    // Edit button for the thought
    const editThoughtBtn = document.createElement("button");
    editThoughtBtn.textContent = "Edit Thought";
    editThoughtBtn.className = "text-sm text-blue-500 hover:underline ml-2";
    editThoughtBtn.addEventListener("click", () => {
      const newText = prompt("Edit Thought:", thought.text);
      if (newText !== null && newText.trim() !== "") {
        thought.text = newText.trim();
        saveData();
        renderThoughts();
      }
    });

    thoughtHeader.appendChild(thoughtText);
    thoughtHeader.appendChild(editThoughtBtn);

    // Reset phrases list
    const resetList = document.createElement("div");
    resetList.className = "ml-3 mt-2";

    thought.resetPhrases.forEach((rp) => {
      const resetItem = document.createElement("div");
      resetItem.className = "flex justify-between items-center mb-1";

      const rpText = document.createElement("span");
      rpText.textContent = `- ${rp.text}`;

      // Edit button for the reset phrase
      const editResetBtn = document.createElement("button");
      editResetBtn.textContent = "Edit";
      editResetBtn.className = "text-xs text-blue-500 hover:underline ml-2";
      editResetBtn.addEventListener("click", () => {
        const newRpText = prompt("Edit Reset Phrase:", rp.text);
        if (newRpText !== null && newRpText.trim() !== "") {
          rp.text = newRpText.trim();
          saveData();
          renderThoughts();
        }
      });

      resetItem.appendChild(rpText);
      resetItem.appendChild(editResetBtn);
      resetList.appendChild(resetItem);
    });

    // Add new reset phrase button (for this particular thought)
    const addResetBtn = document.createElement("button");
    addResetBtn.textContent = "+ Add Reset Phrase";
    addResetBtn.className =
      "text-sm text-green-600 hover:underline mt-2 inline-block";
    addResetBtn.addEventListener("click", () => showResetSection(thought));

    // Assemble the card
    thoughtCard.appendChild(thoughtHeader);
    thoughtCard.appendChild(resetList);
    thoughtCard.appendChild(addResetBtn);

    thoughtList.appendChild(thoughtCard);
  });
}

// Export data to .txt file
function exportDataAsTxt() {
  let txtContent = "ClearMindLoop Export\n\n";

  thoughtsData.forEach((thought, index) => {
    txtContent += `Thought ${index + 1}: ${thought.text}\n`;
    if (thought.resetPhrases && thought.resetPhrases.length > 0) {
      thought.resetPhrases.forEach((rp, i) => {
        txtContent += `  Reset Phrase ${i + 1}: ${rp.text}\n`;
      });
    }
    txtContent += "\n";
  });

  // Create a Blob and link to download
  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "clearmindloop_export.txt";
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}
