const buildArea = document.getElementById("buildArea");
const tools = document.querySelectorAll(".tool");
const playerCountInput = document.getElementById("playerCount");
const clearBtn = document.getElementById("clearBtn");

let draggedType = null;

const limits = {
    castle_wall: p => 100 * p,
    turret_assembled: p => 2 * p,
    heal_pad: p => 4 * p,
    boost: p => 12 * p,
    trap: p => 12 * p,
    windmill_assembled: p => 8 * p,

    spikes: p => 30 * p,
    farms: p => 2 * p,
    roofs: p => 32 * p
};

const groups = {
    big_spike: "spikes",
    hard_spike: "spikes",

    wood_farm: "farms",
    wood_farm_cherry: "farms",
    bush: "farms",
    rock: "farms",

    roof: "roofs",
    platform: "roofs"
};

const count = {};

function getLimit(type) {
    const p = parseInt(playerCountInput.value) || 1;
    if (groups[type]) return limits[groups[type]](p);
    return limits[type](p);
}

function getCount(type) {
    if (groups[type]) return count[groups[type]] || 0;
    return count[type] || 0;
}

tools.forEach(t => {
    t.addEventListener("dragstart", e => {
        draggedType = t.dataset.type;
    });
});

buildArea.addEventListener("dragover", e => e.preventDefault());

buildArea.addEventListener("drop", e => {
    e.preventDefault();
    if (!draggedType) return;

    if (getCount(draggedType) >= getLimit(draggedType)) return;

    const el = document.createElement("div");
    el.className = "placed";
    el.dataset.type = draggedType;

    const img = document.createElement("img");
    img.src = `img/${draggedType}.png`;

    el.appendChild(img);
    buildArea.appendChild(el);

    img.onload = () => {
        el.style.left = e.offsetX - img.naturalWidth / 2 + "px";
        el.style.top = e.offsetY - img.naturalHeight / 2 + "px";
    };

    const key = groups[draggedType] || draggedType;
    count[key] = (count[key] || 0) + 1;

    enableMove(el);
});

function enableMove(el) {
    let ox, oy, dragging = false;

    el.addEventListener("mousedown", e => {
        dragging = true;
        ox = e.offsetX;
        oy = e.offsetY;
    });

    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        const r = buildArea.getBoundingClientRect();
        el.style.left = e.clientX - r.left - ox + "px";
        el.style.top = e.clientY - r.top - oy + "px";
    });

    document.addEventListener("mouseup", () => dragging = false);
}

clearBtn.addEventListener("click", () => {
    buildArea.innerHTML = "";
    for (let k in count) count[k] = 0;
});
