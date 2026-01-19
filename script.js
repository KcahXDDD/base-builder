document.addEventListener('DOMContentLoaded', function () {
    const buildArea = document.getElementById('buildArea');
    const structureItems = document.querySelectorAll('.structure-item');
    const clearBtn = document.getElementById('clearBtn');
    const playerCount = document.getElementById('playerCount');
    const trashBin = document.getElementById('trashBin');

    const structureLimits = {
        turret: 2,
        heal_pad: 4,
        boost: 12,
        trap: 12,
        windmill_assembled: 8,
        castle_wall: 100,

        big_spike: 30,
        hard_spike: 30,

        roof: 32,
        platform: 32,

        bush: 2,
        rock: 2,
        wood_farm: 2,
        wood_farm_cherry: 2
    };

    const sharedGroups = {
        spikes: ['big_spike', 'hard_spike'],
        floors: ['roof', 'platform'],
        resources: ['bush', 'rock', 'wood_farm', 'wood_farm_cherry']
    };

    const placedStructuresCount = {};
    Object.keys(structureLimits).forEach(t => placedStructuresCount[t] = 0);

    function getSharedCount(group) {
        return group.reduce((sum, t) => sum + (placedStructuresCount[t] || 0), 0);
    }

    function getSharedLimit(group, players, limitPerBuilder) {
        return limitPerBuilder * players;
    }

    function updateAllCounters() {
        const players = parseInt(playerCount.value) || 1;

        structureItems.forEach(item => {
            const type = item.dataset.structure;
            const counter = item.querySelector('.structure-counter');

            let limit = structureLimits[type] * players;
            let count = placedStructuresCount[type];

            if (sharedGroups.spikes.includes(type)) {
                limit = getSharedLimit(sharedGroups.spikes, players, 30);
                count = getSharedCount(sharedGroups.spikes);
            }

            if (sharedGroups.floors.includes(type)) {
                limit = getSharedLimit(sharedGroups.floors, players, 32);
                count = getSharedCount(sharedGroups.floors);
            }

            if (sharedGroups.resources.includes(type)) {
                limit = getSharedLimit(sharedGroups.resources, players, 2);
                count = getSharedCount(sharedGroups.resources);
            }

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

        let limit = structureLimits[draggedType] * players;
        let count = placedStructuresCount[draggedType];

        if (sharedGroups.spikes.includes(draggedType)) {
            limit = getSharedLimit(sharedGroups.spikes, players, 30);
            count = getSharedCount(sharedGroups.spikes);
        }

        if (sharedGroups.floors.includes(draggedType)) {
            limit = getSharedLimit(sharedGroups.floors, players, 32);
            count = getSharedCount(sharedGroups.floors);
        }

        if (sharedGroups.resources.includes(draggedType)) {
            limit = getSharedLimit(sharedGroups.resources, players, 2);
            count = getSharedCount(sharedGroups.resources);
        }

        if (count >= limit) return;

        const block = document.createElement('div');
        block.className = 'placed-structure';
        block.dataset.structure = draggedType;
        block.style.position = 'absolute';

        const img = document.createElement('img');
        img.src = `img/${draggedType}.png`;
        block.appendChild(img);

        buildArea.appendChild(block);

        const rect = buildArea.getBoundingClientRect();
        block.style.left = `${Math.max(0, e.clientX - rect.left)}px`;
        block.style.top = `${Math.max(0, e.clientY - rect.top)}px`;

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
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
            const type = selectedBlock.dataset.structure;
            selectedBlock.remove();
            selectedBlock = null;
            placedStructuresCount[type]--;
            updateAllCounters();
        }
    });
});
