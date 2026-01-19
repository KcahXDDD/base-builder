const buildArea = document.getElementById("buildArea");
const tools = document.querySelectorAll(".tool");
const scaleSlider = document.getElementById("scaleSlider");
const clearBtn = document.getElementById("clearBtn");
const playerCount = document.getElementById("playerCount");

let draggedType = null;
let selected = null;
let globalScale = parseFloat(scaleSlider.value);

const rotations = new WeakMap();
const used = {};

const groups = {
    big_spike: "spike",
    hard_spike: "spike",
    roof: "roof",
    platform: "roof"
};

const limits = {
    castle_wall: 100,
    turret_assembled: 2,
    heal_pad: 4,
    boost: 12,
    trap: 12,
    spike: 30,
    windmill_assembled: 8,
    roof: 32
};

function groupOf(type) {
    return groups[type] || type;
}

function maxOf(type) {
    return limits[groupOf(type)] * (parseInt(playerCount.value) || 1);
}

function updateCounters() {
    tools.forEach(t => {
        const type = t.dataset.type;
        const g = groupOf(type);
        const u = used[g] || 0;
        t.querySelector(".counter").textContent = `${u}/${maxOf(type)}`;
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

    const g = groupOf(draggedType);
    used[g] = used[g] || 0;
    if (used[g] >= maxOf(draggedType)) return;

    const el = document.createElement("div");
    el.className = "placed";
    el.dataset.type = draggedType;

    const img = document.createElement("img");
    img.src = document.querySelector(`[data-type="${draggedType}"] img`).src;

    el.appendChild(img);
    buildArea.appendChild(el);

    el.style.left = e.offsetX + "px";
    el.style.top = e.offsetY + "px";

    rotations.set(el, 0);
    applyTransform(el);

    el.addEventListener("click", ev => {
        ev.stopPropagation();
        select(el);
    });

    used[g]++;
    updateCounters();
});

function select(el) {
    if (selected) selected.classList.remove("selected");
    selected = el;
    el.classList.add("selected");
}

buildArea.addEventListener("click", () => {
    if (selected) selected.classList.remove("selected");
    selected = null;
});

document.addEventListener("keydown", e => {
    if (e.key === "'" && selected) {
        const g = groupOf(selected.dataset.type);
        used[g]--;
        selected.remove();
        selected = null;
        updateCounters();
    }
});

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
    el.querySelector("img").style.transform =
        `scale(${globalScale}) rotate(${r}deg)`;
}

scaleSlider.addEventListener("input", () => {
    globalScale = parseFloat(scaleSlider.value);
    document.querySelectorAll(".placed").forEach(applyTransform);
});

clearBtn.addEventListener("click", () => {
    document.querySelectorAll(".placed").forEach(e => e.remove());
    for (let k in used) used[k] = 0;
    selected = null;
    updateCounters();
});

playerCount.addEventListener("input", updateCounters);

updateCounters();
