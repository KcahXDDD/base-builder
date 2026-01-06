document.addEventListener('DOMContentLoaded', function() {
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
        'water-fairy': 3,
        'poison-fairy': 3,
        'big-spike': 12
    };

    const placedStructuresCount = {};
    for (const type in structureLimits) {
        placedStructuresCount[type] = 0;
    }

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

            if (count >= limit) {
                item.draggable = false;
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
            } else {
                item.draggable = true;
                item.style.opacity = '1';
                item.style.cursor = 'grab';
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

    buildArea.addEventListener('dragover', e => {
        e.preventDefault();
    });

    buildArea.addEventListener('drop', e => {
        e.preventDefault();

        const structureType = e.dataTransfer.getData('text/plain');
        if (!structureType) return;

        const players = parseInt(playerCount.value) || 1;
        const limit = structureLimits[structureType] * players;
        if (placedStructuresCount[structureType] >= limit) return;

        const newBlock = document.createElement('div');
        newBlock.className = 'placed-structure';
        newBlock.dataset.structure = structureType;
        newBlock.style.position = 'absolute';

        const img = document.createElement('img');
        img.src = `img/${structureType}.png`;
        newBlock.appendChild(img);

        buildArea.appendChild(newBlock);

        const rect = buildArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        newBlock.style.left = `${x}px`;
        newBlock.style.top = `${y}px`;

        enableDragMove(newBlock);

        placedStructuresCount[structureType]++;
        updateAllCounters();
    });

    function enableDragMove(element) {
        let isDragging = false;
        let startX, startY, origX, origY;

        element.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origX = parseInt(element.style.left) || 0;
            origY = parseInt(element.style.top) || 0;

            function onMove(ev) {
                if (!isDragging) return;
                element.style.left = `${origX + (ev.clientX - startX)}px`;
                element.style.top = `${origY + (ev.clientY - startY)}px`;
            }

            function onUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    clearBtn.addEventListener('click', () => {
        buildArea.querySelectorAll('.placed-structure').forEach(block => block.remove());
        for (const type in placedStructuresCount) {
            placedStructuresCount[type] = 0;
        }
        updateAllCounters();
    });

    let selectedBlock = null;
    let rotationAngles = new WeakMap();

    buildArea.addEventListener('click', e => {
        const target = e.target.closest('.placed-structure');
        if (selectedBlock) selectedBlock.classList.remove('selected');
        selectedBlock = target;
        if (selectedBlock) selectedBlock.classList.add('selected');
    });

    // ✅ rotação SOMENTE com scroll (R removido)
    buildArea.addEventListener('wheel', e => {
        if (!selectedBlock) return;
        e.preventDefault();

        let angle = rotationAngles.get(selectedBlock) || 0;
        angle -= e.deltaY * 0.05;
        rotationAngles.set(selectedBlock, angle);

        const scaleMatch = selectedBlock.style.transform.match(/scale\(([^)]+)\)/);
        const scale = scaleMatch ? scaleMatch[1] : 1;

        selectedBlock.style.transform = `scale(${scale}) rotate(${angle}deg)`;
    });

    // delete / backspace continua funcionando
    document.addEventListener('keydown', e => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
            const type = selectedBlock.dataset.structure;
            selectedBlock.remove();
            placedStructuresCount[type]--;
            selectedBlock = null;
            updateAllCounters();
        }
    });
});
