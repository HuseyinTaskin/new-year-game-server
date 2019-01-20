const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Data = require("./data");

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

const API_PORT = process.env.PORT || 3001;
const app = express();
const router = express.Router();

const dbRoute = "mongodb://localhost:27017/newyear";

mongoose.connect(
  dbRoute,
  { useNewUrlParser: true, useCreateIndex: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

roll = () => {
  res = Math.round(Math.random() * 5) + 1;
  return res;
};

rollNot = () => {
  res = Math.round(Math.random() * 55) + 11;
  return res;
};

fifty = () => {
  res = Math.round(Math.random() * 5) + 1;
  if (res > 3) return 1;
  return -1;
};

const RiskRange = 777;
rollRisk = () => {
  res = Math.round(Math.random() * RiskRange * 2) - RiskRange; // +-RiskRange
  return res;
};

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  let user = new Data();
  if ((!userName && userName !== 0) || (!password && password !== 0)) {
    return res.json({
      success: false,
      error: "Invalid username or password."
    });
  }
  usr = await Data.findOne({ userName, password }).exec();

  if (usr) {
    return res.json({ success: true, user: usr });
    //} else return res.json({ success: false, error: "no such user exist" });
  } else {
    user.userName = userName;
    user.password = password;
    await user.save(err => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, user });
    });
  }
});

router.post("/play", async (req, res) => {
  const { userName, password } = req.body;
  let user = new Data();
  if ((!userName && userName !== 0) || (!password && password !== 0)) {
    return res.json({
      success: false,
      error: "Invalid username or password."
    });
  }
  usr = await Data.findOne({ userName, password }).exec();
  dice = roll();
  if (usr) {
    //exist user
    user.userName = usr.userName;
    user.score = usr.score + dice;
    await Data.updateOne(
      { _id: usr._id },
      { score: user.score, $inc: { click1: 1 } }
    ).then(docs => {
      if (docs) {
        return res.json({ success: true, user, dice });
      } else {
        return res.json({ success: false, user: "no such user exist" });
      }
    });
  } else return res.json({ success: false, error: "no such user exist" });
});

router.post("/risk", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName && userName !== 0) {
    return res.json({ success: false, error: "INVALID USER NAME" });
  }
  user = await Data.findOne({ userName, password }).exec();
  dice = rollRisk();
  if (user) {
    await Data.updateOne({ userName: user.userName }, { $inc: { click2: 1 } });
    randomUser = null;
    while (!randomUser || randomUser.userName === userName) {
      array = await Data.aggregate([{ $sample: { size: 1 } }]);
      randomUser = array[0];
    }
    await Data.updateOne({ userName }, { $inc: { score: dice } });
    user = await Data.findOne({ userName }).exec();

    await Data.updateOne(
      { userName: randomUser.userName },
      { $inc: { score: dice * -1 } }
    );
    return res.json({
      success: true,
      user,
      randomUser,
      dice
    });
  } else return res.json({ success: false, error: "error" });
});

router.post("/fifty", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName && userName !== 0) {
    return res.json({ success: false, error: "INVALID USER NAME" });
  }
  user = await Data.findOne({ userName, password }).exec();
  win = fifty();
  console.log("win: " + win);
  if (user) {
    await Data.updateOne({ userName: user.userName }, { $inc: { click4: 1 } });
    randomUser = null;
    while (!randomUser || randomUser.userName === userName) {
      array = await Data.aggregate([{ $sample: { size: 1 } }]);
      randomUser = array[0];
    }

    userScore = user.score;
    randomUserScore = randomUser.score;
    if (userScore == 0) userScore = 0.1;
    if (randomUserScore == 0) randomUserScore = 0.1;

    if (win > 0) {
      dice = Math.round(randomUserScore / 2);
      await Data.updateOne({ userName }, { $inc: { score: dice } });
      await Data.updateOne(
        { userName: randomUser.userName },
        { $inc: { score: dice * -1 } }
      );
      randomUser.score -= dice;
      user.score += dice;
    } else {
      dice = Math.round(userScore / 2) * -1;
      await Data.updateOne({ userName }, { $inc: { score: dice } });
      await Data.updateOne(
        { userName: randomUser.userName },
        { $inc: { score: dice * -1 } }
      );
      randomUser.score -= dice;
      user.score += dice;
    }

    return res.json({
      success: true,
      user,
      randomUser,
      dice,
      win
    });
  } else return res.json({ success: false, error: "error" });
});

router.post("/notplay", async (req, res) => {
  const { userName, password } = req.body;
  let user = new Data();
  if ((!userName && userName !== 0) || (!password && password !== 0)) {
    return res.json({
      success: false,
      error: "Invalid username or password."
    });
  }
  usr = await Data.findOne({ userName, password }).exec();
  dice = rollNot();
  if (usr) {
    //exist user
    user.userName = usr.userName;
    user.score = usr.score + dice;
    await Data.updateOne(
      { _id: usr._id },
      { score: user.score, $inc: { click3: 1 } }
    ).then(docs => {
      if (docs) {
        return res.json({ success: true, user, dice });
      } else {
        return res.json({ success: false, user: "no such user exist" });
      }
    });
  } else return res.json({ success: false, error: "no such user exist" });
});

router.get("/list", (req, res) => {
  Data.find()
    .sort({ score: -1, updatedAt: -1 })
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, list });
    });
});

router.get("/count", async (req, res) => {
  userCount = await Data.countDocuments();
  arr = await Data.aggregate([
    {
      $match: {
        click1: { $gte: 0 }
      }
    },
    {
      $group: {
        _id: null,
        click1Count: { $sum: "$click1" },
        click2Count: { $sum: "$click2" },
        click3Count: { $sum: "$click3" },
        click4Count: { $sum: "$click4" }
      }
    },
    {
      $project: {
        _id: 0,
        click1Count: 1,
        click2Count: 1,
        click3Count: 1,
        click4Count: 1
      }
    }
  ]);
  clickCount =
    arr[0].click1Count +
    arr[0].click2Count +
    arr[0].click3Count +
    arr[0].click4Count;
  return res.json({ success: true, userCount, clickCount });
});

router.get("/listN", (req, res) => {
  Data.find()
    .sort({ score: 1, updatedAt: -1 })
    .limit(5)
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, list: list.reverse() });
    });
});

router.get("/admin", async (req, res) => {
  var listadmin = [];
  await Data.find()
    .sort({ click1: -1, updatedAt: -1 })
    .limit(1)
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      listadmin.push(list[0]);
    });

  await Data.find()
    .sort({ click3: -1, updatedAt: -1 })
    .limit(1)
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      listadmin.push(list[0]);
    });

  await Data.find()
    .sort({ click2: -1, updatedAt: -1 })
    .limit(1)
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      listadmin.push(list[0]);
    });

  await Data.find()
    .sort({ click4: -1, updatedAt: -1 })
    .limit(1)
    .then((list, err) => {
      if (err) return res.json({ success: false, error: err });
      listadmin.push(list[0]);
    });
  return res.json({ success: true, listadmin });
});

app.use("/api", router);

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
