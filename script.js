const buildArea = document.getElementById("buildArea");
const tools = document.querySelectorAll(".tool");
const playerCountInput = document.getElementById("playerCount");
const clearBtn = document.getElementById("clearBtn");
const scaleSlider = document.getElementById("scaleSlider");
const trash = document.getElementById("trash");

let draggedType = null;
let selected = null;
let globalScale = parseFloat(scaleSlider.value);

const rotations = new WeakMap();

const groups = {
    wood_farm: "farm",
    wood_farm_cherry: "farm",
    bush: "farm",
    rock: "farm",

    big_spike: "spike",
    hard_spike: "spike",

    roof: "roof",
    platform: "roof"
};

const limitsBase = {
    castle_wall: 100,
    turret_assembled: 2,
    heal_pad: 4,
    boost: 12,
    trap: 12,
    windmill_assembled: 8,
    farm: 2,
    spike: 30,
    roof: 32
};

const used = {};

function getGroup(type) {
    return groups[type] || type;
}

function getMax(type) {
    const p = parseInt(playerCountInput.value) || 1;
    return limitsBase[getGroup(type)] * p;
}

function updateCounters() {
    tools.forEach(tool => {
        const type = tool.dataset.type;
        const group = getGroup(type);
        const u = used[group] || 0;
        const m = getMax(type);
        tool.querySelector(".counter").textContent = `${u}/${m}`;
    });
}

tools.forEach(tool => {
    tool.addEventListener("dragstart", () => {
        draggedType = tool.dataset.type;
    });
});

buildArea.addEventListener("dragover", e => e.preventDefault());

buildArea.addEventListener("drop", e => {
    e.preventDefault();
    if (!draggedType) return;

    const group = getGroup(draggedType);
    used[group] = used[group] || 0;
    if (used[group] >= getMax(draggedType)) return;

    const el = document.createElement("div");
    el.className = "placed";
    el.dataset.type = draggedType;

    const img = document.createElement("img");
    img.src = `img/${draggedType}.png`;

    el.appendChild(img);
    buildArea.appendChild(el);

    el.style.left = e.offsetX + "px";
    el.style.top = e.offsetY + "px";

    rotations.set(el, 0);
    applyTransform(el);

    used[group]++;
    updateCounters();
    enableSelect(el);
});

function enableSelect(el) {
    el.addEventListener("mousedown", e => {
        e.stopPropagation();
        select(el);
    });
}

function select(el) {
    if (selected) selected.classList.remove("selected");
    selected = el;
    selected.classList.add("selected");
}

buildArea.addEventListener("mousedown", () => {
    if (selected) selected.classList.remove("selected");
    selected = null;
});

document.addEventListener("keydown", e => {
    if (e.key === "'" && selected) {
        deleteSelected();
    }
});

trash.addEventListener("mousedown", e => {
    e.stopPropagation();
    deleteSelected();
});

function deleteSelected() {
    if (!selected) return;
    const group = getGroup(selected.dataset.type);
    used[group]--;
    selected.remove();
    selected = null;
    updateCounters();
}

buildArea.addEventListener("wheel", e => {
    if (!selected) return;
    e.preventDefault();

    let r = rotations.get(selected) || 0;
    r += e.deltaY > 0 ? 5 : -5;
    rotations.set(selected, r);

    applyTransform(selected);
});

function applyTransform(el) {
    const r = rotations.get(el) || 0;
    const img = el.querySelector("img");
    img.style.transform = `scale(${globalScale}) rotate(${r}deg)`;
}

scaleSlider.addEventListener("input", () => {
    globalScale = parseFloat(scaleSlider.value);
    document.querySelectorAll(".placed").forEach(el => {
        applyTransform(el);
    });
});

clearBtn.addEventListener("click", () => {
    document.querySelectorAll(".placed").forEach(p => p.remove());
    for (let k in used) used[k] = 0;
    selected = null;
    updateCounters();
});

playerCountInput.addEventListener("input", updateCounters);

updateCounters();
