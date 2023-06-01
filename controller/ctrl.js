const express = require('express');
const tree = require('../ml/tree');
const cluster = require('../ml/kmeans');


exports.entry = (req, res) => {
    res.render('index');
};

exports.tree = (req, res) => {
    res.render('tree');    
};

exports.getTree =  (req, res, next) => {
    tr = new tree();
    tr.run()
    .then(val => {
        res.send(val);
        next();
    });
};

exports.clusterPage = (req, res) => {
    res.render('cluster');
};

exports.getCluster =  (req, res, next) => {
    tr = new cluster();
    tr.run()
    .then(val => {
        res.send(val);
        next();
    });
};

exports.digits = (req, res) => {
    res.render('digits');
}