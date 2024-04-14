const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    Campground = require('./models/campgrounds'),
    Comment = require('./models/comment'),
    seedDB = require('./seeds'),
    port = 5000,
    app = express();

    //CONNECT TO MONGODB DB
    mongoose.connect("mongodb://localhost/campDavid_");

    seedDB();

    //Middleware setup
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname,'public')));
    app.use(bodyParser.urlencoded({extended: true}));


    //Routes
    app.get('/', (req, res)=> {
        res.render('landing');
    });

    app.get('/campgrounds', (req, res)=> {
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

    //COMMENTS
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

    app.listen(port, ()=> {
        console.log(`server is running on port ${port}`);
    });