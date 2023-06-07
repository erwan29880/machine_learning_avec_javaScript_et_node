const express = require('express');
const controller = require('../controller/ctrl');
const router = express.Router();

router.get('/', controller.entry)
router.get('/tree', controller.tree);
router.get('/treeGet', controller.getTree);
router.get('/cluster', controller.clusterPage);
router.get('/clusterGet', controller.getCluster);
router.get('/digits', controller.digits);
router.get('/timeserie', controller.engie);
router.get('/timeserieGet', controller.engieGet);
router.get('/regression', controller.regression);

module.exports = router