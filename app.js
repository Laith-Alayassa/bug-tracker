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
import session from "express-session";
import passport from "passport";
import e from "express";

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
app.set("views", "views");
app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret:
      "I know that you can see this , but it is 2 am and I cannot think straight",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/help", (req, res) => {
  res.render("help", {
    isAuthenticated: req.isAuthenticated(),
    title: "How to?",
  });
});

// routes
app.get("/all-bugs", (req, res) => {
  if (req.isAuthenticated()) {
    let noProgress = 0;
    let inProgress = 0;
    let potentialFix = 0;
    let closed = 0;

    Bug.find({}, (err, found) => {
      if (err) {
        console.log(err);
      } else {
        console.log("else in /allbugs");
      }
    });
    Bug.find({}, {}, { sort: { time: -1 } }, function (err, bugList) {
      if (err) {
        console.log("error finding bug");
        res.redirect("/404");
      } else {
        bugList.forEach((bug) => {
          if (bug.progress == "no-progress") {
            noProgress += 1;
          }
          if (bug.progress == "in-progress") {
            inProgress += 1;
          }
          if (bug.progress == "potential-fix") {
            potentialFix += 1;
          }
          if (bug.progress == "closed") {
            closed += 1;
          }
        });
        res.render("bug-list", {
          bugList: bugList,
          lastN: bugList.slice(0, 4),
          noProgress: noProgress,
          potentialFix: potentialFix,
          inProgress: inProgress,
          closed: closed,
          isAuthenticated: req.isAuthenticated(),
          title: "All Bugs",
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/projects", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  Project.find({}, (err, projectList) => {
    if (err) {
      console.log("error finding bug");
      res.redirect("/404");
    } else {
      res.render("project-list", {
        projectList: projectList,
        isAuthenticated: req.isAuthenticated(),
        title: "Projects",
      });
    }
  });
});

app.get("/project/:projectID", (req, res) => {
  if (req.isAuthenticated()){
    let noProgress = 0;
    let inProgress = 0;
    let potentialFix = 0;
    let closed = 0;
    // project: mon.ObjectId(projectID)

    const projectID = req.params.projectID;

    if (projectID != '62b8f308430aa5eace438664'){
      Bug.find(
        { project: mon.ObjectId(projectID) },
        {},
        { sort: { time: -1 } },
        function (err, bugList) {
          if (err) {
            console.log("error finding bug");
            res.redirect("/404");
          } else {
            bugList.forEach((bug) => {
              if (bug.progress == "no-progress") {
                noProgress += 1;
              }
              if (bug.progress == "in-progress") {
                inProgress += 1;
              }
              if (bug.progress == "potential-fix") {
                potentialFix += 1;
              }
              if (bug.progress == "closed") {
                closed += 1;
              }
            });
            console.log(bugList);
            res.render("project-view", {
              bugList: bugList,
              lastN: bugList.slice(0, 4),
              noProgress: noProgress,
              potentialFix: potentialFix,
              inProgress: inProgress,
              closed: closed,
              isAuthenticated: req.isAuthenticated(),
              title: "Project view",
            });
          }
        }
      );
    } else {
      Bug.find(
        { project: mon.ObjectId(projectID) },
        {},
        function (err, bugList) {
          if (err) {
            console.log("error finding bug");
            res.redirect("/404");
          } else {
            bugList.forEach((bug) => {
              if (bug.progress == "no-progress") {
                noProgress += 1;
              }
              if (bug.progress == "in-progress") {
                inProgress += 1;
              }
              if (bug.progress == "potential-fix") {
                potentialFix += 1;
              }
              if (bug.progress == "closed") {
                closed += 1;
              }
            });
            console.log(bugList);
            res.render("project-view", {
              bugList: bugList,
              lastN: bugList.slice(0, 4),
              noProgress: noProgress,
              potentialFix: potentialFix,
              inProgress: inProgress,
              closed: closed,
              isAuthenticated: req.isAuthenticated(),
              title: "Project view",
            });
          }
        }
      ); 
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/new-bug", (req, res) => {
  let projectList;
  Project.find({}, (err, foundProjects) => {
    if (err) {
      console.log("error finding project in new bug");
    } else {
      projectList = foundProjects;
      User.find({}, (err, usersList) => {
        if (err) {
          console.log("error in new bug");
        } else {
          res.render("new-bug", {
            usersList: usersList,
            projectList: projectList,
            isAuthenticated: req.isAuthenticated(),
            title: "New Bug",
          });
        }
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
          res.redirect("/all-bugs");
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
        isAuthenticated: req.isAuthenticated(),
        title: "Single Bug",
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
        isAuthenticated: req.isAuthenticated(),
        title: "Edit Bug",
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
        duty: foundUser[0],
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
      res.redirect("/all-bugs");
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
  res.render("blank", {
    isAuthenticated: req.isAuthenticated(),
    title: "blank",
  });
});

// login
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/projects");
  } else {
    res.render("login2", {
      title: "login",
      isAuthenticated: req.isAuthenticated(),
    });
  }
});

app.post("/login", (req, res) => {
  let person;

  // Demo login to bypass registration
  if (req.body.hasOwnProperty("demo")) {
    req.body.username = "test11";
    req.body.password = "test11";
    person = new Person({
      username: req.body.username,
      password: req.body.password,
    });
  } else {
    person = new Person({
      username: req.body.username,
      password: req.body.password,
    });
  }

  req.login(person, (err) => {
    if (err) {
      console.log(err);
      res.redirect("/404");
    } else {
      passport.authenticate("local", {
        successRedirect: "/projects",
        failureRedirect: "/404",
      })(req, res, () => {
        res.redirect("/projects");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/projects");
  } else {
    res.render("register", {
      title: "Register",
      isAuthenticated: req.isAuthenticated(),
    });
  }
});

app.post("/register", (req, res) => {
  Person.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/404");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/all-bugs");
        });
      }
    }
  );
});

app.get("/success", (req, res) => {
  console.log("reached success");
  if (req.isAuthenticated()) {
    res.render("success", {
      isAuthenticated: req.isAuthenticated(),
      title: "Success",
    });
  } else {
    console.log("not nice login mate");
    res.redirect("/login");
  }
});

app.get("/about", (req, res) => {
  res.render("about", {
    isAuthenticated: req.isAuthenticated(),
    title: "about",
  });
});

app.get("/404", (req, res) => {
  res.render("404", {
    title: "404",
    isAuthenticated: req.isAuthenticated(),
  });
});

app.get("/account", (req, res) => {
  if (req.isAuthenticated()) {
    res.locals.currentUser = req.user;
    let bugList;
    Bug.find({ "duty.name": res.locals.currentUser.username }, (err, found) => {
      if (err) {
        console.log(err);
      } else {
        bugList = found;
        res.render("account-view", {
          bugList: bugList,
          isAuthenticated: req.isAuthenticated(),
          title: "Account",
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/plot", (req, res) => {
  let noProgress = 0;
  let inProgress = 0;
  let potentialFix = 0;
  let closed = 0;

  Bug.find({}, (err, found) => {
    if (err) {
      console.log(err);
    } else {
      found.forEach((bug) => {
        if (bug.progress == "no-progress") {
          noProgress += 1;
        }
        if (bug.progress == "in-progress") {
          inProgress += 1;
        }
        if (bug.progress == "potential-fix") {
          potentialFix += 1;
        }
        if (bug.progress == "closed") {
          closed += 1;
        }
      });

      res.render("plot", {
        noProgress: noProgress,
        potentialFix: potentialFix,
        inProgress: inProgress,
        closed: closed,
      });
    }
  });
});




// RESTFUL API 
app.get("/api/all-bugs", (req, res) => {
  Bug.find({}, (err, found) => {
    if (err) {
      res.send('303')
    } else {
      res.send({
        "request" : "GET",
        "bugs" : found
      })
    }
  });
});


app.post("/api/new-bug", (req, res) => {
  const newBugName = req.query.name;
  const newBugDescription = req.query.description;
  const newBugImportance = req.query.importance;
  const newBugProgress = req.query.progress;
  let newBugProject = req.query.project;

  console.log(newBugName,
    newBugDescription,
    newBugImportance,
    newBugProgress,
    newBugProject);
  let newBugDuty;
  // finding duty using the id of the user
  User.findById(req.query.duty, (err, foundUser) => {
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
          res.send({
            'status' : 'success'
          });
        }
      });
    }
  });
});





const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

// TODO: Project page with assigned people and tickets for the project
// TODO: User page with assigned projects and roles
// TODO: Ticket page with ability to add comments
