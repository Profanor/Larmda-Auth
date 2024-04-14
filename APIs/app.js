const axios = require('axios');
const express = require('express');
const port = 4000;
const app = express();

app.set('view engine', 'ejs');

const baseURL = 'http://api.weatherapi.com/v1';
const apiMethod = '/current.json';
const apiKey = '91cf2489182048b8b61135517241103';
const location = 'New York';

const url = `${baseURL}${apiMethod}?key=${apiKey}&q=${encodeURIComponent(location)}}`

app.get('/', async(req, res)=> {
    try {
        const response = await axios.get(url)
        console.log('response:', response.data);
        res.render('weather', {weather: response.data});
    } catch(error) {
        console.error('error:', error);
    }
});    
app.listen(port, ()=> {
    console.log(`server is running on port ${port}`);
});