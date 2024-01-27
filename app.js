const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log("DB Error: ${e.message");
    process.exit(1);
  }
};

initializeDBServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET LIST OF ALL PLAYERS IN THE TEAM 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Get player API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
     SELECT * FROM 
     cricket_team 
     WHERE player_id =${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// CREATE PLAYER API 3
app.post("/players/", async (request, response) => {
  const { player_name, jersey_number, role } = request.body;
  const addPlayerQuery = `
     INSERT INTO 
     cricket_team (player_name,jersey_number,role)
     VALUES ( 
         '${player_name}',
         ${jersey_number},
         '${role}'
     );`;
  const player = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//UPDATE TEAM API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;

  const updateTeamQuery = `
    UPDATE 
    cricket_team
    SET 
       player_name = '${playerName}',
       jersey_number = ${jerseyNumber},
       role = '${role}'
    WHERE 
       player_id =${playerId}; `;
  await db.run(updateTeamQuery);
  response.send("Player Details Updated");
});

//DELETE PLAYER
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE 
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
