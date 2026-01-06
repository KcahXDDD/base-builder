document.addEventListener('DOMContentLoaded', function () {
    const buildArea = document.getElementById('buildArea');
    const structureItems = document.querySelectorAll('.structure-item');
    const clearBtn = document.getElementById('clearBtn');
    const playerCount = document.getElementById('playerCount');
    const trashBin = document.getElementById('trashBin');

    const structureLimits = {
        'heal-pad': 1,
        'wall': 50,
        'windmill': 5,
        'repair-tower': 1,
        'water-tower': 1,
        'plant-tower': 1,
        'spectrum-tower': 1,
        'fire-tower': 1,
        'ice-tower': 1,
        'electric-tower': 1,
        'rock-tower': 1,
        'turrets': 2,
        'door': 8,
        'totem': 1,
        'mauve': 3,
        'water-mask': 3,
        'normal-fairy': 3,
        'normal-mask': 3,
        'rock-mask': 3,
        'water-fairy': 3
    };

    const placedStructuresCount = {};
    Object.keys(structureLimits).forEach(k => placedStructuresCount[k] = 0);

    structureItems.forEach(item => {
        const type = item.dataset.structure;
        const counter = document.createElement('div');
        counter.className = 'structure-counter';
        counter.textContent = `0/${structureLimits[type]}`;
        item.appendChild(counter);
    });

    function updateAllCounters() {
        const players = parseInt(playerCount.value) || 1;

        structureItems.forEach(item => {
            const type = item.dataset.structure;
            const counter = item.querySelector('.structure-counter');
            const limit = structureLimits[type] * players;
            const count = placedStructuresCount[type];

            counter.textContent = `${count}/${limit}`;

            item.draggable = count < limit;
            item.style.opacity = count < limit ? '1' : '0.5';
        });
    }

    updateAllCounters();
    playerCount.addEventListener('change', updateAllCounters);

    structureItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', item.dataset.structure);
        });
    });

    buildArea.addEventListener('dragover', e => e.preventDefault());

    buildArea.addEventListener('drop', e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (!type) return;

        const players = parseInt(playerCount.value) || 1;
        if (placedStructuresCount[type] >= structureLimits[type] * players) return;

        const block = document.createElement('div');
        block.className = 'placed-structure';
        block.dataset.structure = type;

        const img = document.createElement('img');
        img.src = `img/${type}.png`;
        block.appendChild(img);

        buildArea.appendChild(block);

        const rect = buildArea.getBoundingClientRect();
        block.style.left = `${e.clientX - rect.left}px`;
        block.style.top = `${e.clientY - rect.top}px`;

        enableDrag(block);

        placedStructuresCount[type]++;
        updateAllCounters();
    });

    function enableDrag(el) {
        let dragging = false, sx, sy, ox, oy;

        el.addEventListener('mousedown', e => {
            dragging = true;
            sx = e.clientX;
            sy = e.clientY;
            ox = parseInt(el.style.left);
            oy = parseInt(el.style.top);
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            el.style.left = `${ox + e.clientX - sx}px`;
            el.style.top = `${oy + e.clientY - sy}px`;
        });

        document.addEventListener('mouseup', () => dragging = false);
    }

    clearBtn.addEventListener('click', () => {
        buildArea.querySelectorAll('.placed-structure').forEach(b => b.remove());
        Object.keys(placedStructuresCount).forEach(k => placedStructuresCount[k] = 0);
        updateAllCounters();
    });

    let eraser = false;

    trashBin.addEventListener('click', () => {
        eraser = !eraser;
        trashBin.classList.toggle('active', eraser);
    });

    buildArea.addEventListener('click', e => {
        if (!eraser) return;
        const block = e.target.closest('.placed-structure');
        if (!block) return;
        placedStructuresCount[block.dataset.structure]--;
        block.remove();
        updateAllCounters();
    });
});
