const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

//Router routes
const adminData = require('./routes/admin');

//Middleware - always run next()
//Default response header is text/html for a string res
//Need bodyParser to parse req.body
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'css')));
//Imports from router
app.use('/admin', adminData.routes);

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found'});
});

//This creates the server
app.listen(3000);
