<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Base Builder - Taming.io</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<h1>Base Builder - Taming.io</h1>

<div class="top-controls">
  Builders:
  <input type="number" id="builders" min="0">
</div>

<div class="buttons">
  <button onclick="showItems('fire')">
    <img src="img/fire.png">
  </button>
  <button onclick="showItems('wood')">
    <img src="img/wood.png">
  </button>
  <button onclick="showItems('stone')">
    <img src="img/stone.png">
  </button>
  <button onclick="showItems('gold')">
    <img src="img/gold.png">
  </button>
  <button onclick="showItems('misc')">
    <img src="img/misc.png">
  </button>
</div>

<div id="items"></div>

<div class="builder-area">
  <div id="eraser" onclick="toggleEraser()">🧽</div>
  <div id="grid"></div>
</div>

<button onclick="saveBase()">salvar base</button>

<script src="script.js"></script>
</body>
</html>
