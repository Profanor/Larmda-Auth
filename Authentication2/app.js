const express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./models/users'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    port = 4000

const app = express();
mongoose.connect("mongodb://localhost/auth_app2");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//express-session
app.use(require("express-session")({
    secret: "i love games",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//configure passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

//middleware to check if user is loggedin
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
//routes
app.get('/', (req ,res)=> {
    res.render('home');
});

app.get('/login', (req, res)=> {
    res.render('login');
});

app.get('/register', (req, res)=> {
    res.render('register');
})

app.get('/secret', isLoggedIn, (req, res)=> {
    res.render('secret');
})

//AUTH ROUTES
app.post('/register', async(req, res)=> {
    const { username, password} = req.body;
    try {
        const user = new User({username});
        const newUser = await User.register(user, password);
        console.log(newUser);
        passport.authenticate("local") (req, res, ()=> {
            res.redirect('/secret');
        });
    } catch(error) {
        if (error.name === 'UserExistsError') {
            return res.status(409).send('User already exists')
        }
        console.error(error);
        res.status(500).send('Registration failed')
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}));

app.get('/logout', (req, res)=> {
    req.logout(()=> {
        res.redirect('/')
    });
});


app.listen(port, ()=> {
    console.log(`server is running on port ${port}`);
});