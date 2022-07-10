import express from "express";
import { User, Bug, bugSchema, Project, Person } from "../models/models.js";
let router = express.Router();

// RESTFUL API
router.get("/all-bugs", (req, res) => {
  console.log("reached api.ks");
  Bug.find({}, (err, found) => {
    if (err) {
      res.send("303");
    } else {
      res.send({
        request: "GET",
        bugs: found,
      });
    }
  });
});

router.post("/new-bug", (req, res) => {
  const newBugName = req.query.name;
  const newBugDescription = req.query.description;
  const newBugImportance = req.query.importance;
  const newBugProgress = req.query.progress;
  let newBugProject = req.query.project;

  console.log(
    newBugName,
    newBugDescription,
    newBugImportance,
    newBugProgress,
    newBugProject
  );
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
            status: "success",
          });
        }
      });
    }
  });
});

export {router as api}