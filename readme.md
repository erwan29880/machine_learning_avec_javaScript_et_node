# Machine learning avec javaScript ! 

Les modèles sont entraînés avec nodeJs (Express), les prédictions se font en back-end.  

Les bibliothèques javaScript utilisées : 
- Scikit Js 
- TensorflowJs

## Arbres de décision

Apprentissage sur le dataset des fleurs d'iris. 

![tree](./public/images/treePage.png)

## clustering  

Utilisation de l'algorithme KMeans sur l'ensemble du dataset des fleurs d'iris. Les graphiques sont réalisés avec ChartJs.

![cluster](./public/images/clusterPage.png)

## classification d'images  

Un modèle de réseaux de neurones à convolutions est entraîné* pour reconnaitre des chiffres manuscrits sur
le jeu de données mnist. 60000 images sont utilisées pour l'entraînement. Le modèle est converti au format Tensorflow Js.   

Un canvas html permet de tester le modèle : écrire un chiffre avec la souris et effectuer la prédiction.   

![digit](./public/images/digits.png)

* j'ai entraîné ce modèle from scratch en python avec TensorFlow-keras. Il est ensuite converti au format TensorflowJs. Ce modèle peut être librement partagé. L'accuracy sur les données de test est de 96%, sur les données d'entraînement de 98%. Precision et Recall n'ont pas été évalués. La matrice de confusion n'a pas été calculée.


## installation  

``` bash
npm install
```

Le site est disponible à l'adresse suivante :

> http://localhost:8080/


