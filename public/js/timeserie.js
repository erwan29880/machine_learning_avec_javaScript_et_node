/*
Les données sont récupérées du serveur (./ml/timseries.js) d'après un fichier json (./datasets/engie.json).
Le format est le suivant : 
    {
        features : [
            [pompage , nucleaire, hydro, eolien, thermique],
            ...
        ],
        labels : [
            total1,
            total2,
            ...
        ]
        dates : [
            1981-01,
            1982-02,
            ...
        ]
    }

Le jeu de données de prédiction est constitué des quatre dernières lignes des features
soit une dismension [1, 4, 5] ou 5 est le nombre de variables (hydro, eolien etc).
Le réseau de neurones n'a donc pas appris sur les 24 dernières données des features : 
    4 lignes de features prédisent 24 mois. 
Ce n'est donc pas un modèle très précis dans la mesure où le modèle n'a pas connaissance des 24 derniers mois, 
mais c'est suffisant pour une démo.
*/

const decale = 24; // nombre de données que le réseau prédit
const windowL = 4; // nombre de mois sur lesquels le réseau apprend à prédire les 24 données

// initialisation du graphique
var myChart = "";  
var canvas = document.getElementById("myChart");
var ctx = canvas.getContext('2d');


/**
 * récupère le jeu de données du serveur
 * @returns {object}
 */
async function fetchData() {
    return fetch('/datasets/engie.json')
    .then((res) => {
        return res.json();
    })
    .then(data => to2dDataset(data))
}


function to2dDataset(dataset) {
    const data = [];
    for (let i = 0; i < dataset['1'].length; i++) {
        data.push([
            dataset['1'][i],
            dataset['2'][i],
            dataset['3'][i],
            dataset['4'][i],
            dataset['5'][i]
        ]);
    }
    return {
        data: data,
        labels: dataset['6'],
        dates: dataset['7']
    }
  }



/**
 * dataset pour prédiction : shape(batch, windowL, nombre de features = 5)
 * -> nucléaire, éolien, thermique etc
 * @param {array} features 
 * @returns {array}
 */
function lstmDataset(features) {
    const fin = features.length - 1 - decale;
    return features.slice(features.length - windowL, features.length)
}


/**
 * mise à l'échelle des features entre 0 et 1
 * @param {array} x features 
 * @returns 
 */
async function scale(x) {
    // utilisation du calcul vectoriel
    const X = tf.tensor2d(x);
    const xScaled = X.sub(X.min(0)).div((X.max(0)).sub(X.min(0)));
    
    // remise en array
    const xArray = await xScaled.array();
    
    //libérer la mémoire
    X.dispose();
    xScaled.dispose()

    return xArray;
}


/**
 * inverse la mise à l'échelle de la target, prédite entre 0 et 1
 * @param {array} y 
 * @param {tensor} yHat 
 * @returns 
 */
async function invscale(y, yHat) {
    // calcul vectoriel
    const Y = tf.tensor1d(y);
    const yScaled = (yHat.mul((Y.max(0)).sub(Y.min(0)))).add(Y.min(0));
    
    // remise en array
    const pred = await yScaled.array();
    
    // libérer la mémoire
    Y.dispose();
    yScaled.dispose();

    return pred;
}


/**
 * récupère les données et les mets à l'échelle entre 0 et 1
 * @returns {object}
 */
async function getData() {
    const rep = await fetchData();
    console.log(rep)

    // mise à l'échelle entre 0 et 1
    const data = await scale(rep['data']);

    return {
        data: data,            // données mises à l'échelle
        yTrue: rep['labels'],  // target non scalée
        index: rep['dates']    // dates pour le graphique
    };
}


/**
 * ajouter des dates pour les prédictions
 * @param {string} dateInitiale format YYYY-MM
 * @param {integer} nbr de dates à ajouter 
 * @returns 
 */
function addDates(dateInitiale, nbr) {
    const newDates = [];
    let inc = 0
    let chgAnnee = false;

    let init = dateInitiale.split('-');

    // mise en forme des dates des prédictions
    while (inc < nbr) {
        let annee = parseInt(init[0])
        let mois = parseInt(init[1]);

        // changement d'année => initialiser le mois à 01
        if (init[1] == '12') {
            mois = '01';
            chgAnnee = true;

        } else {
            mois++;
            // avoir le zéro devant le mois si besoin : 1 -> 01
            if (mois < 10) {
                mois = 0 + mois.toString()
            } else {
                mois = mois.toString()
            }
        }

        // incrémentation année si changement d'année
        if (chgAnnee === true) {
            annee = (annee + 1).toString();
            chgAnnee = false;
        }
        
        const newDate = annee + '-' + mois; 
        newDates.push(newDate);
        inc++;
        
        // utiliser la nouvelle date comme départ du prochain tout de boucle
        init = newDate.split('-');
    }
    return newDates;
}


