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
async function firstGraph(){
    const url = "/clusterGet"; 
    fetch(url).then((prom) => prom.json()).then(d => {
        data = d;

        // dimensions du canvas sinon affichage trop petit si on le régénère
        canvas.height = 400;
        canvas.width = 1000;
        canvas.style.margin = 'auto';

        myChart = new Chart(ctx, generate_scatter_graphe(data.data));
        myChartPie = new Chart(ctxPie, generate_pie_graphe(data.prediction));
        
        // cacher/afficher le texte le temps du chargement du graphique
        hider.style.opacity = 1;
    });
}

/**
 * relancer l'apprentissage et regénérer les graphiques
 */
function genNewGraph(){
    // cacher/afficher le texte le temps du chargement du graphique
    hider.style.opacity = 0.5;

    // effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxPie.clearRect(0, 0, canvasPie.width, canvasPie.height);
    myChart.destroy(); 
    myChartPie.destroy();

    // gérérer le graphe
    firstGraph();
}


// manipulation DOM ---------------------------------------------

// cacher/afficher le texte le temps du chargement du graphique
const hider = document.getElementById("hider");
hider.style.opacity = 0.5; 

// variables des graphiques
var myChart = "";
var canvas = document.getElementById("myChart");
var ctx = canvas.getContext('2d');
var myChartPie = "";
var canvasPie = document.getElementById("myChartPie");
var ctxPie = canvasPie.getContext('2d');

var data = "";
var dataPie = "";

// charger le graphique au chargement de la page
firstGraph();

// relancer un apprentissage avec ré-affichage du graphqieu
document.getElementById('kmeans').addEventListener('click', genNewGraph);