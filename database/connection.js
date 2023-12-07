const mongoose = require('mongoose');

module.exports = (URI) => { return mongoose.connect(URI)
}