/**
 * mise en forme des données pour le graphe en intégrant la prédiction
 * @param {array} yPred
 * @param {array} yTrue  
 * @param {array} dateIndex 
 * @return {object} dates, labels et prédictions
 */
function prepareData(yPred, yTrue, dateIndex) {
    // récupere les dates des données connues
    let index = dateIndex.slice(0, yTrue.length);

    // tableau Nan pour le début de la courbe des prédictions
    let newPred = [];
    for (let i = 0; i < yTrue.length -1; i++) {
        newPred.push('NaN');
    }
    newPred.push(yTrue.slice(-1)[0]) // liaison graphique true / pred
    
    // ajout de valeurs à l'index, ajout des prédictions après les NaN
    const newDate = addDates(index.slice(-1)[0], yPred.length);
    for (let i = 0; i < newDate.length ; i++) {
        newPred.push(yPred[i]);
        index.push(newDate[i]);
    }
    
    return {
        label: index,
        data: yTrue,
        pred: newPred
    };
}


/**
 * récupère les données mises à l'échelle 
 * construit le dataset au format LSTM shape (batch, windowL, nbrDeFeatures=5)
 * effectue la prédiction
 * inverse la mise à l'échelle des prédictions
 * met en forme les données 
 * génère le graphique 
 */
async function run() {
    // les données mises à l'échelle
    const datasets = await getData();
    const yTrue = datasets['yTrue'];   // données non mises à l'échelle
    const index = datasets['index'];   // les dates

    // mettre en forme pour la prédiction en timeserie
    const data = lstmDataset(datasets['data']);
    
    // prédiction et remise à l'échelle initiale
    model = await tf.loadLayersModel('/timeserieModel/model.json');
    const predictionScaled = model.predict(tf.expandDims(tf.tensor2d(data), 0)).flatten();
    const yPred = await invscale(yTrue, predictionScaled);
    
    // libérer la mémoire
    model.dispose();
    predictionScaled.dispose();

    // graphique
    const dataForGraph = prepareData(yPred, yTrue, index);
    genNewGraph(dataForGraph, true);
}


/**
 * affichage du graphique sans les prédictions au chargement de la page
 */
async function grapheOnLoad() {
    // données non mises à l'échelle
    const data = await getData();

    const yTrue = {
        label: data['index'],
        data: data['yTrue']
    };

    // graphique
    genNewGraph(yTrue, false);
}


/**
 * configuration du graphe
 * @param {object} myData 
 * @param {boolean} pred intégrer ou pas la prédiction 
 * @returns 
 */
function generate_graphe(myData, pred) {
    const pr = 0;  // diamètre des points du grapqhiue
    const bw = 2;  // épaisseur de la ligne du graphique
    const colors = ["blue", "orange"];

    // les données pour l'affichage
    let dataset = [{
        data: myData['data'],
        label: "données observées",
        borderWidth:bw,
        pointRadius: pr,
        pointHoverRadius: pr,
        backgroundColor: colors[0],
        borderColor: colors[0]
    }];

    if (pred === true ) {
        dataset.push(
            {
                data: myData['pred'],
                label: "prédictions",
                borderWidth: bw,
                pointRadius: pr,
                pointHoverRadius: pr,
                backgroundColor: colors[1],
                borderColor: colors[1]
            }
        )
    }

    // configuration chartJS
    return {type: 'line',
            data: {
                labels: myData['label'],
                datasets: dataset
            },
            options: {  
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                },
                responsive: true,
                interaction: {
                    intersect: true,
                    mode: "index"
                    },
                plugins: {
                    title: {
                        display: true,
                        text: "consommation Engie depuis 1981"
                    },
                    legend: { 
                        display: true,
                        position: "bottom"
                    }
                },
                scales: {
                    y: {
                        display: true,
                        ticks: {
                            min: 0,
                            beginAtZero: true
                            },
                        title: {
                            display: true,
                            text: "GWh"
                        }
                    },
                    "x": {
                        display: true,
                        ticks: {
                            min: 0,
                            beginAtZero: true
                            },
                        title: {
                            display: true,
                            text: "années"
                        }
                    }
                }
            }
        };
} // end generate_graphe 


/**
 * générer le graphe
 * @param {object} myData 
 * @param {boolean} pred  effacer le canvas et intégrer les prédictions
 */
function genNewGraph(myData, pred){

    // effacer le canvas pour re-créer le graphique avec les prédictions
    if (pred === true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        myChart.destroy();     
    }

    // dimensions, sinon le graphe est créé trop petit
    canvas.width = 1000;
    canvas.height = 500;
    canvas.style.margin = "auto";
    
    myChart = new Chart(ctx, generate_graphe(myData, pred));
}


// DOM -------------------------
document.getElementById('ml').addEventListener('click', run) // prédire
grapheOnLoad(); // graphique initial
