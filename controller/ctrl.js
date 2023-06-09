const express = require('express');
const tree = require('../ml/tree');


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


exports.digits = (req, res) => {
    res.render('digits');
};

exports.engie = (req, res) => {
    res.render('timeserie');
};

exports.regression = (req, res) => {
    res.render('regression');
}