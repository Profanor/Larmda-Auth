const Campground = require('./models/campgrounds');
const Comment = require('./models/comment')

let data = [
    {
        name: 'YellowStone',
        image: 'https://www.mippin.com/wp-content/uploads/2019/11/camping.jpg',
        description: 'It is not yellow'
    },
    {
        name: 'Granite Hill',
        image: 'https://camperpanda.com/wp-content/uploads/2021/06/4-Season-Tent.jpg',
        description: 'just pure rock'
    },
    {
        name: 'Silent Hill',
        image: 'https://th.bing.com/th/id/R.af4793e5069f2a260db0e9ef117b358e?rik=Y8skFLQqpNh9zw&pid=ImgRaw&r=0',
        description: 'It is not yellow'
    }
]

 async function seedDB() {
    try {
        await Campground.deleteMany({})
        console.log('campgrounds removed successfully');

        const campgrounds = await Campground.create(data);
        console.log('campgrounds created successfully');

        //create a comment for each campground

        for (const campground of campgrounds) {
            const comment = await Comment.create({
                text: 'This is a great place!',
                author: 'David Arinze'
            });
                campground.comments.push(comment);
                //save the campground with the new comment
                await campground.save()
            }
            console.log('comments added to campgrounds successfully');

        } catch(error) {
            console.error('error seeding campground:', error);
        }   
    }

module.exports = seedDB;