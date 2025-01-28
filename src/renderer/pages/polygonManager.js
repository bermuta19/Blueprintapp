export function setupPolygonManager(stage, polygonLayer, backgroundLayer) {
    let points = [];
    let currentPolygon = null;
    const polygonList = document.getElementById('polygon-items');
    let selectedPolygon = null;
    let selectedListItem = null;

    // Handle stage click events
    
    stage.on('click', (e) => {
        //click empty area of image, with case to allow selecting own polygon line
        console.log(e.target instanceof Konva.Line);
        if(e.target instanceof Konva.Line){
            console.log(e.target.closed());
        }
        console.log(!currentPolygon);
        if (e.target.className === "Image" || (e.target instanceof Konva.Line && !e.target.closed())) {
            console.log("creating new polygon if");
            const pointer = stage.getPointerPosition();
            //deselect if clicked outside of the polygon
            
            if(selectedPolygon !== null){
                deselectPolygon();
            } else {
                points.push(pointer.x, pointer.y);
            }
            
           // Add points to the current polygon
            if (!currentPolygon && selectedPolygon === null) {
                // Create a new polygon if none exists
                currentPolygon = new Konva.Line({
                    points: points,
                    stroke: 'red',
                    strokeWidth: 2,
                    closed: false,
                });
                polygonLayer.add(currentPolygon);
            } else if (selectedPolygon === null){
                // Update the points of the current polygon
                currentPolygon.points(points);
            }
            // Close the polygon if the first point is clicked again
            if (points.length >= 4 && selectedPolygon === null) { // Minimum of 2 points (x, y) for a polygon, so 4 values (2 points) means the first click
                const firstPoint = { x: points[0], y: points[1] };
                if (isNearFirstPoint(pointer, firstPoint)) {
                    closePolygon();
                }
            }

            polygonLayer.draw();
            //selection or deselection
            //&& !currentPolygon
        } else if (e.target instanceof Konva.Line && e.target.closed()) {
            console.log("selection if");
            // Select or deselect a completed polygon
            
            if (selectedPolygon === e.target) {
                deselectPolygon();
            } else {
                
                selectPolygon(e.target);
            }
        } else if (!(e.target instanceof Konva.Line)) {
            console.log("deselection if");
            
            // Deselect all polygons if clicking elsewhere and not making a polygon
            deselectAllPolygons();
        }
        console.log(points);
        console.log(selectedPolygon);
    });

    // Handle keydown events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && points.length >= 6) {
            closePolygon();
        }
    });

    // Close the current polygon and add it to the list
    function closePolygon() {
        currentPolygon.closed(true);
        currentPolygon.fill('rgba(255, 0, 0, 0.3)');
        addPolygonToList(currentPolygon);
        showPolygonMenu(currentPolygon);
        selectPolygon(currentPolygon);
        currentPolygon = null;
        points = [];
        polygonLayer.draw();
    }

    // Check if the pointer is near the first point of the polygon
    function isNearFirstPoint(pointer, firstPoint, tolerance = 10) {
        return Math.abs(pointer.x - firstPoint.x) < tolerance && Math.abs(pointer.y - firstPoint.y) < tolerance;
    }

    // Add the polygon to the list
    function addPolygonToList(polygon) {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = `Polygon ${polygonList.children.length + 1}`;
        input.addEventListener('input', () => {
            polygon.name(input.value);
        });

        //delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            polygon.destroy();
            li.remove();
            polygonLayer.draw();
        });

        //select button
        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.addEventListener('click', () => {
            selectPolygon(polygon)
        });

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'polygon-details';
        detailsDiv.style.display = 'none';

        const numberSelect = document.createElement('select');
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            numberSelect.appendChild(option);
        }
        numberSelect.addEventListener('change', () => {
            polygon.number = numberSelect.value;
        });

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter name';
        nameInput.addEventListener('input', () => {
            polygon.name = nameInput.value;
        });

        detailsDiv.appendChild(numberSelect);
        detailsDiv.appendChild(nameInput);

        li.appendChild(detailsDiv);
        li.appendChild(input);
        li.appendChild(deleteButton);
        li.appendChild(selectButton);
        polygonList.appendChild(li);
    }

    // Show a dropdown menu for the polygon
    function showPolygonMenu(polygon) {
        const menu = document.createElement('div');
        menu.className = 'polygon-menu';

        const numberSelect = document.createElement('select');
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            numberSelect.appendChild(option);
        }
        numberSelect.addEventListener('change', () => {
            polygon.number = numberSelect.value;
        });

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter name';
        nameInput.addEventListener('input', () => {
            polygon.name = nameInput.value;
        });

        menu.appendChild(numberSelect);
        menu.appendChild(nameInput);

        document.body.appendChild(menu);

        const pointer = stage.getPointerPosition();
        menu.style.left = `${pointer.x}px`;
        menu.style.top = `${pointer.y}px`;

        polygon.on('click', () => {
            menu.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== polygon) {
                menu.style.display = 'none';
            }
        });
    }

    // Select a polygon and highlight it
    function selectPolygon(polygon) {
        
        // Revert the previously selected polygon's color
        if (selectedPolygon) {
            selectedPolygon.stroke('red');
            selectedPolygon.fill('rgba(255, 0, 0, 0.3)');
        }
        // Remove highlight from the previously selected list item
        if (selectedListItem) {
            selectedListItem.style.backgroundColor = '';
            selectedListItem.querySelector('.polygon-details').style.display = 'none';
        }

        // Highlight the selected polygon
        selectedPolygon = polygon;
        selectedPolygon.stroke('blue');
        selectedPolygon.fill('rgba(0, 0, 255, 0.3)');

        // Highlight the corresponding list item
        selectedListItem = Array.from(polygonList.children).find(li => {
            const input = li.querySelector('input');
            return input && input.value === polygon.name();
        });
        if (selectedListItem) {
            selectedListItem.style.backgroundColor = 'lightblue';
            selectedListItem.querySelector('.polygon-details').style.display = 'block';
        }

        polygonLayer.draw();
    }

    // Deselect the current polygon and revert its color
    function deselectPolygon() {
        
        if (selectedPolygon) {
            selectedPolygon.stroke('red');
            selectedPolygon.fill('rgba(255, 0, 0, 0.3)');
            selectedPolygon = null;
        }
        if (selectedListItem) {
            selectedListItem.style.backgroundColor = '';
            selectedListItem.querySelector('.polygon-details').style.display = 'none';
            selectedListItem = null;
        }
        polygonLayer.draw();
    }

    // Deselect all polygons and revert their colors
    function deselectAllPolygons() {
       
        polygonLayer.getChildren().each((polygon) => {
            if (polygon instanceof Konva.Line && polygon.stroke() === 'blue') {
                polygon.stroke('red');
                polygon.fill('rgba(255, 0, 0, 0.3)');
            }
        });
        selectedPolygon = null;
        if (selectedListItem) {
            selectedListItem.style.backgroundColor = '';
            selectedListItem.querySelector('.polygon-details').style.display = 'none';
            selectedListItem = null;
        }
        polygonLayer.draw();
    }
}
