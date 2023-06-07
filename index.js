const express = require('express');
const app = express();
const path = require('path');
const routes = require('./router/routes')

const port = 8080;
 
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
    console.log(`app listening on port ${port} !`)
});