// variables des graphiques
var myChart = undefined;
var canvas = document.getElementById("myChart");
var ctx = canvas.getContext('2d');

/**
 * affichage loss dans la page web
 * @param {string} txt 
 */
function addResult(txt) {
    const p = document.createElement('p');
    p.innerText = txt;
    result.prepend(p);
}

/**
 * callback training : affiche l'erreur quadratique moyenne
 * @param {int} epoch
 * @param {*} logs 
 */
function onEpochEnd(epoch, logs) {
    addResult('mse : ' + logs.meanSquaredError__op.toString());
}


/**
 * fonction écrite en procédurale
 * afin de faciliter la libération de mémoire des tenseurs
 * - récupère les données utilisateurs du DOM
 * - créé des données pseudo-aléatoires 
 * - transformation polynomiale éventuelle des données
 * - mise à l'échelle des données 
 * - création du modèle 
 * - entraînement du modèle avec affichage loss dans le DOM 
 * - prédiction (sur les variables initiales, pas de données de test)
 * - inversion de la mise à l'échelle des données (prédiction)
 * - réduction de dimensionnalité éventuelle
 * - affichage du graphique
 */
async function train() {
    // initalement le dataset a une feature
    let labels = undefined;

    // récupération élements dom
    let activation = document.getElementById("activation").value;
    let epochs = parseInt(document.getElementById("nbEpochs").value);
    let polynomial = document.getElementById("poly").value;
    let nbFeatures = parseInt(document.getElementById("nbDonnees").value);
    let optimizer = document.getElementById("optimizer").value;
    let neurones = parseInt(document.getElementById("neurones").value);
    let nDims = parseInt(document.getElementById("nbVariables").value);

    // effacer le canvas si besoin
    if (myChart !== undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        myChart.destroy();
    }
     
    // créer des features pseudo aléatoires
    const multLabels = tf.scalar(2);
    let features = tf.cast(tf.randomUniformInt([nbFeatures, nDims], 0, 1000), "float32");
    let featuresCopy = await features.array();  // sauvegarde features pour graphe

    // créer les labels => features puissance 2, ajout de biais
    let biaisVector = tf.abs(tf.randomNormal([nbFeatures, 1]));
    if (nDims > 1) {
        labels = features.mean(1).reshape([nbFeatures, 1]).pow(multLabels).mul(biaisVector);
    } else {
        labels = features.pow(multLabels).mul(biaisVector);    
    }
   
    // transformation polynomiale si selectionnée
    // la classe polynomiale est dans le fichier ./public/js/polynomial.js, importé dans le fichier front-end
    if (polynomial === "polynomiale") {
        const polyn = new polynomialFeatures(3, featuresCopy, false);
        features = tf.tensor2d(polyn.getNewFeaturesList());
        nDims = polyn.exportNbFeatures;
    }

    // mise à l'échelle des données 
    // la classe scaler est dans le fichier ./public/js/scaler.js, importé dans le fichier front-end
    const scalerFeature = new Scaler([0,1], features);
    const scalerLabels = new Scaler([0,1], labels);
    features = scalerFeature.scale();
    labels = scalerLabels.scale();

    // création du modèle
    model = tf.sequential({
        layers: [
          tf.layers.dense({units: neurones, activation: activation, inputShape: [nDims]}),
          tf.layers.dense({units: 1, activation: 'linear'})
        ]
    });
 
    // compilation
    model.compile({
        optimizer: optimizer,
        loss: tf.losses.meanSquaredError,
        metrics: [tf.losses.meanSquaredError]
    });

    // entraînement
    await model.fit(features, labels, {
        epochs: epochs, 
        batchSize: 1,  
        callbacks: {onEpochEnd}
    })

    // prédiction
    const pred = model.predict(features);
    
    // remise à l'échelle 
    const predInvScaled = scalerLabels.inverseScale(pred);
    const labelsInvScaled = scalerLabels.inverseScale(labels);
    
    // tensor => list
    const predArray = await predInvScaled.flatten().array();
    const labelsArray = await labelsInvScaled.flatten().array();
        
    // libérer la mémoire
    model.dispose();
    pred.dispose();
    biaisVector.dispose();
    features.dispose();
    labels.dispose();
    multLabels.dispose();
    predInvScaled.dispose();
    labelsInvScaled.dispose();
    
    // Pca si il y a plusieurs variables pour affichage graphique
    if (nDims > 1) {
        let vectors = PCA.getEigenVectors(featuresCopy)
        featuresCopy = PCA.computeAdjustedData(featuresCopy, vectors[0])['adjustedData'];
        featuresCopy = featuresCopy[0];
    }

    // reset vars au cas où cause bugs
    nDims = 1;
    epochs = 2;
    activation = "linear";
    polynomial = "normal";
    nbFeatures = 50;
    optimizer = "adam";
    neurones = 50;

    // mise ne forme des données pour le graphique
    const dataTrue = mef(featuresCopy, labelsArray);
    const dataPred = mef(featuresCopy, predArray);
    const data = [dataTrue, dataPred];
    
    // affichage du graphique
    canvas.height = 400;
    canvas.width = 1000;
    canvas.style.margin = 'auto';
    myChart = new Chart(ctx, generate_scatter_graphe(data, "régression linéaire"));
}


/**
 * mise en forme des données pour scatter graph
 * @param {array} x 
 * @param {array} y 
 * @returns {array}
 */
function mef(x, y) {
    const li = [];
    for (let i = 0; i < x.length ; i++) {
        let z = undefined;

        // si la list est à 2d, prendre la première dimension
        // dans la classe polynomials, normalement, x[0] est la vraie valeur si une feature
        if (x[i].length > 1) {
            z = x[i][0];
        } else {
            z = x[i]
        }
        li.push({
            x: z,
            y: y[i]
        });
    }
    return li;
}


/**
 * graphique de points du clustering, une couleur = une classe
 * @param {array} data 
 * @param {string} title
 * returns chartJs scatter graph
 */
function generate_scatter_graphe(data, title){
    
    return {type: 'scatter',
            data: {
                datasets: [{
                    data : data[0],
                    borderColor: 'blue', // Add custom color border            
                    backgroundColor: 'blue',
                    label: "réel",
                    order: 2
                },{
                    data : data[1],
                    borderColor: 'red', // Add custom color border            
                    backgroundColor: 'red',
                    label: 'prediction', 
                    order: 1
                }
            ]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    },
                    legend: { 
                        display: true
                    }
                },
                scales: {
                    x: {
                        type : "linear",
                        },
                    y: {
                        type : "linear",
                        }
                }
            }
        };
} // end generate_scatter_graphe 


// évènement DOM
document.getElementById('ml').addEventListener("click", train);

