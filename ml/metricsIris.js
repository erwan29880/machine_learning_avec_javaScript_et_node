const tf = require('@tensorflow/tfjs');
const sk = require('scikitjs');
sk.setBackend(tf)


class Metrics {

    /*
    calcule en fonction dess labels et des prédictions : 
     - la matrice de confusion 
     - TP, FP, TN, FN
    */

    constructor(yTrue, prediction) {
        this.yTrue = yTrue;
        this.prediction = prediction;
    }

    confusionMatrix() {
        return tf.math.confusionMatrix(this.yTrue, this.prediction , 3).array()
    }

    /**
     * @returns {array} of ojects
     */
    precisionRecall() {
        const metrics = [];
        const m = this.metricsByClass();
        for (let i = 0; i < m.length ; i++) {
            let precision = m[i].tp / (m[i].tp + m[i].fp);
            let recall = m[i].tp / (m[i].tp + m[i].fn); 
            precision =  Math.round(precision * 100);
            recall = Math.round(recall * 100);
            
            const data = {
                precision: precision ,
                recall: recall
            }
            metrics.push(data);
        }
        return metrics;
    }

    metricsByClass() {
        const classes = [0, 1, 2];
        const metrics = [];
        for (let classe of classes) {
            metrics.push(this.sepClasse(this.yTrue, this.prediction, classe));
        }
        return metrics;
    }

    sepClasse(y, p, classe) {
        const ym = [];
        const pm = []
        for (let i = 0; i < y.length ; i++) {
            if (y[i] === classe) ym.push(1);
            if (y[i] !== classe) ym.push(0); 
            if (p[i] === classe) pm.push(1);
            if (p[i] !== classe) pm.push(0); 
        }
        return this.perfMesurement(ym, pm);
    }

    /**
     * compute tp fp fn tn pour une classe
     * @param {array} y labels 
     * @param {array} p prédictions
     * @returns {object}
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
        const metrics = {
            tp: tp,
            fp: fp,
            tn: tn,
            fn: fn
        }
        return metrics;
    }
}


module.exports = Metrics;