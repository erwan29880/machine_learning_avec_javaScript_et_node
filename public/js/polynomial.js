class polynomialFeatures {

    // transformation polynomiale des features

    /**
     * @param {integer} degree 
     * @param {object} x tableau 2d des features
     * @params {boolean}  includeBias 
     */
    constructor(degree, x, includeBias) {
        this.degree = degree;
        this.features = x;
        this.includeBias = includeBias;
        this.nbrFeatures = undefined;
        this.exportNbFeatures = undefined;
    }


    // trouver le nombre de features
    getShape() {
        if (typeof this.features[0] == "object") {
            this.nbrFeatures = this.features[0].length;
        } else {
            this.nbrFeatures = 1;
        }
    }

    getNewFeaturesList() {
        const li = [];
        let inc = 2; // degré minimal

        // récupérer le nombre de features
        this.getShape();

        // retourne une erreur si le degré est mal renseigné
        if (this.degree < 2) {
            throw new Error("le degré doit être d'au moins 2");
        }

        // cas ou le tableau est en 1d
        if (this.nbrFeatures === 1) {
            for (let i = 0 ; i < this.features.length ; i++) {
                inc = 2;
                let prov;
                if (this.includeBias === true) {
                    prov = [1, this.features[i]];
                } else {
                    prov = this.features[i];
                }
                
                while (inc < this.degree) {
                    prov.push(Math.pow(this.features[i], inc ));
                    inc++;
                }
                li.push(prov);
            }
            this.exportNbFeatures = li[0].length;
            return li;
        }


        // cas tableau 2d
        for (let i = 0 ; i < this.features.length ; i++) {

            // copier les features
            const prov = [...this.features[i]];

            // mettre les features aux puissances 2, 3 etc jusqu'à this.degree
            inc = 2;
            while (inc <= this.degree) {
                for (let j = 0 ; j < this.features[i].length ; j++) {                
                    prov.push(Math.pow(this.features[i][j], inc ));  
                }   
                inc++;   
            }
            
            // multiplier tous les features avec les autres features
            for (let j = 0 ; j < this.nbrFeatures ; j++) {
                for (let k = 0 ; k < this.nbrFeatures; k++) {
                    if (k > j) {
                        prov.push(this.features[i][k] * this.features[i][j]);
                    }
                }
            }

            // ajouter le biais
            if (this.includeBias === true) {
                prov.push(1);
            }
            li.push(prov); 
        }
        this.exportNbFeatures = li[0].length;
        return li;
    }
}