<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Packing App</title>
</head>
<body>
  <h1>Packing App</h1>

  <!-- Form for adding occasions -->
  <div id="occasion-form">
    <input type="text" id="occasion-id" placeholder="Occasion ID" required>
    <input type="date" id="occasion-date" required>
    <button id="save-button">Save Occasion</button>
  </div>

  <!-- Display saved occasions -->
  <h2>Saved Occasions</h2>
  <ul id="occasion-list"></ul>

  <!-- Categories Section -->
  <div id="categories" style="display: none;">
    <h2>Categories</h2>
    <button data-category="Basics">Basics</button>
    <button data-category="Casual">Casual</button>
    <button data-category="Dress">Dress</button>
    <button id="finalize-button" style="margin-top: 10px;">Finalize Packing List</button>
  </div>

  <!-- Choices Section -->
  <div id="choices" style="display: none;">
    <h2 id="category-title"></h2>
    <ul id="choices-list"></ul>
    <button id="save-choices-button" style="margin-top: 10px;">Save Choices</button>
  </div>

  <!-- Finalized Packing List -->
  <div id="finalized-list" style="display: none;">
    <h2>Finalized Packing List</h2>
    <ul id="finalized-items"></ul>
  </div>

  <script src="script.js"></script>
</body>
</html>