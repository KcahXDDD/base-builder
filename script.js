document.addEventListener('DOMContentLoaded', function () {

    const buildArea = document.getElementById('buildArea');
    const structureItems = document.querySelectorAll('.structure-item');
    const clearBtn = document.getElementById('clearBtn');
    const playerCount = document.getElementById('playerCount');

    const structureLimits = {
        'turret': 2,
        'heal-pad': 4,
        'boost': 12,
        'trap': 12,

        'wood-farm': 0.5,
        'wood-farm-cherry': 0.5,
        'bush': 0.5,
        'rock': 0.5,

        'powermill': 8,

        'hard-spike': 15,
        'big-spike': 15,

        'roof': 16,
        'platform': 16,

        'castle-wall': 100
    };

    const placedStructuresCount = {};
    Object.keys(structureLimits).forEach(t => placedStructuresCount[t] = 0);

    function updateAllCounters() {
        const players = parseInt(playerCount.value) || 1;

        structureItems.forEach(item => {
            const type = item.dataset.structure;
            const counter = item.querySelector('.structure-counter');
            const limit = Math.floor(structureLimits[type] * players);
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

    buildArea.addEventListener('dragover', e => e.preventDefault());

    buildArea.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedType) return;

        const players = parseInt(playerCount.value) || 1;
        const limit = Math.floor(structureLimits[draggedType] * players);
        if (placedStructuresCount[draggedType] >= limit) return;

        const block = document.createElement('div');
        block.className = 'placed-structure';
        block.dataset.structure = draggedType;

        const img = document.createElement('img');
        img.src = `img/${draggedType}.png`;
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';

        block.appendChild(img);
        buildArea.appendChild(block);

        const rect = buildArea.getBoundingClientRect();
        block.style.left = (e.clientX - rect.left) + 'px';
        block.style.top = (e.clientY - rect.top) + 'px';

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

});
