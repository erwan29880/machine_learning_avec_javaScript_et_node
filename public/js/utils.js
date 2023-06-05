/*
fichier utilisé pour les fichiers : 
    ./views/cluster.ejs 
    ./views/iris.ejs

Gestion de l'affichage de la fleur d'iris au click souris
permet de voir ce que sont sépales et pétales
*/

// récupération image dom
const im = document.querySelector(".iris img");


/**
 * calcul des coordonnées pour centrer l'image en position absolute
 */
function getPos() {
    const windowHeight = parseInt(window.innerHeight /2);
    const windowWidth = parseInt(window.innerWidth /2);
    const imSize = 266/2;
    return [windowHeight - imSize, windowWidth - imSize];
}


/**
 * opacifie le background quand l'image est affichée
 */
function setOpacity(parentEl) {
    Array.from(parentEl.querySelectorAll('*')).forEach(el => {
        if (el.getAttribute("id") == 'imagePopup') {
            el.style.zIndex = "3";
        } else {
            el.style.opacity = "0.5";
            el.style.zIndex = "0";
        }
    
    // cacher la miniature
    im.style.display = 'none';

    // enlever l'event
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
    
    // supprimer l'event
    conteneur.removeEventListener('click', removeOpacity);
    
    // réaffichage de la miniature
    im.style.display = 'block';

    // remettre l'event sur la miniature
    im.addEventListener("click", popup)
}


/**
 * positionnement du popup de l'image
 */
function popup () {
    // création éléments
    const popu = document.createElement('div');
    const img = document.createElement('img');
    
    // calcul position en fonction de l'écran
    const pos = getPos();

    // url et css image
    img.src = "images/iris.png";
    img.setAttribute("id", "imagePopup");
    img.style.position = "absolute";
    img.style.top = pos[0] + "px";
    img.style.left = pos[1] + "px";

    const conteneur = document.getElementsByClassName('container')[0];
    conteneur.append(img);
    conteneur.addEventListener("click",  removeOpacity)
    setOpacity(conteneur);
}

im.addEventListener("click", popup);