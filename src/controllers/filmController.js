const uuid = require("uuid");
const db = require("../config/db");
const upperCaseFirst = require("../utils/UppercaseFistChar");
class FilmController {
  // [GET] /api
  index(req, res) {
    res.json({ message: "success" });
  }
  // [GET] /api/films/type/:params
  filmsType(req, res) {
    db.connect((con) => {
      const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
      group_concat(distinct genres.title order by genres.title separator ", ") as genres,
      group_concat(distinct countries.title order by countries.title separator ", ") as countries,
      group_concat(distinct casts.title order by casts.title separator ", ") as casts,
      group_concat(distinct productions.title order by productions.title separator ", ") as productions,film.up_to_date
      from film
      inner join film_genre on film_genre.film_id = film.id
      inner join genres on genres.id = film_genre.genre_id
      inner join film_country on film_country.film_id = film.id
      inner join countries on countries.id = film_country.country_id
      inner join film_cast on film_cast.film_id = film.id
      inner join casts on casts.id = film_cast.cast_id
      inner join film_production on film_production.film_id = film.id
      inner join productions on productions.id = film_production.production_id
      inner join types on types.id = film.type_id
      inner join quantities on quantities.id = film.quantity_id
      inner join years on years.id = film.year_id
      where types.title = '${req.params.params}'
      group by film.title
      order by film.stt`;
      con.query(query, function (err, results) {
        if (err) throw err;
        res.json({
          success: true,
          message: "get films type of movie done !",
          filmsType: results,
        });
      });
    });
  }
  // [GET] /api/film/:id
  film(req, res) {
    const film_id = req.params.id;
    try {
      db.connect((con) => {
        const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
        group_concat(distinct genres.title order by genres.title separator ", ") as genres,
        group_concat(distinct countries.title order by countries.title separator ", ") as countries,
        group_concat(distinct casts.title order by casts.title separator ", ") as casts,
        group_concat(distinct productions.title order by productions.title separator ", ") as productions,film.up_to_date
        from film
        inner join film_genre on film_genre.film_id = film.id
        inner join genres on genres.id = film_genre.genre_id
        inner join film_country on film_country.film_id = film.id
        inner join countries on countries.id = film_country.country_id
        inner join film_cast on film_cast.film_id = film.id
        inner join casts on casts.id = film_cast.cast_id
        inner join film_production on film_production.film_id = film.id
        inner join productions on productions.id = film_production.production_id
        inner join types on types.id = film.type_id
        inner join quantities on quantities.id = film.quantity_id
        inner join years on years.id = film.year_id
        where film.id = '${film_id}'
        group by film.title
        order by film.stt`;
        con.query(query, (error, rows) => {
          if (error) throw error;
          res.json({
            success: true,
            message: `get film with id :${film_id}`,
            film: rows[0],
          });
        });
      });
    } catch (errors) {
      res.status(400).json({
        success: false,
        message: errors.message,
      });
    }
  }
  // [GET] /api/films
  read(req, res) {
    try {
      db.connect((con) => {
        const querySelectAllFilm = `SELECT stt,id,title FROM film`;
        con.query(querySelectAllFilm, (error, rows) => {
          if (error) throw error;
          res.json({
            success: true,
            message: "selected all films",
            films: rows,
          });
        });
      });
    } catch (errors) {
      res.status(400).json({
        success: false,
        message: errors.message,
      });
    }
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
      const descriptionHanlde = filmData.description
        .split("")
        .filter((des) => des !== '"')
        .join("");
      const filmRow = {
        film_id: uuid.v4(),
        ...filmData,
        description: descriptionHanlde,
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
        var query = `INSERT INTO film (id,title,poster,trailerURL,thumnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES ("${filmRow.film_id}","${filmRow.title}","${filmRow.poster}","${filmRow.trailerURL}","${filmRow.thumnail}","${filmRow.time}","${filmRow.description}","${filmRow.tags}",${filmRow.rating},${filmRow.imdb},"${filmRow.release}","${filmRow.director}","${filmRow.type_id}","${filmRow.quantity_id}","${filmRow.year_id}");`;
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
          const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
          con.query(querySelectProduct, (error, rows) => {
            if (error) throw error;
            if (rows.length === 0) {
              const queryInsertProduct = `INSERT INTO productions (id, title)VALUES ('${product}_id',"${product}");`;
              con.query(queryInsertProduct, (error, result) => {
                if (error) throw error;
                console.log("1 record production inserted");
                const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
                con.query(querySelectProduct, (error, rows) => {
                  if (error) throw error;
                  const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${rows[0].id}');`;
                  con.query(queryInsertFilmProduct, (error, rows) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with production inserted (not yet production)"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${rows[0].id}');`;
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
          const querySelectCast = `SELECT id FROM casts WHERE title = '${cast}'`;
          con.query(querySelectCast, (error, rows) => {
            if (error) throw error;
            if (rows.length === 0) {
              const queryInsertCast = `INSERT INTO casts (id, title)VALUES ('${cast}_id',"${cast}");`;
              con.query(queryInsertCast, (error, result) => {
                if (error) throw error;
                console.log("1 record cast inserted");
                const querySelectCast = `SELECT id FROM casts WHERE title = '${cast}'`;
                con.query(querySelectCast, (error, rows) => {
                  if (error) throw error;
                  const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${rows[0].id}');`;
                  con.query(queryInsertFilmCast, (error, rows) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with cast inserted"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${rows[0].id}');`;
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
