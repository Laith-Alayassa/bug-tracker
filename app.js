import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import moment from "moment";
import mongoose from "mongoose";
import path from "path";
import bcrypt from "bcrypt";
// update
import { User, Bug, bugSchema, Project, Person } from "./models/models.js";
// import { User, Bug, bugSchema } from "./models/models.js";
import { password } from "./password.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mon from "mongodb";

// setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "public")));
// app.use('/css', express.static(path.join(__dirname, ' /public/')))
// app.use('/vendor', express.static(path.join(__dirname, 'public')))
// app.use("/jquery", express.static(__dirname + "public/vendor/jquery"));
const saltRounds = 10;

// TODO: Fix this
// mongoose.connect(
//   `mongodb+srv://laithA:${password}@cluster0.rz2bq.mongodb.net/BugTrackerDB`,
//   { useNewUrlParser: true }
// );

mongoose.connect(
  process.env.MONGODB_URI ||
    `mongodb+srv://laithA:${password}@cluster0.rz2bq.mongodb.net/BugTrackerDB`,
  { useNewUrlParser: true }
);

app.locals.moment = moment;

let usersList;
User.find({}, (err, found) => {
  if (err) {
    console.log("error finding initial user List ");
  } else {
    usersList = found;
  }
});

// routes
app.get("/", (req, res) => {
  // res.send('hello from me')
  Bug.find({}, (err, bugList) => {
    if (err) {
      console.log("error finding bug");
      res.render("404");
    } else {
      res.render("bug-list", {
        bugList: bugList,
      });
    }
  });
});

app.get("/projects", (req, res) => {
  // res.send('hello from me')
  Project.find({}, (err, projectList) => {
    if (err) {
      console.log("error finding bug");
      res.render("404");
    } else {
      res.render("project-list", {
        projectList: projectList,
      });
    }
  });
});

app.get("/project/:projectID", (req, res) => {
  console.log("reached project id ");
  const projectID = req.params.projectID;
  console.log(mon.ObjectId(projectID));
  Bug.find({ project: mon.ObjectId(projectID) }, (err, foundBugs) => {
    if (err) {
      console.log("error finding bug by id");
    } else {
      console.log(foundBugs);
      res.render("project-view", {
        bugList: foundBugs,
      });
    }
  });
});

app.get("/new-bug", (req, res) => {
  let projectList;
  Project.find({}, (err, foundProjects) => {
    if (err) {
      console.log("error finding project in new bug");
    } else {
      projectList = foundProjects;
    }
  });
  User.find({}, (err, usersList) => {
    if (err) {
      console.log("error in new bug");
    } else {
      res.render("new-bug", {
        usersList: usersList,
        projectList: projectList,
      });
    }
  });
});

app.post("/new-bug", (req, res) => {
  const newBugName = req.body.name;
  const newBugDescription = req.body.description;
  const newBugImportance = req.body.importance;
  const newBugProgress = req.body.progress;
  let newBugProject = req.body.project;

  let newBugDuty;
  // finding duty using the id of the user
  User.findById(req.body.duty, (err, foundUser) => {
    if (err) {
      console.log("coudlnt find user with that id");
    } else {
      console.log(foundUser + "the duty ---------------=-");
      let newBug = Bug({
        name: newBugName,
        description: newBugDescription,
        importance: newBugImportance,
        duty: foundUser,
        progress: newBugProgress,
        project: newBugProject,
        time: new Date(),
      });

      newBug.save((err) => {
        if (err) {
          console.log("error saving new bug");
        } else {
          res.redirect("/");
        }
      });
    }
  });
});

// Bug view
app.get("/bug/:bugID", (req, res) => {
  const bugID = req.params.bugID;

  Bug.findById(bugID, (err, foundBug) => {
    if (err) {
      console.log("error finding bug by id");
    } else {
      res.render("bug-view", {
        bug: foundBug,
      });
    }
  });
});

// Edit
app.get("/edit/:bugID", (req, res) => {
  const bugID = req.params.bugID;
  console.log(bugID + "REACHED GET IN EDIT");
  Bug.findOne({ _id: bugID }, (err, found) => {
    if (err) {
      console.log("nopppppppppp");
    } else {
      console.log(found + "this is the found one");
      console.log("no error in findOne edit get ");
      res.render("edit-view", {
        bug: found,
        usersList: usersList,
      });
    }
  });
});

app.post("/edit/:bugID", (req, res) => {
  const bugID = req.params.bugID;
  const userID = req.body.duty;
  // console.log(userID + 'USER ID');
  // let dutyPerson;
  // let update;
  User.find({ _id: userID }, (err, foundUser) => {
    if (err) {
      console.log("error in post edit form");
    } else {
      // dutyPerson = foundUser;
      console.log(foundUser + "-=found user in post-=-=-=-=-=");
      let update = {
        _id: bugID,
        name: req.body.name,
        description: req.body.description,
        progress: req.body.progress,
        duty: foundUser,
        importance: req.body.importance,
      };
      Bug.findByIdAndUpdate(
        { _id: bugID },
        update,
        { multi: true, new: true },
        (err) => {
          if (err) {
            console.log("error in updateing in edit");
          } else {
            console.log("reached else in findone and update in edit page");
          }
        }
      );
      res.redirect("/");
    }
  });
});

// Delete
app.get("/delete/:bugID", (req, res) => {
  const bugID = req.params.bugID;
  Bug.deleteOne({ _id: bugID }, (err) => {
    if (err) {
      console.log("error deleteing bug");
    } else {
      console.log("deleted bug");
      res.redirect("/");
    }
  });
});

app.get("/blank", (req, res) => {
  res.render("blank");
});

// login
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const userName = req.body.username;
  const userPassword = req.body.password;
  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    if (err) {
      console.log(error);
    } else {
      console.log(hash);
    }

    bcrypt.compare(userPassword, hash, function (err, result) {
      console.log(result + '======');
    });
  });

  console.log(`user name : ${userName}, and password : ${userPassword}`);
  res.render("register");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

// TODO: create a page to add new bugs
// TODO: enable clicking on the bugs to go to a unique page for the bug
