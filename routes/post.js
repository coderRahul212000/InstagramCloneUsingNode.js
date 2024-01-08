const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:pqA6XVXoFGbYglAX@cluster0.kkq0t1t.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connected!'));

const postSchema = mongoose.Schema({
  picture:String,
  user:{
    type:mongoose.Schema.Types.ObjectId, //storing the id of the user who is posting
    ref:'user'
  },
  caption:String,
  date:{
    type:Date,
    default: Date.now()
  },
  likes:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
    }
  ]
  
})

module.exports = mongoose.model("post", postSchema)