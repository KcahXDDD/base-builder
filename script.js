document.addEventListener("DOMContentLoaded", () => {
  const buildArea = document.getElementById("buildArea");
  const items = document.querySelectorAll(".structure-item");
  const playerCount = document.getElementById("playerCount");
  const eraserBtn = document.getElementById("eraser");
  const saveBtn = document.getElementById("saveTxt");
  const clearBtn = document.getElementById("clearBtn");

  let eraserMode = false;
  let selected = null;

  const limits = {
    "fire-tower": 1,
    "wall": 50,
    "door": 8
  };

  const placedCount = {};
  Object.keys(limits).forEach(k => placedCount[k] = 0);

  function updateCounters() {
    const players = parseInt(playerCount.value) || 1;
    items.forEach(item => {
      const type = item.dataset.type;
      const limit = limits[type] * players;
      item.querySelector(".counter").textContent =
        `${placedCount[type]}/${limit}`;

      item.draggable = placedCount[type] < limit;
      item.style.opacity = placedCount[type] < limit ? "1" : "0.4";
    });
  }

  updateCounters();

  items.forEach(item => {
    item.addEventListener("dragstart", e => {
      e.dataTransfer.setData("type", item.dataset.type);
    });
  });

  buildArea.addEventListener("dragover", e => e.preventDefault());

  buildArea.addEventListener("drop", e => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    if (!type) return;

    const limit = limits[type] * (parseInt(playerCount.value) || 1);
    if (placedCount[type] >= limit) return;

    const block = document.createElement("div");
    block.className = "placed";
    block.dataset.type = type;

    const img = document.createElement("img");
    img.src = `img/${type}.png`;
    block.appendChild(img);

    buildArea.appendChild(block);

    const rect = buildArea.getBoundingClientRect();
    block.style.left = `${e.clientX - rect.left}px`;
    block.style.top = `${e.clientY - rect.top}px`;

    enableDrag(block);
    placedCount[type]++;
    updateCounters();
  });

  function enableDrag(el) {
    let ox, oy, mx, my;

    el.addEventListener("mousedown", e => {
      if (eraserMode) return;
      selected?.classList.remove("selected");
      selected = el;
      el.classList.add("selected");

      ox = e.clientX;
      oy = e.clientY;
      mx = parseInt(el.style.left);
      my = parseInt(el.style.top);

      document.onmousemove = ev => {
        el.style.left = mx + ev.clientX - ox + "px";
        el.style.top = my + ev.clientY - oy + "px";
      };

      document.onmouseup = () => {
        document.onmousemove = null;
      };
    });

    el.addEventListener("click", () => {
      if (!eraserMode) return;
      placedCount[el.dataset.type]--;
      el.remove();
      updateCounters();
    });
  }

  eraserBtn.onclick = () => {
    eraserMode = !eraserMode;
    eraserBtn.classList.toggle("active");
  };

  saveBtn.onclick = () => {
    let txt = "";
    document.querySelectorAll(".placed").forEach((el, i) => {
      txt += `${el.dataset.type}${i} = {\n`;
      txt += `x:${el.style.left}\n`;
      txt += `y:${el.style.top}\n}\n\n`;
    });

    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "base.txt";
    a.click();
  };

  clearBtn.onclick = () => {
    document.querySelectorAll(".placed").forEach(el => el.remove());
    Object.keys(placedCount).forEach(k => placedCount[k] = 0);
    updateCounters();
  };
});
