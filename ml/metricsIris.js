const tf = require('@tensorflow/tfjs');

class Metrics {

    /*
    calcule en fonction des labels et des prédictions : 
     - la matrice de confusion 
     - TP, FP, TN, FN
    */

    /**
     * @param {array} yTrue 
     * @param {array} prediction 
     */
    constructor(yTrue, prediction) {
        this.yTrue = yTrue;
        this.prediction = prediction;
    }

    confusionMatrix() {
        return tf.math.confusionMatrix(this.yTrue, this.prediction , 3).array()
    }


    /**
     * compute tp fp fn tn pour une classe
     * @param {array} y labels 
     * @param {array} p prédictions
     * @returns {object} les données analysées en TP, FP, TN, FN
     */
    perfMesurement(y, p) {
        let tp = 0;
        let fp = 0;
        let tn = 0;
        let fn = 0;
        for (let i = 0; i < y.length ; i++) {
            if (y[i] == p[i] == 1) tp++;
            if (p[i] == 1 && y[i] != p[i]) fp++;
            if (y[i] == p[i] == 0) tn++;
            if (p[i] == 0 && y[i] != p[i]) fn++; 
        }
        
        return {
            tp: tp,
            fp: fp,
            tn: tn,
            fn: fn
        };
    }


    /**
     * mets les données sous forme 0 ou 1 : évite la réécriture d'une fonction
     * d'analyse par classe
     * @param {array} y  le réel 
     * @param {array} p  la prédiction
     * @param {*} classe 0 ou 1
     * @returns {object} les données analysées en TP, FP, TN, FN
     */
    sepClasse(y, p, classe) {
        const ym = [];
        const pm = [];
        for (let i = 0; i < y.length ; i++) {
            if (y[i] === classe) ym.push(1);
            if (y[i] !== classe) ym.push(0); 
            if (p[i] === classe) pm.push(1);
            if (p[i] !== classe) pm.push(0); 
        }
        return this.perfMesurement(ym, pm);
    }

    /**
     * retourne un array d'objets {tp, fp, tn, fn} par classe
     * @returns {array}
     */
    metricsByClass() {
        const classes = [0, 1, 2];
        const metrics = [];
        for (let classe of classes) {
            metrics.push(this.sepClasse(this.yTrue, this.prediction, classe));
        }
        return metrics;
    }


    /**
     * @returns {array} of ojects
     */
    precisionRecall() {
        const metrics = [];
        const m = this.metricsByClass();

        // calcul recall et précision
        for (let i = 0; i < m.length ; i++) {
            let precision = m[i].tp / (m[i].tp + m[i].fp);
            let recall = m[i].tp / (m[i].tp + m[i].fn);
            
            // mise en pourcentage
            precision =  Math.round(precision * 100);
            recall = Math.round(recall * 100);
            
            const data = {
                precision: precision,
                recall: recall
            }
            metrics.push(data);
        }
        return metrics;
    }
}


module.exports = Metrics;