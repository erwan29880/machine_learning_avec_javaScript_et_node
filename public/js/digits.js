// dessin à la souris : détection mouse down ou up
let started = false; 

// récupération élments dom
const efface = document.getElementById("effacer");
const div = document.getElementById("canvasDigitConteneur");
const predire = document.getElementById("predire");
const result = document.getElementById("result");

// variables de la zone de dessin
let canvas;
let ctx;

/**
 * insère le canvas dans le DOM
 */
function createCanvas() {
    // création de la zone de dessin
    canvas = document.createElement('canvas');
 
    // ajout de css
    canvas.setAttribute("id", "canvasDigit");
    canvas.width = 300;
    canvas.height = 300;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 18;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    div.appendChild(canvas);
    
    // ajouter les évènements de dessin souris
    addEvent();
}

// fonction de dessins

// dessin
function sourisBouge(e) {
    if (started) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

// arrêter le dessin
function sourisHaut(e) {
    started = false;
}

// commencer le dessin
function sourisBas(e) {
    started = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}


// enlever les évènements souris canvas
function addEvent() {
    canvas.addEventListener('mousedown', sourisBas);
    canvas.addEventListener('mousemove', sourisBouge);
    canvas.addEventListener('mouseup', sourisHaut);
    efface.addEventListener('click', erase);
}

// remettre les évènements souris canvas
function removeEvent() {
    canvas.removeEventListener('mousedown', sourisBas);
    canvas.removeEventListener('mousemove', sourisBouge);
    canvas.removeEventListener('mouseup', sourisHaut);
    efface.removeEventListener('click', erase);
}

/**
 * supprime et insère le canvas
 * supprime et remet les évènements souris canvas
 */
function erase() {
    // reset
    removeEvent();
    result.innerText = "";
    result.classList.remove('result');
    const canvasDigit = document.getElementById("canvasDigit");
    div.removeChild(canvasDigit);

    // ré-initialisation
    createCanvas();
    addEvent();
}

/**
 * récupère l'image dessinée sur le canvas
 * effectue la prédiction
 */
async function ml() {
    // chargement du modèle
    const model = await tf.loadLayersModel('/digits/model.json');
    
    // récupérer l'image du canvas
    const im = ctx.getImageData(0, 0, 300, 300);
    image = await tf.browser.fromPixels(im, 1);

    // mise au format d'apprentissage : 28 pixes par 28 pixels en noir et blanc
    image = image.cast('float32');
    image = tf.image.resizeBilinear(image, [28, 28]);

    // mise à l'échelle entre 0 et 1
    image = image.div(255.0);
    image = tf.expandDims(image, 0);

    // prédiction
    image = await model.predict(image);
    image = tf.argMax(image, 1);
    const prediction = await image.array();

    // affichage dom
    result.classList.add('result');
    result.innerText = prediction[0];

    // libération de la mémoire
    image.dispose();
    model.dispose();
}

// run

predire.addEventListener('click', ml);
createCanvas();
