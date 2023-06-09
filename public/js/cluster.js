// manipulation DOM ---------------------------------------------

// cacher/afficher le texte le temps du chargement du graphique
const hider = document.getElementById("hider");
hider.style.opacity = 0.5; 

// variables des graphiques
var myChart = undefined;
var canvas = document.getElementById("myChart");
var ctx = canvas.getContext('2d');
var myChartPie = undefined;
var canvasPie = document.getElementById("myChartPie");
var ctxPie = canvasPie.getContext('2d');

/**
 * unsupervised ml
 * @param {object} data 2d array  
 * @param {*} k   cluster number
 * @returns predictions
 */
const kMeans = (data, k = 1) => {

  // init random centroids
  const centroids = Array.from( {length : 3}, () => 
    Array.from({length:4}, () => Math.random())
    );

    // init distances array
    const distances = Array.from({ length: data.length }, () =>
      Array.from({ length: k }, () => 0)
    );
    const classes = Array.from({ length: data.length }, () => -1);
    let itr = true;
   
    while (itr) {
      itr = false;
  
      for (let d in data) {
        for (let c = 0; c < k; c++) {
          distances[d][c] = Math.hypot(
            ...Object.keys(data[0]).map(key => data[d][key] - centroids[c][key])
          );
        }
        const m = distances[d].indexOf(Math.min(...distances[d]));
        if (classes[d] !== m) itr = true;
        classes[d] = m;
      }
  
      for (let c = 0; c < k; c++) {
        centroids[c] = Array.from({ length: data[0].length }, () => 0);
        let size = data.reduce((acc, _, d) => {
          if (classes[d] === c) {
            acc++;
            for (let i in data[0]) centroids[c][i] += data[d][i];
          }
          return acc;
        }, 0);
        if (size === 0) size +=0.001; // avoid division by 0 !
        for (let i in data[0]) {
          centroids[c][i] = parseFloat(Number(centroids[c][i] / size).toFixed(2));
        }
      }
    }
    return classes;
};

/**
 * Min max scaler between 0 et 1
 * inverse scale method if needed
 */
class Scale {

    constructor(data) {
        this.data = data;
        this.min = undefined;
        this.max = undefined;
    }

    transpose = m => m[0].map((x,i) => m.map(x => x[i]));

    scaleCol(col, min, max) {
        return col.map(v => (v - min) / (max - min));
    }

    // sclaling by transposing cols to rows
    scaleTab() {
        const dataT = this.transpose(this.data);
        this.min = dataT.map(v => Math.min(...v));
        this.max = dataT.map(v => Math.max(...v));
        const dataScaled = [];
        for (let i = 0; i < dataT.length; i++) {
            dataScaled.push(this.scaleCol(dataT[i], this.min[i], this.max[i]));
        }
        return this.transpose(dataScaled);
    }

    invScaleCol(col, min, max) {
        return col.map(v => v * (max - min) + min);
    }

    invScaleTab(data) {
        const dataT = this.transpose(data);
        const dataUnscaled = [];
        for (let i = 0; i < dataT.length; i++) {
            dataUnscaled.push(this.invScaleCol(dataT[i], this.min[i], this.max[i]));
        }
        return this.transpose(dataUnscaled);
    }
}

/**
 * compute pca
 * @param {array} data   
 * @returns 1d array
 */
function acp(data) {
  const vectors = PCA.getEigenVectors(data);
  return [PCA.computeAdjustedData(data,vectors[0])['adjustedData'][0]];
}

/**
 * get json, scale data
 * @returns data scaled
 */
async function getData() {
    return fetch('/datasets/iris.json')
           .then(res => {
            return res.json();
           })
           .then(iris => {
                iris.forEach(el => delete el.species);
                let data = iris.map(l => Object.values(l));
                return new Scale(data).scaleTab();
           });
}

/**
 * get data
 * clustering
 * pca
 * graph
 */
async function run() {
    const data = await getData();
    const res = kMeans(data, 3);
    
    // acp for petals et sepals
    let sepals = acp(data.map(v => ([v[0], v[1]])));
    let petals = acp(data.map(v => ([v[2], v[3]])));
    
    // for graph
    const mef = [[], [], []];
    const counter = [0, 0, 0];
    sepals[0].forEach((el, ind) => {
      mef[res[ind]].push({x: el, y:petals[0][ind]});
      counter[res[ind]]++;
    });

    // plot
    genNewGraph({data: mef, prediction: counter});
}

/**
 * graphique de points du clestering, une couleur = une classe
 * @param {array} data 
 * returns chartJs scatter graph
 */
function generate_scatter_graphe(data){
    
    return {type: 'scatter',
            data: {
                datasets: [{
                    data : data[0],
                    borderColor: 'blue', // Add custom color border            
                    backgroundColor: 'blue'
                },
                {
                    data : data[1],
                    borderColor: 'orange', // Add custom color border            
                    backgroundColor: 'orange'
                },
                {
                    data : data[2],
                    borderColor: 'red', // Add custom color border            
                    backgroundColor: 'red'
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: "clustering sur les fleurs d'iris"
                    },
                    legend: { 
                        display: false 
                    }
                },
                scales: {
                    x: {
                            "type" : "linear",
                        },
                    y: {
                        type : "linear",
                        }
                }
            }
        };
} // end generate_scatter_graphe 

/**
 * graphique de répartition des prédictions
 * @param {array} data 
 * returns chartJs pie graph
 */
function generate_pie_graphe(data){
    
    return {type: 'pie',
            data: {
                datasets: [{
                    data : data,
                    backgroundColor: ['blue', 'orange', 'red']
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: "répartition des prédictions"
                    },
                    legend: { 
                        display: false 
                    }
                }
            }
        };
} // end generate_pie_graphe 

/**
 * récupérer les données du serveur et générer les graphiques
 */
async function firstGraph(data){
        // dimensions du canvas sinon affichage trop petit si on le régénère
        canvas.height = 400;
        canvas.width = 1000;
        canvas.style.margin = 'auto';

        myChart = new Chart(ctx, generate_scatter_graphe(data.data));
        myChartPie = new Chart(ctxPie, generate_pie_graphe(data.prediction));
        
        // cacher/afficher le texte le temps du chargement du graphique
        hider.style.opacity = 1;
}

/**
 * relancer l'apprentissage et regénérer les graphiques
 */
function genNewGraph(data){
    // cacher/afficher le texte le temps du chargement du graphique
    hider.style.opacity = 0.5;

    // effacer le canvas si besoin
    if (myChart !== undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxPie.clearRect(0, 0, canvasPie.width, canvasPie.height);
        myChart.destroy(); 
        myChartPie.destroy();
    }
    
    // gérérer le graphe
    firstGraph(data);
}

run();
document.getElementById('kmeans').addEventListener('click', run);
