


import passport from "passport";
import passportLocalMongoose from 'passport-local-mongoose'
import { mongoose } from "mongoose";
// Creating a user schema and model

const userSchema = mongoose.Schema({
    name : String,
    role : {
        type : String,
        enum : ['admin', 'developer', 'submitter']
    }
});

export const User = new mongoose.model('user', userSchema);




// Creating bug schema and Model 📝

export const bugSchema = mongoose.Schema({
    name: String,
    description : String,
    importance :  {
        type : Number,
        max : 5,
        min : 1
    },
    progress : {
        type: String,
        enum: ['closed', 'in-progress', 'potential-fix', 'no-progress'],
    },
    duty : userSchema,
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project'
    },
    time : Date
});


export const Bug = mongoose.model('bug', bugSchema);



const projectSchema = mongoose.Schema({
    name : String,
    created: {
        type: Date,
        default: Date.now
      }
    });

export const Project = mongoose.model('project', projectSchema);



const personSchema = mongoose.Schema({
    username:{ 
        type: String,
        unique: true
      },
      hashedPassword: String
    });

personSchema.plugin(passportLocalMongoose);

export const Person = mongoose.model('person', personSchema);

passport.use(Person.createStrategy());
passport.serializeUser(Person.serializeUser());
passport.deserializeUser(Person.deserializeUser());

// const firstBug = new Bug({
//    name: 'mongoose database not created',
//    description: 'creating a mongoose data base using the url but cannot find it in the mongo show db in the terminal',
//    importance: 4,
//    progress : "closed",
//    duty : "laith", // TODO: make this an instance of another database
//    time : new Date()
// });

// const secondBug = new Bug({
//     name: 'cannot read js files',
//     description: 'Express cannot find the path to JS files, might need to change we express is searching or change the location of js files',
//     importance: 3,
//     progress : "potential-fix",
//     duty : "laith", // TODO: make this an instance of another database
//     time : new Date()
// })

// const thirdBug = new Bug({
//     name: 'long date format',
//     description: 'the date and time format in the bugs table is too long, making it MM-DD-YY would be better',
//     importance: 1,
//     progress : "no-progress",
//     duty : "laith", // TODO: make this an instance of another database
//     time : new Date()
// });



// const fourthBug = new Bug({
//     name: 'no user db',
//     description: 'the user is simply a string, while I need it to be a db of users',
//     importance: 5,
//     progress : "no-progress",
//     duty : laith, // TODO: make this an instance of another database
//     time : new Date()
// });



