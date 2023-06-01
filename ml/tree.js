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
        super(iris, true, true, true, 0.2);
        this.data = super.getPrepData();
        this.labs = super.getDict();
        this.model = new sk.DecisionTreeClassifier();
        this.prediction;
    }
    
    /**
     * 
     * @returns {Object}
     */
    async run() {
        this.fit();
        this.predict();
                
        const metrique = new metriqueIris(this.data.Ytest, this.prediction);
        const metrics = metrique.precisionRecall();
        let conf = metrique.confusionMatrix();
        await conf.then(val => {
            conf = val;
        });
        
        const data = {
            prediction: this.prediction,
            reel: this.data.Ytest,
            matriceDeConfusion: conf,
            metrics: metrics, 
            labels: this.labs
        };
        return data;
    }

    fit() {
        this.model.fit(this.data.Xtrain, this.data.Ytrain);
    }

    predict() {
        this.prediction = this.model.predict(this.data.Xtest);   
    }
}

module.exports = Tree;