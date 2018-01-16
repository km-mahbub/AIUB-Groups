const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const socketIO = require('socket.io');
const {Users} = require('./helpers/UsersClass');
const {Global} = require('./helpers/Global');

const container = require('./container');


container.resolve(function(users,_,admin,home,group, results, privatechat){

  mongoose.Promise = global.Promise;
  //mongoose.connect('mongodb://localhost/footballkik',{useMongoClient: true});
  mongoose.connect('mongodb://localhost/aiub-groups');

  const app = SetupExpress();

  function SetupExpress(){
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);
    server.listen(3000,()=>{
      console.log('Listening to port 3000');
    });

    ConfigureExpress(app);

    require('./socket/groupchat.js')(io, Users);
    require('./socket/friend.js')(io);
    require('./socket/globalroom.js')(io, Global, _);
    require('./socket/privatemessage.js')(io);

    const router = require('express-promise-router')();
    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);
    results.SetRouting(router);
    privatechat.SetRouting(router);

    app.use(router);
  };



  function ConfigureExpress(app){

    require('./passport/passport-local');
    require('./passport/passport-facebook');
    require('./passport/passport-google');

    app.use(express.static('public'));
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));

    app.use(validator());
    app.use(session({
      secret: 'this is a secret key',
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({mongooseConnection: mongoose.connection})
    }));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals._ = _;
  };
});
