const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = require('./models/users'),
    Campground = require('./models/campgrounds'),
    Comment = require('./models/comment'),
    seedDB = require('./seeds'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    port = 5000,
    app = express();

    //CONNECT TO MONGODB DB
    mongoose.connect("mongodb://localhost/campDavid_");

    seedDB();

    //Middleware setup
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname,'public')));
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

    
    app.get('/', (req, res)=> {
        res.render('landing');
    });
    
    //Campground Routes
    app.get('/campgrounds',isLoggedIn, (req, res)=> {
        Campground.find()
        .then((campgrounds)=> {
            res.render('./campground/campgrounds', { campgrounds: campgrounds});
        })
        .catch((error)=> {
            console.error(error);
        })
    });

    app.get('/campgrounds/new', (req, res)=> {
        res.render('./campground/new');
    });

    app.post('/campgrounds', (req, res)=> {
        let name = req.body.name;
        let image = req.body.image;
        let desc = req.body.description;
        let newCamp = { name: name, image: image, description: desc}
        Campground.create(newCamp)
        .then((newCamp)=> {
            console.log(newCamp);
            res.redirect('/campgrounds');
        })
        .catch((error)=> {
            console.error(error);
        });
    });

    app.get('/campgrounds/:id', (req, res)=> {
        Campground.findById(req.params.id).populate("comments").exec()
        .then((foundCampground)=> {
            if (!foundCampground) {
                return res.status(404).send('campground not found');
            }
            res.render('./campground/show', {campground: foundCampground});
        })
    });

    //COMMENTS ROUTES
    app.get('/campgrounds/:id/comments/new', async(req, res)=> {
        const campground = await Campground.findById(req.params.id);
        if(!campground) {
            return res.status(404).send('campground not found');
        }
        res.render('./comments/new', {campground: campground});
    });

    app.post('/campgrounds/:id/comments', async(req, res)=> {
        try{
            //find camp by id
            const campground = await Campground.findById(req.params.id);
            if(!campground) {
                return res.status(404).send('campground not found');
            }
            //create a comment
            const comment = await Comment.create({
                author: req.body.author,
                text: req.body.text
            });
            //associate comments with the campground
            campground.comments.push(comment);
            //save the new comment with the campground
            await campground.save();
            //redirect back to show page
            res.redirect(`/campgrounds/${campground._id}`);
        } catch (error) {
            console.error(error);
        }
    });

    //AUTH ROUTES
    app.get('/login', (req, res)=> {
        res.render('login');
    });
    
    app.get('/register', (req, res)=> {
        res.render('register');
    });

    app.post('/register', async(req, res)=> {
        const { username, password} = req.body;
        try {
            const user = new User({username});
            const newUser = await User.register(user, password);
            console.log(newUser);
            passport.authenticate("local") (req, res, ()=> {
                res.redirect('/campgrounds');
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
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }));

    app.get('/logout', (req, res)=> {
        req.logout(()=> {
            res.redirect('/')
        });
    });

    //START THE SERVER
    app.listen(port, ()=> {
        console.log(`server is running on port ${port}`);
    });