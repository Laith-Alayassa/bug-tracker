import express from "express";
import { User, Bug, bugSchema, Project, Person } from "../models/models.js";
import mon from "mongodb";
let router = express.Router();

router.get("/", (req, res) => {
  console.log("reached projects.js");
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

router.get("/:projectID", (req, res) => {
  console.log("reached projects id in project.js");
  if (req.isAuthenticated()) {
    let noProgress = 0;
    let inProgress = 0;
    let potentialFix = 0;
    let closed = 0;
    // project: mon.ObjectId(projectID)

    const projectID = req.params.projectID;

    if (projectID != "62b8f308430aa5eace438664") {
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

export { router as projects };
