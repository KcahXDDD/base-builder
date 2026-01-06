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
    Object.keys(structureLimits).forEach(t => placedStructuresCount[t] = 0);

    function updateAllCounters() {
        const players = parseInt(playerCount.value) || 1;

        structureItems.forEach(item => {
            const type = item.dataset.structure;
            const counter = item.querySelector('.structure-counter');
            const limit = structureLimits[type] * players;
            const count = placedStructuresCount[type];

            counter.textContent = `${count}/${limit}`;

            if (count >= limit) {
                item.draggable = false;
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
                counter.classList.add('limit-reached');
            } else {
                item.draggable = true;
                item.style.opacity = '1';
                item.style.cursor = 'grab';
                counter.classList.remove('limit-reached');
            }
        });
    }

    updateAllCounters();
    playerCount.addEventListener('change', updateAllCounters);

    let draggedType = null;

    structureItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedType = item.dataset.structure;
            e.dataTransfer.setData('text/plain', draggedType);
        });
    });

    buildArea.addEventListener('dragover', e => e.preventDefault());

    buildArea.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedType) return;

        const players = parseInt(playerCount.value) || 1;
        const limit = structureLimits[draggedType] * players;
        if (placedStructuresCount[draggedType] >= limit) return;

        const block = document.createElement('div');
        block.className = 'placed-structure';
        block.dataset.structure = draggedType;
        block.style.position = 'absolute';

        const img = document.createElement('img');
        img.src = `img/${draggedType}.png`;
        block.appendChild(img);

        buildArea.appendChild(block);

        const rect = buildArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        block.style.left = `${Math.max(0, x)}px`;
        block.style.top = `${Math.max(0, y)}px`;

        enableDrag(block);

        placedStructuresCount[draggedType]++;
        updateAllCounters();
    });

    function enableDrag(el) {
        let dragging = false;
        let startX, startY, origX, origY;

        el.addEventListener('mousedown', e => {
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origX = parseInt(el.style.left) || 0;
            origY = parseInt(el.style.top) || 0;

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        });

        function move(e) {
            if (!dragging) return;
            el.style.left = origX + (e.clientX - startX) + 'px';
            el.style.top = origY + (e.clientY - startY) + 'px';
        }

        function stop() {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
        }
    }

    clearBtn.addEventListener('click', () => {
        buildArea.querySelectorAll('.placed-structure').forEach(b => b.remove());
        Object.keys(placedStructuresCount).forEach(k => placedStructuresCount[k] = 0);
        updateAllCounters();
    });

    let selectedBlock = null;

    buildArea.addEventListener('click', e => {
        const target = e.target.closest('.placed-structure');
        if (target) {
            if (selectedBlock) selectedBlock.classList.remove('selected');
            selectedBlock = target;
            selectedBlock.classList.add('selected');
        } else {
            if (selectedBlock) selectedBlock.classList.remove('selected');
            selectedBlock = null;
        }
    });

    buildArea.addEventListener('wheel', e => {
        if (!selectedBlock) return;
        e.preventDefault();

        const current = selectedBlock.dataset.angle ? parseFloat(selectedBlock.dataset.angle) : 0;
        const angle = current - e.deltaY * 0.05;
        selectedBlock.dataset.angle = angle;
        selectedBlock.style.transform = `rotate(${angle}deg)`;
    });

    document.addEventListener('keydown', e => {
        if (
            (e.key === 'Delete' ||
             e.key === 'Backspace' ||
             e.key === "'") &&
            selectedBlock
        ) {
            const type = selectedBlock.dataset.structure;
            selectedBlock.remove();
            selectedBlock = null;
            placedStructuresCount[type]--;
            updateAllCounters();
        }
    });
});
