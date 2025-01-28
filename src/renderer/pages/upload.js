import { saveAs } from 'file-saver';

export function saving() {
    console.log("savings is intialized");
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', () => {
        console.log("first call");
        saveImageAndPolygons();
    });
}


function saveImageAndPolygons() {
    console.log("saving");
    const stage = Konva.stages[0];
    const polygons = stage.find('Line').map(polygon => ({
        id: polygon.id(),
        name: polygon.name(),
        description: polygon.description,
        number: polygon.number,
        points: polygon.points(),
    }));

    const imageNode = stage.findOne('Image');
    const imageDataURL = imageNode.toDataURL();

    const data = {
        image: imageDataURL,
        polygons: polygons,
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    saveAs(blob, 'image_and_polygons.json');
}

export function loadImageAndPolygons(data, onImageLoaded) {
    const img = new Image();
    img.src = data.image;
    img.onload = () => onImageLoaded(img);

    data.polygons.forEach(polygonData => {
        const polygon = new Konva.Line({
            id: polygonData.id,
            points: polygonData.points,
            stroke: 'red',
            strokeWidth: 2,
            closed: true,
            fill: 'rgba(255, 0, 0, 0.3)',
        });
        polygon.name(polygonData.name);
        polygon.description = polygonData.description;
        polygon.number = polygonData.number;
        stage.findOne('Layer').add(polygon);
    });

    stage.findOne('Layer').draw();
}

  