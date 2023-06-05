class DataProcess{
    
    /*
        préparation des données :
        - mise à l'échelle (moyenne 0 et écart-type 1)
        - mélange des données
        - séparation en jeux d'entraînement et de test
    */
    
    /**
     * 
     * @param {object} data le fichier json
     * @param {bool} scale  mise à l'échelle des données ou non
     * @param {bool} shuf   mélanger ou non les données
     * @param {bool} split  créer un train/test split
     * @param {float} splitSize taille du jeu de données de test
     * 
     */
    constructor(data, scale, shuf, trainTest, splitSize){
        this.data = data;
        this.scale = scale;
        this.shuf = shuf;
        this.trainTest = trainTest;
        this.splitSize = splitSize;
        this.features = [];
        this.labels = [];
        this.minMax = {};
        this.byCol = {};
        this.featuresScaled = [];
        this.labelsDict = {};
        this.labelsDictInv = {};
    }


    /**
     * mise en listes des features et des labels
     */
    featuresLabels() {
        for (let line of this.data) {
            this.features.push([
                line.sepalLength,
                line.sepalWidth,
                line.petalLength,
                line.petalWidth
            ]);
           this.labels.push(line.species);
        }
    }


    /**
     * returns {Object} 
     */
    getPrepData() {
        this.featuresLabels();
        let data;

        //scale or not
        if (this.scale === true) this.stats();
        
        // encoder les variables de la target en numérique
        this.ordEncoder();

        // shuffle or not
        if (this.shuf === true) this.shuffle();
        
        // train test split or not
        if (this.trainTest === true) {
            data = this.splitData();
        } else {
            data = {
                features: this.features,
                labels: this.labels
            }
        }

        return data;
    }


    getDict() {
        return this.labelsDictInv;
    }


    /**
     * train test
     * @params {float} pct entre 0 et 1 taille du test set
     */
    splitData() {
        // calcul de la taille du set en fonction du nombre de données total
        const nbr = parseInt(this.features.length * this.splitSize);
        
        // séparation
        const xTrain = this.features.slice(0, this.features.length - nbr);
        const yTrain = this.labels.slice(0, this.features.length - nbr);
        const xTest = this.features.slice(-nbr, this.features.length);
        const yTest = this.labels.slice(-nbr, this.features.length);
        
        return {
            "Xtrain" : xTrain,
            "Xtest" : xTest,
            "Ytrain" : yTrain,
            "Ytest" : yTest
        }
    }

    /**
     * mélange les données
     */
    shuffle() {
        // index random
        const nbr = this.data.length;
        let index = Array.from(Array(nbr).keys())
        index = index.sort(() => Math.random() - 0.5);

        // mélange selon l'index créé
        const provArray = [];
        const provArray2 = [];
        for (let i = 0; i < index.length ; i++) {
            provArray.push(this.features[index[i]]);
            provArray2.push(this.labels[index[i]]);
        }

        this.features = provArray;
        this.labels = provArray2;
    }


    /**
     * ordinal encoder
     */
    ordEncoder() {
        if (typeof this.labels[0] === "string") {

            // get unique labels
            let uniques = [...new Set(this.labels)];
            
            // création des objets label => numéro
            for (let i = 0; i< uniques.length ; i++) {
                // transform
                this.labelsDict[uniques[i]] = i;
                // inverse transform
                this.labelsDictInv[i] = uniques[i];
            }
            
            // transformation
            const provArray = []
            for (let item of this.labels) {
                provArray.push(this.labelsDict[item]);
            }

            this.labels = provArray;
        } 
    }


    /**
     * calcule min, max, std par colonne 
     * scale les données
     * @returns {void}
     */
    stats() {
        // traitement des données par colonne
        for (let i = 0; i < this.features[0].length; i++) {
            let provArray = [];
            for (let j = 0; j< this.features.length ; j++) {
                provArray.push(parseFloat(this.features[j][i]));
            }

            // min et max
            this.byCol[i]  = provArray;
            this.minMax["minmax" + i] =  [Math.min(...provArray), Math.max(...provArray)];
            this.minMax["moyenne" + i] = (provArray.reduce((sommePartielle, a) => sommePartielle + a)) / provArray.length;
        
            // std
            let partialSum = 0;
            for (let j = 0; j< this.features.length ; j++) {
                partialSum += Math.pow(this.minMax["moyenne"+i] - parseFloat(this.features[j][i]), 2);
            }
            this.minMax["std"+i] = Math.sqrt(partialSum / this.features.length)

            // scale distribution normale centrée
            provArray = [];
            for (let j = 0; j< this.features.length ; j++) {
                provArray.push((parseFloat(this.features[j][i]) - this.minMax["moyenne"+i]) / this.minMax["std"+i] )
            }
            this.byCol["scaled"+i] = provArray;
        }

        // mettre les cols scalées en ligne
        for (let i = 0; i< this.features.length; i++) {
            const provArray = [];
            for (let j = 0; j < this.features[0].length; j++) {
                provArray.push(this.byCol["scaled"+j][i]);
            }
            this.featuresScaled.push(provArray);
        }
        this.features = this.featuresScaled;
    }

}

module.exports = DataProcess;