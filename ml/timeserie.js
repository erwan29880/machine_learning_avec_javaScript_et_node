const tf = require('@tensorflow/tfjs');
const engieDataset = require('../datasets/engie.json');

class Engie {

    /*
    récupérer le fichier json et mettre en forme les données
    */

    constructor() {
        this.dataset = engieDataset;
    }

    /**
     * mets les données en forme pour le machine learning
     * @returns {object}
     */
    to2dDataset() {
        const data = [];
        for (let i = 0; i < this.dataset['1'].length; i++) {
            data.push([
                this.dataset['1'][i],
                this.dataset['2'][i],
                this.dataset['3'][i],
                this.dataset['4'][i],
                this.dataset['5'][i]
            ]);
        }
        return {
            data: data,
            labels: this.dataset['6'],
            dates: this.dataset['7']
        }
    }
}


module.exports = Engie