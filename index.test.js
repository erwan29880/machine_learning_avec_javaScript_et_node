const assert = require('assert').strict;
const timeserieTest = require('./ml/timeserie');
const processTest = require('./ml/process');
const iris = require('./datasets/iris.json');
const treeTest = require('./ml/tree');
const kmeansTest = require('./ml/kmeans');
const metricsTest = require('./ml/metricsIris');
const scaler = require('./ml/scaler');
const poly = require('./ml/polynomialFeatures');


describe("tests de la classe timeserie", () => {
    it("vérifier le chargment du fichier json", () => {
        cl = new timeserieTest();
        res = cl.to2dDataset();
        assert.strictEqual(15125, res["data"][0][0]);
    });
});


describe('tests de la classe process', () => {
    beforeEach(() => {
        this.cl = new processTest(iris, true, true, true, 0.2);
        this.cl.featuresLabels();
    });

    it("test mise en array des données", () => {
        assert.strictEqual(this.cl.features.length, 150);
    });

    it("test de la mise à l'échelle des données", () => {
        this.cl.stats();
        const arr = [];
        for (let i = 0; i < this.cl.features.length; i++) {
            for (let j = 0; j < this.cl.features[i].length; j++) {
                arr.push(this.cl.features[i][j]);
            }
        }
        const min = (Math.min(...arr) > -3.5);
        const max = (Math.max(...arr) < 3.5);
        assert.strictEqual(true, min);
        assert.strictEqual(true, max);
    });

    it("test de l'encodage de la target", () => {
        this.cl.ordEncoder;
        const test = [...new Set(this.cl.labels)];
        assert.strictEqual(test.length, 3);
    });

    it("test shuffle", () => {
        const feature1 = this.cl.features[0];
        this.cl.shuffle();
        const feature2 = this.cl.features[0];
        assert.notStrictEqual(feature1, feature2);
    });

    it("test train test split", () => {
        const res = this.cl.splitData();
        assert.strictEqual(res['Xtrain'].length, res['Ytrain'].length);
        assert.strictEqual(res['Xtest'].length, res['Ytest'].length);
        assert.notStrictEqual(this.cl.features.length, res['Xtrain'].length);
    });

    it("fonction run principale", () => {
        const res = this.cl.getPrepData();
        let inc = 0;
        for (list in res) {
            inc++;
        }
        assert.strictEqual(4, inc);
    });
});


describe("test de la classe tree", () => {
    it("test de la fonction principale", () => {
        const cl = new treeTest();
        return cl.run()
            .then((res) => {
                assert.notStrictEqual(0, res["prediction"].length);
                assert.notStrictEqual(0, res["reel"].length);
                assert.notStrictEqual(0, res["labels"].length);
                assert.notStrictEqual(0, res["matriceDeConfusion"].length);
                assert.notStrictEqual(0, res["metrics"].length);

            });        
    });
});


describe("test de la classe kmeans", () => {
    beforeEach(() => {
        this.cl = new kmeansTest();
    });

    it("vérification petals sepals", () => {
        this.cl.petalsSepals();
        assert.strictEqual(this.cl.sepals.length, this.cl.petals.length);
    });

    it("vérification pca", () => {
        this.cl.petalsSepals();
        const len = this.cl.petals[0].length;
        this.cl.pca();
        assert.notStrictEqual(1, len);
    });

    it("test de la fonction principale", async () => {
        return this.cl.run()
            .then((res) => {
                let counte = 0;
                
                for (let counter of res['prediction']) {
                    counte += counter;
                }

                let x = 0;
                for (let classe of res['data']) {
                    for (let dict of classe) {
                        x += 1;    
                    }
                }
                assert.strictEqual(counte, x);
            });
    });
});


describe("test de la classe metrics iris", () => {
    beforeEach(() => {
        this.yTrue = [0, 1, 2, 0, 1, 2, 0, 1, 2];
        this.yPred = [0, 0, 0, 1, 1, 1, 2, 2, 2];
        this.nbLabels = 3;
        this.cl = new metricsTest(this.yTrue, this.yPred);
    });

    it("test matrice de confusion", async () => {
        this.cl.confusionMatrix()
            .then((res) => {
                assert.strictEqual(this.nbLabels, res.length);
            });
    });

    it("test perfMesurement", () => {
        const res = this.cl.perfMesurement(this.yTrue, this.yPred);
        const test = (res === undefined);
        assert.notStrictEqual(test, true);
    });

    it("test sepClasse", () => {
        const res = this.cl.sepClasse(this.yTrue, this.yPred, 0);
        const test = (res === undefined);
        assert.notStrictEqual(test, true);
    });


    it("test metricsByClass", () => {
        const res = this.cl.metricsByClass(this.yTrue, this.yPred);
        const test = (res === undefined);
        assert.notStrictEqual(test, true);
    });

    it("test recall et precision", () => {
        const res = this.cl.metricsByClass(this.yTrue, this.yPred);
        let test = 0;
        for (let nb of res) {
            test++;
        }
        assert.strictEqual(this.nbLabels, test);
    });
});