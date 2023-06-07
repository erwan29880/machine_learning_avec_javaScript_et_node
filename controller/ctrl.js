const express = require('express');
const tree = require('../ml/tree');
const cluster = require('../ml/kmeans');
const lstm = require('../ml/timeserie');


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
};

exports.engie = (req, res) => {
    res.render('timeserie');
};

exports.engieGet = (req, res, next) => {
    const cl = new lstm();
    const data = cl.to2dDataset();
    res.send(data);
    next();
};

exports.regression = (req, res) => {
    res.render('regression');
}