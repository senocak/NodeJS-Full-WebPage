const mongoose = require('mongoose');
mongoose.connect('mongodb://157.230.22.123:27017/nodejs', { useNewUrlParser: true })
        .then(() =>  console.error('Connected to Mongo'))
        .catch(err => console.error('Something wrong', err))
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);