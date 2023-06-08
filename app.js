const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const DataPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: DataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (err) {
    console.log(`DB Error :${err.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

app.get("/movielist/", async (request, response) => {
  const getMoviesQuery = `
        SELECT *
        FROM
        movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  //   response.send(
  //     moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  //   );
  response.send(moviesArray);
});

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name
        FROM
        movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
  //   response.send(moviesArray);
});

///----------------Post Movie-------------------///

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
        INSERT INTO
            movie(director_id,movie_name,lead_actor)
        VALUES
            ('${directorId}','${movieName}','${leadActor}')
    `;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

///--------------get movie name bt MovieID-----------------////

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieByIdQuery = `
        SELECT *
        FROM
            movie
        WHERE
            movie_id=${movieId};
    `;
  const movie = await db.get(movieByIdQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

///----------------------------Update by MovieId-----------------//////

app.post("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
        UPDATE movie
        SET
            director_id='${directorId}',
            movie_name='${movieName}',
            lead_actor='${leadActor}'
        WHERE 
            movie_id=${movieId}
    `;
  const movie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

///------------------Put-----------------------------////
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
        UPDATE
           movie
        SET 
            director_id='${directorId}',
            movie_name='${movieName}',
            lead_actor='${leadActor}'
        WHERE
            movie_id=${movieId}
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

///---------------------DELETE Movie ------------------------///

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE 
         FROM
        movie
        WHERE
        movie_id='${movieId}'
    `;
  const delMovie = await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

///-------------------- GET Director table-----------------------///

app.get("/directors/", async (request, response) => {
  const { directorId, directorName } = request.body;
  const getDirectorQuery = `
        SELECT *
        FROM
        director
    `;
  const directorArray = await db.all(getDirectorQuery);
  console.log(directorArray);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

///---------------
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
