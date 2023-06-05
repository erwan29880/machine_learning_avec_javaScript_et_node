const tf = require('@tensorflow/tfjs');
const sk = require('scikitjs');
const dataProcess = require('./process')
const metriqueIris = require('./metricsIris');
const iris = require('../datasets/iris.json');
sk.setBackend(tf)

 
class Tree extends dataProcess{
    
    /*
    récupère les données préparées de la classe parente
    entraîne un arbre de décision (classification)
    prédit le jeu de test
    compute matrice de confusion et précision
    */

    constructor() {
        // récupérer les données de la classe parente
        super(iris, true, true, true, 0.2);
        this.data = super.getPrepData();
        this.labs = super.getDict();

        // instanciation modèle sans hyperparamétrage
        this.model = new sk.DecisionTreeClassifier();

        this.prediction;
    }
    

    /**
     * 
     * @returns {Object}
     */
    async run() {
        // ml
        this.fit();
        this.predict();
        
        // calcul et récupération des métriques -> /ml/fichier metricsIris.js
        const metrique = new metriqueIris(this.data.Ytest, this.prediction);
        const metrics = metrique.precisionRecall();
        let conf = metrique.confusionMatrix();
        await conf.then(val => {
            conf = val;
        });
        

        return {
            prediction: this.prediction,
            reel: this.data.Ytest,
            matriceDeConfusion: conf,
            metrics: metrics, 
            labels: this.labs
        };
    }


    fit() {
        this.model.fit(this.data.Xtrain, this.data.Ytrain);
    }

    
    predict() {
        this.prediction = this.model.predict(this.data.Xtest);   
    }
}

module.exports = Tree;