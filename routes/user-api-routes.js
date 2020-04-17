//get user info
//http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=F83481CE586D90CD0924F6576AA13DEC&steamids=76561198071626037

//get user id by steam name
//"http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=58B845E0858DDB3A73B47D71B787198A&vanityurl=sammysticks"

var db = require("../models");
module.exports = function (app) {
  const axios = require("axios");
  const apiKey = process.env.API_KEY || "58B845E0858DDB3A73B47D71B787198A";

  function getUserInfo(apiKey, user, cb) {
    const queryVanityUrl = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${user}`;

    axios.get(queryVanityUrl).then(function (res) {
      let userId = res.data.response.steamid;
      const querySteamUserUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${userId}`;
      axios.get(querySteamUserUrl).then(function (res) {
        if(res.data.response.players.length > 0){
          let steamUser = {
            personaName: res.data.response.players[0].personaname,
            steamId: res.data.response.players[0].steamid,
            profileUrl: res.data.response.players[0].profileurl,
            avatarUrl: res.data.response.players[0].avatarmedium,
          };
          return cb(steamUser);
        }else{
          return console.log("Couldn't find user!");
          // redirect to a 404 page user not found
        }
      });
    });
  }

  app.post("/api/steamUsers", function (req, res) {
    db.SteamUser.findOne({
      where: {
        personaName: req.body.user,
      },
    }).then((user) => {
      console.log(user);
      if (!user) {
        getUserInfo(apiKey, req.body.user, (steamUser) => {
          db.SteamUser.create(steamUser).then(function (dbPost) {
            res.json(dbPost);
          });
        });
      }else{
        console.log("user already exists!");
      }
    });
  });

  app.get("/api/steamUsers", function (req, res) {
    db.SteamUser.findAll({}).then((user) => {
      res.json(user);
    });
  });

  app.get("/api/steamUsers/:personaName", function (req, res) {
    db.SteamUser.findOne({
      where: {
        personaName: req.params.personaName,
      },
    }).then((user) => {
      console.log("User in the app.get(/api.steamUsers/:personaName function .then", user);
      console.log("User object from database: ", user);
      res.json(user);
    });
  });
};



