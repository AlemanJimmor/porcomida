// Database
var usuarios = require('./routes/usuarios');

// Cargamos módulos Node
var express = require('express');
var exphbs  = require('express-handlebars');
var http = require('http');
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var configDB = require('./config/database.js');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin',  req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept, Origin');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) { res.send(200); } else { next(); }  // HANDLE OPTIONS VERB
}

// Creamos aplicación, servidor y sockets
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.VCAP_APP_PORT || 3000; //AppFog usa este puerto, por defecto 3000

// configuration ===============================================================
var opts = { native_parser: true };
mongoose.connect(configDB.url, opts); // connect to our database

require('./config/passport')(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// Almacén de usuarios
var users = [];
var na = {
                name: 'data.name',
                coords: [0, -23.818359375]
            };
// Almacenamos el usuario
users.push(na);

// Configuramos la aplicación, ver http://expressjs.com/api.html
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({defaultLayout: 'index'}));

app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));

app.use('/usuarios', usuarios);

// Routing
app.get('/', function(req, res) {
    res.render('index', {layout:false});
});

app.get('/busqueda', function(req, res) {
    res.render('busqueda', {layout:false});
});

app.get('/restaurants/:id', function(req, res) {
    res.render('restaurants', {layout:false});
});

app.get('/API', function(req, res) {
    res.render('api', {layout:false});
});

// Sockets io, ver http://socket.io/
io.set('transports', ['xhr-polling']); //AppFog usa Nginx
io.sockets.on('connection', function(socket) {
    // Escuchamos datos
    socket.on('send:coords', function (data) {

    	//Comprobamos si existe el usuario
        var exist = checkUser(data.name);

    	if (exist==false) {
    		var user = {
	            name: data.name,
	            coords: data.coords
	        };
	        // Almacenamos el usuario
	        users.push(user);
            console.log('Usuario Creado');
    	}

        else{
            console.log('Usuario Existente');
        }
        // Enviamos usuario a front
        setInterval(function emitir () {  socket.broadcast.emit('load:coords', user)},3000);
        
    });
    io.sockets.on('disconnect', function(){
    console.log('user disconnected');
  });
});

function checkUser(name) {
    console.log('objetojson:'+JSON.stringify(users));
     var len = users.length;
     console.log('length:'+users.length);
	for (var i = 0; i < len; i++) {
        console.log('jsonfor:'+JSON.stringify(users[i]));
        console.log('name:'+name);
    	if (users[i].name == name) {
            console.log('jsonforif:'+JSON.stringify(users[i]));
            return true;
    	}
    }
    return false;
}

//Iniciamos servidor
server.listen(port);

console.log('Servidor funcionando en http://localhost:' + port);

module.exports = app;