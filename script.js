document.addEventListener('DOMContentLoaded', function() {
    const buildArea = document.getElementById('buildArea');
    const structureItems = document.querySelectorAll('.structure-item');
    const clearBtn = document.getElementById('clearBtn');
    const playerCount = document.getElementById('playerCount');

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
        'normal-fairy': 3,    // new block
        'normal-mask': 3,     // new block
        'rock-mask': 3,       // new block
        'water-fairy': 3      // new block
    };

    const placedStructuresCount = {};
    for (const type in structureLimits) {
        placedStructuresCount[type] = 0;
    }

    // Add counters below toolbar items
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
                counter.classList.add('limit-reached');
                item.draggable = false;
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
            } else {
                counter.classList.remove('limit-reached');
                item.draggable = true;
                item.style.opacity = '1';
                item.style.cursor = 'grab';
            }
        });
    }

    updateAllCounters();

    playerCount.addEventListener('change', updateAllCounters);

    let draggedType = null;

    // Drag start on toolbar items
    structureItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedType = item.dataset.structure;
            e.dataTransfer.setData('text/plain', draggedType);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    // Allow drop on build area
    buildArea.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    // Drop handler to place new block
    buildArea.addEventListener('drop', e => {
        e.preventDefault();

        const structureType = e.dataTransfer.getData('text/plain');
        if (!structureType) return;

        const players = parseInt(playerCount.value) || 1;
        const limit = structureLimits[structureType] * players;

        if (placedStructuresCount[structureType] >= limit) {
            return; // limit reached
        }

        const newBlock = document.createElement('div');
        newBlock.className = 'placed-structure';
        newBlock.dataset.structure = structureType;
        newBlock.style.position = 'absolute';

        const img = document.createElement('img');
        img.src = `img/${structureType}.png`;
        img.alt = structureType;
        newBlock.appendChild(img);

        buildArea.appendChild(newBlock);

        const rect = buildArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Clamp position inside build area
        x = Math.max(0, Math.min(rect.width - newBlock.offsetWidth, x));
        y = Math.max(0, Math.min(rect.height - newBlock.offsetHeight, y));

        newBlock.style.left = `${x}px`;
        newBlock.style.top = `${y}px`;

        enableDragMove(newBlock);

        placedStructuresCount[structureType]++;
        updateAllCounters();
    });

    // Enable mouse drag for placed blocks
    function enableDragMove(element) {
        let isDragging = false;
        let startX, startY;
        let origX, origY;
    
        function onMove(clientX, clientY) {
            if (!isDragging) return;
    
            const rect = buildArea.getBoundingClientRect();
    
            let dx = clientX - startX;
            let dy = clientY - startY;
    
            let newX = origX + dx;
            let newY = origY + dy;
    
            newX = Math.max(0, Math.min(rect.width - element.offsetWidth, newX));
            newY = Math.max(0, Math.min(rect.height - element.offsetHeight, newY));
    
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
    
        element.addEventListener('mousedown', e => {
            e.preventDefault();
            isDragging = true;
    
            const rect = buildArea.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
    
            origX = parseInt(element.style.left, 10) || 0;
            origY = parseInt(element.style.top, 10) || 0;
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    
        function onMouseMove(e) {
            onMove(e.clientX, e.clientY);
        }
    
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    
        // Touch events for mobile support
        element.addEventListener('touchstart', e => {
            e.preventDefault();
            if (e.touches.length !== 1) return; // single touch only
            isDragging = true;
    
            const touch = e.touches[0];
            const rect = buildArea.getBoundingClientRect();
            startX = touch.clientX;
            startY = touch.clientY;
    
            origX = parseInt(element.style.left, 10) || 0;
            origY = parseInt(element.style.top, 10) || 0;
    
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
            document.addEventListener('touchcancel', onTouchEnd);
        });
    
        function onTouchMove(e) {
            e.preventDefault();
            if (!isDragging) return;
            if (e.touches.length !== 1) return;
    
            const touch = e.touches[0];
            onMove(touch.clientX, touch.clientY);
        }
    
        function onTouchEnd(e) {
            isDragging = false;
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchEnd);
        }
    }

    // Clear button resets all
    clearBtn.addEventListener('click', () => {
        const placed = buildArea.querySelectorAll('.placed-structure');
        placed.forEach(block => {
            const type = block.dataset.structure;
            placedStructuresCount[type] = 0;
            block.remove();
        });
        updateAllCounters();
    });

    let eraserActive = false;

    trashBin.addEventListener('click', function() {
        eraserActive = !eraserActive;
        this.classList.toggle('active', eraserActive);
    });

    // Add click listener on build area to delete blocks when eraser is active
    buildArea.addEventListener('click', function(e) {
        if (!eraserActive) return;

        const target = e.target.closest('.placed-structure');
        if (target) {
            const type = target.dataset.structure;
            placedStructuresCount[type]--;
            updateAllCounters();
            target.remove();
        }
    });

    // Add scale multiplier slider
    const scaleControlContainer = document.createElement('div');
    scaleControlContainer.style.display = 'flex';
    scaleControlContainer.style.justifyContent = 'center';
    scaleControlContainer.style.marginTop = '10px';

    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Scale: ';
    scaleLabel.style.marginRight = '10px';
    scaleLabel.style.color = '#333';
    scaleLabel.style.fontWeight = 'bold';
    scaleLabel.style.alignSelf = 'center';

    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '0.5';
    scaleSlider.max = '1';
    scaleSlider.step = '0.1';
    scaleSlider.value = '1';
    scaleSlider.style.width = '300px';

    scaleControlContainer.appendChild(scaleLabel);
    scaleControlContainer.appendChild(scaleSlider);

    buildArea.parentNode.insertBefore(scaleControlContainer, buildArea.nextSibling);

    // Function to apply scale to all placed structures
    function applyScale(scale) {
        const placed = buildArea.querySelectorAll('.placed-structure');
        placed.forEach(block => {
            block.style.transform = `scale(${scale})`;
            block.style.transformOrigin = 'top left';
        });
    }

    // Update scale on slider input
    scaleSlider.addEventListener('input', () => {
        const scale = parseFloat(scaleSlider.value);
        applyScale(scale);
    });

    let selectedBlock = null;
    let rotationAngles = new WeakMap(); // To store rotation angle per block

    // Click handler to select a block
    buildArea.addEventListener('click', function(e) {
        if (eraserActive) return; // Ignore if eraser active
    
        const target = e.target.closest('.placed-structure');
        if (target) {
            if (selectedBlock) {
                selectedBlock.classList.remove('selected');
            }
            selectedBlock = target;
            selectedBlock.classList.add('selected');
        } else {
            if (selectedBlock) {
                selectedBlock.classList.remove('selected');
                selectedBlock = null;
            }
        }
    });

    // Wheel event to rotate selected block
    buildArea.addEventListener('wheel', function(e) {
        if (!selectedBlock) return;
    
        e.preventDefault();
    
        let currentAngle = rotationAngles.get(selectedBlock) || 0;
        // Adjust angle by deltaY (scroll amount), invert for natural scroll
        currentAngle -= e.deltaY * 0.05; // Adjust sensitivity as needed
    
        // Normalize angle between 0 and 360
        currentAngle = ((currentAngle % 360) + 360) % 360;
    
        rotationAngles.set(selectedBlock, currentAngle);
    
        // Apply rotation along with any existing scale transform
        const scaleMatch = selectedBlock.style.transform.match(/scale\(([^)]+)\)/);
        const scale = scaleMatch ? scaleMatch[1] : 1;
    
        selectedBlock.style.transform = `scale(${scale}) rotate(${currentAngle}deg)`;
    });
    
    // Optional: style selected block with outline
    // Add this CSS to your style.css:
    // .placed-structure.selected {
    //     outline: 2px solid #4a90e2;
    // }
});
