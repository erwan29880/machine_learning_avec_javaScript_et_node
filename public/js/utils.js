const im = document.querySelector(".iris img");


/**
 * calcul des coordonnées ppur centre l'image en position absolute
 */
function getPos() {
    const windowHeight = parseInt(window.innerHeight /2);
    const windowWidth = parseInt(window.innerWidth /2);
    const imSize = 266/2;
    return [windowHeight - imSize, windowWidth - imSize];
}

/**
 * opacifie le background 
 */
function setOpacity(parentEl) {
    Array.from(parentEl.querySelectorAll('*')).forEach(el => {
        if (el.getAttribute("id") == 'imagePopup') {
            el.style.zIndex = "3";
        } else {
            el.style.opacity = "0.5";
            el.style.zIndex = "0";
        }
    im.style.display = 'none';
    im.removeEventListener('click', popup);
    });
}

/**
 * annule l'opacité 
 */
function removeOpacity() {
    const conteneur = document.getElementsByClassName('container')[0];
    const popu = document.getElementById("imagePopup");
    conteneur.removeChild(popu)
    Array.from(conteneur.querySelectorAll('*')).forEach(el => {
            el.style.opacity = 1;
    });
    conteneur.removeEventListener('click', removeOpacity);
    im.style.display = 'block';
    im.addEventListener("click", popup)
}

/**
 * positionnement du popup de l'image
 */
function popup () {
    const popu = document.createElement('div');
    const img = document.createElement('img');
    const conteneur = document.getElementsByClassName('container')[0];
    const pos = getPos();

    img.src = "images/iris.png";
    img.setAttribute("id", "imagePopup");
    conteneur.append(img);
    img.style.position = "absolute";
    img.style.top = pos[0] + "px";
    img.style.left = pos[1] + "px";
 
    conteneur.addEventListener("click",  removeOpacity)
    setOpacity(conteneur);
}

im.addEventListener("click", popup);
