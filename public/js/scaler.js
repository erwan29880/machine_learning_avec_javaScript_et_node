class Scaler {

    /**
    * @param {array} featureRange [-1, 1] [0, 1], ['std', 'moy'] 
    * @param {x} array  doit pouvoir être converti en tensor2d
    */
    constructor(featureRange, x) {
        this.featureRange = featureRange[0];
        this.features = x;
        this.min = undefined;
        this.max = undefined;
        this.mean = undefined;
        this.std = undefined;
    }


    /**
     * retourne un tenseur mis à l'échelle : 
     *      entre -1 et 1 ou
     *      entre 0 et 1 ou
     *      avec une moyenne = 0 et un écart-type de 1
     * @returns {tensor}
     */
    scale() {
        let t1 = this.features;

        // garder en mémoire min et max pour inverser l'échelle
        this.min = t1.min(0, false);
        this.max = t1.max(0, false);
        
        let scaled = t1.sub(this.min).div(this.max.sub(this.min));
        
        // échelle 0, 1
        if (this.featureRange === 0) {
            return scaled;
        }
        
        // échelle -1, 1
        if (this.featureRange === -1) {
            return scaled.mul(tf.scalar(2)).sub(tf.scalar(1));
        }  
        
        // moyenne à 0 et écart-type de 1
        if (this.featureRange === 'std') {
            // garder en mémoire moyenne et écart-type pour inverser l'échelle
            this.mean = t1.mean(0, false);
            this.std = ((t1.sub(this.mean)).square())
                            .div(tf.scalar(t1.shape[0]))
                            .sum(0, false)
                            .sqrt();
                            
            return t1.sub(this.mean).div(this.std);
        }
        return scaled;
        }

    /**
     * inverse la mise à l'échelle
     * @param {tensor} yHat 
     * @returns {tensor}
     */
    inverseScale(yHat) {
      
        // échelle 0, 1
        if (this.featureRange === 0) {
            return (yHat.mul((this.max).sub(this.min))).add(this.min);
        }

        // échelle -1, 1
        if (this.featureRange === -1) {
            let invScaled = yHat.add(tf.scalar(1)).div(tf.scalar(2))
            invScaled = (invScaled.mul((this.max).sub(this.min))).add(this.min);
            return invScaled;
        }

        // moyenne à 0 et écart-type de 1
        if(this.featureRange === 'std') {
            return yHat.mul(this.std).add(this.mean);
        }

        return (yHat.mul((this.max).sub(this.min))).add(this.min);
    }
}