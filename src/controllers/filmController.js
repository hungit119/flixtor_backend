const uuid = require("uuid");
const db = require("../config/db");
const upperCaseFirst = require("../utils/UppercaseFistChar");
class FilmController {
  // [GET] /api
  index(req, res) {
    res.json({ message: "success" });
  }
  // [POST] /api/film/create
  create(req, res) {
    try {
      const {
        payload: {
          filmData,
          genres_film,
          countries_film,
          casts_film,
          productions_film,
        },
      } = req.body;
      const filmRow = {
        film_id: uuid.v4(),
        ...filmData,
      };
      const genres = genres_film.split(",");
      const countries = countries_film.split(",");
      const casts = casts_film.split(",");
      const productions = productions_film.split(",");

      let queryGenre = "";
      genres.forEach((genre) => {
        queryGenre += `INSERT INTO film_genre (film_id,genre_id) VALUES("${
          filmRow.film_id
        }","${genre.trim()}_id");`;
      });

      let queryCountry = "";
      countries.forEach((country) => {
        queryCountry += `INSERT INTO film_country (film_id,country_id) VALUES("${
          filmRow.film_id
        }","${country.trim()}_id");`;
      });
      const pre_productions = productions.map((pro) => pro.trim());
      const pre_casts = casts.map((cast) => cast.trim());
      db.connect((con) => {
        var query = `INSERT INTO film (film_id,title,poster,trailerURL,thumnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES ("${filmRow.film_id}","${filmRow.title}","${filmRow.poster}","${filmRow.trailerURL}","${filmRow.thumnail}","${filmRow.time}","${filmRow.description}","${filmRow.tags}",${filmRow.rating},${filmRow.imdb},"${filmRow.release}","${filmRow.director}","${filmRow.type_id}","${filmRow.quantity_id}","${filmRow.year_id}");`;
        con.query(query, (error, rows) => {
          if (error) throw error;
          console.log("1 record film inserted");
        });
        con.query(queryCountry, (error, rows) => {
          if (error) throw error;
          console.log("1 record relationsive film with country inserted");
        });
        con.query(queryGenre, (error, rows) => {
          if (error) throw error;
          console.log("1 record film with genre inserted");
        });
        pre_productions.forEach((product) => {
          const querySelectProduct = `SELECT production_id FROM productions WHERE production_title = '${product}'`;
          con.query(querySelectProduct, (error, rows) => {
            if (error) throw error;
            if (rows.length === 0) {
              const queryInsertProduct = `INSERT INTO productions (production_id, production_title)VALUES ('${product}_id',"${product}");`;
              con.query(queryInsertProduct, (error, result) => {
                if (error) throw error;
                console.log("1 record production inserted");
                const querySelectProduct = `SELECT production_id FROM productions WHERE production_title = '${product}'`;
                con.query(querySelectProduct, (error, rows) => {
                  if (error) throw error;
                  const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${rows[0].production_id}');`;
                  con.query(queryInsertFilmProduct, (error, rows) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with production inserted (not yet production)"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${rows[0].production_id}');`;
              con.query(queryInsertFilmProduct, (error, rows) => {
                if (error) throw error;
                console.log(
                  "1 record relationsive film with production inserted"
                );
              });
            }
          });
        });
        pre_casts.forEach((cast) => {
          const querySelectCast = `SELECT cast_id FROM casts WHERE cast_title = '${cast}'`;
          con.query(querySelectCast, (error, rows) => {
            if (error) throw error;
            if (rows.length === 0) {
              const queryInsertCast = `INSERT INTO casts (cast_id, cast_title)VALUES ('${cast}_id',"${cast}");`;
              con.query(queryInsertCast, (error, result) => {
                if (error) throw error;
                console.log("1 record cast inserted");
                const querySelectCast = `SELECT cast_id FROM casts WHERE cast_title = '${cast}'`;
                con.query(querySelectCast, (error, rows) => {
                  if (error) throw error;
                  const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${rows[0].cast_id}');`;
                  con.query(queryInsertFilmCast, (error, rows) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with cast inserted"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${rows[0].cast_id}');`;
              con.query(queryInsertFilmCast, (error, rows) => {
                if (error) throw error;
                console.log("1 record relationsive film with cast inserted");
              });
            }
          });
        });
      });
      res.json({
        success: true,
        message: "Created a new film !",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error creating new film!",
      });
      console.log("Creating fail with error :", error.message);
    }
  }
}
module.exports = new FilmController();
