class DataProcess{
    
    /*
        préparation des données :
        - mise à l'échelle (moyenne 0 et écart-type 1)
        - mélange des données
        - séparation en jeux d'entraînement et de test
    */
    
    /**
     * 
     * @param {object} data
     * @param {bool} scale 
     * @param {bool} shuf 
     * @param {bool} split 
     * @param {float} splitSize 
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
     * returns {Object} 
     */
    getPrepData() {
        this.featuresLabels();
        let data;
        if (this.scale === true) this.stats();
        this.ordEncoder();
        if (this.shuf === true) this.shuffle();
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
     * train test
     * @params {float} pct entre 0 et 1 
     */
    splitData() {
        const nbr = parseInt(this.features.length * this.splitSize) 
        const xTrain = this.features.slice(0, this.features.length - nbr);
        const yTrain = this.labels.slice(0, this.features.length - nbr);
        const xTest = this.features.slice(-nbr, this.features.length);
        const yTest = this.labels.slice(-nbr, this.features.length);
        const data = {
            "Xtrain" : xTrain,
            "Xtest" : xTest,
            "Ytrain" : yTrain,
            "Ytest" : yTest
        }
        return data;
    }

    /**
     * mélange les données
     */
    shuffle() {
        const nbr = this.data.length;
        let index = Array.from(Array(nbr).keys())
        index = index.sort(() => Math.random() - 0.5);

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
            let uniques = [...new Set(this.labels)];
            for (let i = 0; i< uniques.length ; i++) {
                this.labelsDict[uniques[i]] = i;
                this.labelsDictInv[i] = uniques[i];
            }
            
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
        for (let i = 0; i < this.features[0].length; i++) {
            let provArray = [];
            for (let j = 0; j< this.features.length ; j++) {
                provArray.push(parseFloat(this.features[j][i]));
            }
            // min et max
            this.byCol[i]  = provArray;
            this.minMax["minmax"+i] =  [Math.min(...provArray), Math.max(...provArray)];
            this.minMax["moyenne"+i] = ( provArray.reduce((sommePartielle, a) => sommePartielle + a) ) / provArray.length;
        
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