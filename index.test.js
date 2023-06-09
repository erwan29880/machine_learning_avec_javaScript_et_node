const assert = require('assert').strict;
const processTest = require('./ml/process');
const iris = require('./datasets/iris.json');
const treeTest = require('./ml/tree');
const metricsTest = require('./ml/metricsIris');


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