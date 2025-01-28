import { setupPolygonManager } from './polygonManager.js';



const stage = new Konva.Stage({
  container: 'konva-container',
  width: 100,
  height: 200,
});

const backgroundLayer = new Konva.Layer();
const polygonLayer = new Konva.Layer();
stage.add(backgroundLayer);
stage.add(polygonLayer);

let imageNode = null;

export function initializeCanvas() {
  console.log("initializeCanvas");
  setupPolygonManager(stage, polygonLayer,backgroundLayer);

  document.getElementById('upload-image').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        if (imageNode) {
          backgroundLayer.remove(imageNode);
        }


        const containerWidth = document.getElementById('konva-container').offsetWidth;
        const containerHeight = document.getElementById('konva-container').offsetHeight;

        // Scale the image to fit the container while maintaining the aspect ratio
        const scaleRatio = Math.min(containerWidth / img.width, containerHeight / img.height);
        const newWidth = img.width * (scaleRatio-0.05);
        const newHeight = img.height * (scaleRatio-0.05);

        // Calculate the center position
        const centerX = (containerWidth - newWidth) / 2;
        const centerY = (containerHeight - newHeight) / 2;
        
        console.log("centerX " + centerX);
        console.log("centerY " + centerY);
        imageNode = new Konva.Image({
          image: img,
          x: 0,
          y: 5, 
          width: newWidth,
          height: newHeight,
          listening: true   // Ensures it listens to events
        });

        stage.width(newWidth);
        stage.height(newHeight);

        backgroundLayer.add(imageNode);
        backgroundLayer.draw();
      };
    };
    reader.readAsDataURL(file);
  });
}
