document.addEventListener("DOMContentLoaded", function () {
  let db;
  let currentOccasion = null;

  // Initialize IndexedDB
  const dbRequest = indexedDB.open("packingDB", 11);

  dbRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("occasions")) {
      db.createObjectStore("occasions", { keyPath: "id" });
    }
  };

  dbRequest.onsuccess = function (event) {
    db = event.target.result;
    displayOccasions();
  };

  dbRequest.onerror = function (event) {
    console.error("Error opening database:", event.target.error);
  };

  // Save an occasion
  document.getElementById("save-button").addEventListener("click", function () {
    const id = document.getElementById("occasion-id").value.trim();
    const date = document.getElementById("occasion-date").value;
    const notes = document.getElementById("occasion-notes").value.trim();

    if (!id || !date) {
      alert("Please fill in both ID and date.");
      return;
    }

    saveOccasion({ id, date, notes });
  });

  function saveOccasion(occasion) {
    const transaction = db.transaction(["occasions"], "readwrite");
    const store = transaction.objectStore("occasions");

    const request = store.add({ ...occasion, items: [] });

    request.onsuccess = function () {
      alert("Occasion saved successfully!");
      displayOccasions();
    };

    request.onerror = function (event) {
      console.error("Error saving occasion:", event.target.error);
    };
  }

  function displayOccasions() {
    const transaction = db.transaction(["occasions"], "readonly");
    const store = transaction.objectStore("occasions");

    store.getAll().onsuccess = function (event) {
      const occasions = event.target.result;
      const list = document.getElementById("occasion-list");
      list.innerHTML = "";

      occasions.forEach((occasion) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";

        const link = document.createElement("a");
        link.href = "#";
        const dateObj = new Date(occasion.date);
        const formattedDate = dateObj.toLocaleDateString();
        link.textContent = `${occasion.id} - ${formattedDate}`;
        if (occasion.notes) {
          const notesSpan = document.createElement("span");
          notesSpan.className = "occasion-notes";
          notesSpan.innerHTML = ` (Notes: <strong>${occasion.notes}</strong>)`;
          link.appendChild(notesSpan);
        }
        link.addEventListener("click", () => showFinalizedList(occasion));

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.className = "occasion-delete-button";
        deleteBtn.title = "Delete this occasion";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (
            confirm(
              `Are you sure you want to delete occasion "${occasion.id}"?`
            )
          ) {
            const delTransaction = db.transaction(["occasions"], "readwrite");
            const delStore = delTransaction.objectStore("occasions");
            delStore.delete(occasion.id).onsuccess = function () {
              displayOccasions();
              // Optionally hide the finalized list if it was showing this occasion
              if (currentOccasion && currentOccasion.id === occasion.id) {
                document.getElementById("finalized-list").style.display =
                  "none";
              }
            };
          }
        });

        li.appendChild(link);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    };
  }

  function showFinalizedList(occasion) {
    currentOccasion = occasion;

    // Display the finalized list
    const finalizedList = document.getElementById("finalized-list");
    finalizedList.style.display = "block";

    // Format the date
    const dateObj = new Date(occasion.date);
    const formattedDate = dateObj.toLocaleDateString();

    // Update title and details
    document.getElementById(
      "finalized-title"
    ).textContent = `Packing List For Occasion #${occasion.id}`;
    const detailsElement = document.getElementById("occasion-details");
    detailsElement.innerHTML = `Date: ${formattedDate}`;
    if (occasion.notes) {
      detailsElement.innerHTML += ` | Notes: <strong>${occasion.notes}</strong>`;
    }

    refreshItemsList();
  }

  function refreshItemsList() {
    const list = document.getElementById("finalized-items");
    list.innerHTML = "";

    // Populate items with checkbox, quantity and notes for editing
    currentOccasion.items.forEach((item, index) => {
      const li = document.createElement("li");

      // Create checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.checked || false;
      checkbox.dataset.index = index;

      const label = document.createElement("span");
      label.textContent = item.item;

      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.value = item.quantity;
      quantityInput.dataset.index = index;

      const notesInput = document.createElement("input");
      notesInput.type = "text";
      notesInput.value = item.notes;
      notesInput.dataset.index = index;

      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "×";
      deleteButton.className = "delete-button";
      deleteButton.dataset.index = index;
      deleteButton.addEventListener("click", function () {
        if (confirm(`Are you sure you want to delete "${item.item}"?`)) {
          // Remove the item from the array
          currentOccasion.items.splice(index, 1);

          // Save to database
          const transaction = db.transaction(["occasions"], "readwrite");
          const store = transaction.objectStore("occasions");
          const request = store.put(currentOccasion);

          request.onsuccess = function () {
            refreshItemsList();
          };

          request.onerror = function (event) {
            console.error("Error deleting item:", event.target.error);
            alert("Error deleting item");
          };
        }
      });

      // Append all elements in the desired order
      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(quantityInput);
      li.appendChild(notesInput);
      li.appendChild(deleteButton);

      list.appendChild(li);
    });
  }

  // Modify the add item functionality to include checked state
  document
    .getElementById("add-item-button")
    .addEventListener("click", function () {
      if (!currentOccasion) {
        alert("Please select an occasion first");
        return;
      }

      const itemName = document.getElementById("item-name").value.trim();
      const itemQuantity = document.getElementById("item-quantity").value;
      const itemNotes = document.getElementById("item-notes").value.trim();

      if (!itemName || !itemQuantity) {
        alert("Please enter at least an item name and quantity");
        return;
      }

      // Add the new item to the current occasion
      currentOccasion.items.push({
        item: itemName,
        quantity: itemQuantity,
        notes: itemNotes,
        checked: false, // Initialize as unchecked
      });

      // Save the updated occasion to the database
      const transaction = db.transaction(["occasions"], "readwrite");
      const store = transaction.objectStore("occasions");
      const request = store.put(currentOccasion);

      request.onsuccess = function () {
        // Clear the input fields
        document.getElementById("item-name").value = "";
        document.getElementById("item-quantity").value = "1";
        document.getElementById("item-notes").value = "";

        // Refresh the items list
        refreshItemsList();
      };

      request.onerror = function (event) {
        console.error("Error saving new item:", event.target.error);
        alert("Error saving new item");
      };
    });

  // Modify the save edits functionality to include checkbox states
  document
    .getElementById("save-edits-button")
    .addEventListener("click", function () {
      const items = Array.from(
        document.querySelectorAll("#finalized-items li")
      ).map((li) => {
        const label = li.querySelector("span").textContent;
        const quantity = li.querySelector("input[type='number']").value;
        const notes = li.querySelector("input[type='text']").value;
        const checked = li.querySelector("input[type='checkbox']").checked;

        return { item: label, quantity, notes, checked };
      });

      const transaction = db.transaction(["occasions"], "readwrite");
      const store = transaction.objectStore("occasions");

      currentOccasion.items = items;

      const request = store.put(currentOccasion);

      request.onsuccess = function () {
        alert("Edits saved successfully!");
        console.log("Updated occasion:", currentOccasion);
      };

      request.onerror = function (event) {
        console.error("Error saving edits:", event.target.error);
      };
    });

  // Add new event listener for automatic saving of checkbox states
  document
    .getElementById("finalized-items")
    .addEventListener("change", function (event) {
      if (event.target.type === "checkbox") {
        // Save changes immediately when a checkbox is clicked
        document.getElementById("save-edits-button").click();
      }
    });

  // Toggle Saved Occasions section
  const toggleOccasions = document.getElementById("toggle-occasions");
  const occasionList = document.getElementById("occasion-list");
  let occasionsVisible = true;

  toggleOccasions.addEventListener("click", function () {
    occasionsVisible = !occasionsVisible;
    occasionList.style.display = occasionsVisible ? "block" : "none";
    // Optionally, change the header text or style to indicate state
    toggleOccasions.textContent = occasionsVisible
      ? "Saved Occasions"
      : "Show Saved Occasions";
  });

  // Hide Packing List section with X button
  document
    .getElementById("hide-packing-list")
    .addEventListener("click", function () {
      document.getElementById("finalized-list").style.display = "none";
    });
});
