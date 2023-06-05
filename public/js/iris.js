// récupération éléments dom
const decisionTreeButton = document.getElementById('decisionTree');
const treeSupr = document.getElementById('decisionTreeSuppr');

/**
* crée une matrice de confusion sous forme de tableau
* @params {Object} data
* @returns {void}
*/
function createConfusionMatrix(data) {
    // diagonale : color1
    const color1 = "grey";
    const color2 = "red";

    // reset matrice de confusion existante
    const mdc = document.getElementById("tableauMatriceDeConfusion");
    mdc.innerHTML = "";

    // création du tableau
    const table = document.createElement("table");
    table.classList.add("tableTree");

    // création lignes et colonnes
    let inc = 1;
    for (let i=0; i < 3 ; i++) {
        const tr = document.createElement("tr");
        tr.classList.add("trTree");
        for (let j=0; j < 3 ; j++) {
            const td = document.createElement("td");
            td.innerText = data[i][j];
            td.classList.add("tdTree");

            // changement de couleur sur la diagonale
            if(inc === 1 || inc === 5 || inc === 9) {
                td.style.backgroundColor = color2;
            } else {
                td.style.backgroundColor = color1;
            }

            tr.appendChild(td);
            inc++;
        }
        table.appendChild(tr);
    }
    mdc.appendChild(table);

    // css
    mdc.style.width = table.offsetWidth + 2 + "px";
    mdc.style.margin = "auto";
}



/**
* crée une liste html avec précision recall par classe
* @returns {void}
*/
function createPrecisionRecall(data, labels) {
    // reset 
    const myDiv = document.getElementById("metricsTree");
    myDiv.innerHTML = "";
    
    // création de la liste
    let inc = 0;
    for (obj of data) {
        const p = document.createElement("p");
        const ul = document.createElement("ul");
        const li1 = document.createElement("li");
        const li2 = document.createElement("li");
        
        p.innerText = labels[inc] + " : ";
        li1.innerText = "Précision : " + obj.precision + " %";
        li2.innerText = "Recall : " + obj.recall  + " %";

        ul.appendChild(li1);
        ul.appendChild(li2);
        myDiv.appendChild(p);
        myDiv.appendChild(ul);
        inc++;
    }

    // css 
    myDiv.style.paddingLeft = "120px";
    myDiv.style.paddingTop = "30px";
    document.querySelectorAll('li').forEach(el => {
        el.style.listStyle = "none";
    });
}

/**
* ajax pour lancer le ml decisionTree et récupérer prédictions et métriques
* @returns {void}
*/
async function matriceDeConfusionTree() {
    fetch("/treeGet")
    .then((res) => {
        return res.json()
    }).then(val => {
        const data = val;
        createConfusionMatrix(data.matriceDeConfusion);
        createPrecisionRecall(data.metrics, data.labels);
    })
}


// event : button lancement decision tree iris 
decisionTreeButton.addEventListener("click", matriceDeConfusionTree);