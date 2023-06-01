let started = false; // event mouse canvas
const efface = document.getElementById("effacer");
const div = document.getElementById("canvasDigitConteneur");
const predire = document.getElementById("predire");
const result = document.getElementById("result");
let canvas;
let ctx;

/**
 * insère le canvas dans le DOM
 */
function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.setAttribute("id", "canvasDigit");
    div.appendChild(canvas);
    canvas.width = 300;
    canvas.height = 300;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 18;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    addEvent();
}

// fonction de dessins

function sourisBouge(e) {
    if (started) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

function sourisHaut(e) {
    started = false;
}

function sourisBas(e) {
    started = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}


// enlever et remettre les évènements souris canvas

function addEvent() {
    canvas.addEventListener('mousedown', sourisBas);
    canvas.addEventListener('mousemove', sourisBouge);
    canvas.addEventListener('mouseup', sourisHaut);
    efface.addEventListener('click', erase);
}

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
    removeEvent();
    result.innerText = "";
    result.classList.remove('result');
    const canvasDigit = document.getElementById("canvasDigit");
    div.removeChild(canvasDigit);
    createCanvas();
    addEvent();
}

/**
 * récupère l'image dessinée sur le canvas
 * effectue la prédiction
 */
async function ml() {
    const model = await tf.loadLayersModel('/digits/model.json');
    const im = ctx.getImageData(0, 0, 300, 300);
    image = await tf.browser.fromPixels(im, 1);
    image = image.cast('float32');
    image = tf.image.resizeBilinear(image, [28, 28]);
    image = image.div(255.0);
    image = tf.expandDims(image, 0);
    image = await model.predict(image);
    image = tf.argMax(image, 1);
    const prediction = await image.array();
    result.classList.add('result');
    result.innerText = prediction[0];
    image.dispose();
    model.dispose();
}

// run

predire.addEventListener('click', ml);
createCanvas();
