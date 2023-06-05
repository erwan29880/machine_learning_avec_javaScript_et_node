const dataProcess = require('./process')
const tf = require('@tensorflow/tfjs');
const sk = require('scikitjs');
const pca = require('pca-js');
const iris = require('../datasets/iris.json');
sk.setBackend(tf)


class Cluster extends dataProcess{
    
    /*
    récupère les données préparées de la classe parente
    entraîne KMeans sur l'ensemble des données
    renvoie les données au front-end pour affichage graphique
    */

    constructor() {
        //récupération des données de la classe parents
        super(iris, false, true, false, 0);  
        this.data = super.getPrepData();
        this.labs = super.getDict();

        // instanciation modèle
        this.model = new sk.KMeans({
            nClusters: 3, 
            nInit: 200,
            maxIter: 600,
            randomState: 1234
        });

        this.prediction;
        this.sepals = [];
        this.petals = [];
        this.sepalsPetals = [];
        this.counter = [0, 0, 0];
    }
    
    /**
     * 
     * @returns {object} prédictions, nombre de classe par prédiction
     */
    async run() {
        let data;

        // ml
        this.fit();
        this.predict();

        // mise en forme
        await this.prediction.array()
        .then(val => {
            this.prediction = val;
            data = this.inChartJsFormat(this.prediction);
        });

        return {
            prediction : this.counter,
            data : data
        }
    }


    fit() {
        this.model.fit(this.data.features);
    }

    predict() {
        this.prediction = this.model.predict(this.data.features);   
    }
    
    /**
     * arrays for petals and sepals
     */
    petalsSepals() {
        for (let data of this.data.features) {
            this.sepals.push(data.slice(0,2));
            this.petals.push(data.slice(2,4));
        }
    }

    /**
     * PCA for petals and sepals, for plotting
     * longueur et largeur sépale transformée en coordonnée x
     * longueur et largeur pétale transformée en coordonnée y 
     */
    pca() {
        let vectors = pca.getEigenVectors(this.sepals);
        this.sepals = pca.computeAdjustedData(this.sepals,vectors[0])['adjustedData'][0];
        vectors = pca.getEigenVectors(this.petals);
        this.petals = pca.computeAdjustedData(this.petals,vectors[0])['adjustedData'][0];
    }

    /**
     * mise en forme du dataset à envoyer au front end pour chartJs
     * @param {array} prediction 
     * @returns {array}
     */
    inChartJsFormat(prediction) {

        // réduction de dimensionnalité
        this.petalsSepals();
        this.pca();

        // séparation en trois datasets pour afficher des couleurs différentes sur le graphique
        // compter le nombre de labels prédits
        const data1 = [];
        const data2 = [];
        const data3 = [];
        for (let i = 0; i < this.petals.length ; i++) {
            const dic = {
                x: this.sepals[i],
                y: this.petals[i]
            };

            const test = parseInt(prediction[i]);
            
            // séparation des prédictions
            if (test == 0) {
                data1.push(dic);
                this.counter[0]++;
            }
            if (test == 1) {
                data2.push(dic);
                this.counter[1]++;
            }
            if (test == 2) {
                data3.push(dic);
                this.counter[2]++;
            }       
        }
        return [data1, data2, data3];
    }
}


module.exports = Cluster;