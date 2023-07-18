const { client } = require("../config/db");
const uuid = require("uuid");
const Response = require("../utils/Response");
const UppercaseFistChar = require("../utils/UppercaseFistChar");

class FilmController {
  // [GET] /api
  index(req, res) {
    res.json({ message: "success" });
  }
  // [GET] /api/film/watch-list/remove
  removeWatchList(req, res) {
    const { fid } = req.query;
    const query = `delete from watchlist_user where user_id = '${req.userId}' and film_id = '${fid}'`;
    client.query(query, function (error) {
      if (error) throw error;
      client.query(
        `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
      array_to_string(array_agg(distinct genres.title),',') as genres,
      array_to_string(array_agg(distinct countries.title),',') as countries,
      array_to_string(array_agg(distinct casts.title),',') as casts,
      array_to_string(array_agg(distinct productions.title),',') as productions,
      film.timestamps
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
      inner join watchlist_user on film.id = watchlist_user.film_id
      inner join users on watchlist_user.user_id = users.id
      where users.id = '${req.userId}'
      group by film.stt,types.title,quantities.title,years.title,watchlist_user.timestamps
      order by film.timestamps desc`,
        function (error, result) {
          if (error) throw error;
          res.json(
            Response.response(
              true,
              "delete film from watch list done !",
              result.rows
            )
          );
        }
      );
    });
  }
  // [GET] /api/films/watch-list
  watchlist(req, res) {
    const { sortBy } = req.query;
    const user_id = req.userId;
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct countries.title),',') as countries,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions,
    film.timestamps
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
    inner join watchlist_user on film.id = watchlist_user.film_id
    inner join users on watchlist_user.user_id = users.id
    where users.id = '${user_id}'
    group by film.stt,types.title,quantities.title,years.title,watchlist_user.timestamps
    order by ${
      sortBy === "name a-z"
        ? "film.title"
        : sortBy === "imdb"
        ? "film.imdb"
        : sortBy === "release date"
        ? "film.releases"
        : sortBy === "recently added"
        ? "film.timestamps"
        : "watchlist_user.timestamps"
    } desc`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json(
        Response.response(true, "get film from watch list success", result.rows)
      );
    });
  }
  // [POST] /api/film/watchlist/add
  addToWatchlist(req, res) {
    const { fid } = req.body;
    const query = `Insert into watchlist_user (user_id,film_id) values('${req.userId}','${fid}')`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json({
        success: true,
        message: "add film to watchlist user successfully",
      });
    });
  }
  // [GET] /api/film/watchlist/addedWatchlist
  addedWatchlist(req, res) {
    const { fid } = req.query;
    // check from database
    const query = `Select * from watchlist_user where user_id='${req.userId}' and film_id='${fid}';`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json({
        success: true,
        message: "checked successfully",
        rows: result.rows,
      });
    });
  }
  // [POST] /api/film/remove
  remove(req, res) {
    const { id } = req.body;
    const query = `delete from film_cast where film_cast.film_id = '${id}';
    delete from film_country where film_country.film_id = '${id}';
    delete from film_genre where film_genre.film_id = '${id}';
    delete from film_production where film_production.film_id = '${id}';
    delete from film where film.id = '${id}';`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json({ success: true, message: "removed film done", id: id });
    });
  }
  // [POST] /api/film/sortDelete
  sortDel(req, res) {
    const { id } = req.body;
    const { restore } = req.query;
    const query = `update film
    set sortdel = ${restore === "true" ? false : true}
    where film.id = '${id}'`;
    client.query(query, function (error) {
      if (error) throw error;
      res.json({
        success: true,
        message: "updated sortDel column",
        id: id,
      });
    });
  }
  // [POST] /api/film/update
  async updateFilmById(req, res) {
    try {
      const { idFilm, stt } = req.query;
      const { newPayload } = req.body;
      const {
        newFilmData,
        genres_film,
        countries_film,
        casts_film,
        productions_film,
      } = newPayload;
      const filmRow = {
        stt: stt,
        film_id: idFilm,
        ...newFilmData,
      };
      const query = `delete from film_cast where film_cast.film_id = '${idFilm}';
      delete from film_country where film_country.film_id = '${idFilm}';
      delete from film_genre where film_genre.film_id = '${idFilm}';
      delete from film_production where film_production.film_id = '${idFilm}';
      delete from film where film.id = '${idFilm}';`;
      client.query(query, function (error) {
        if (error) throw error;
        const genres = genres_film.split(",");
        const countries = countries_film.split(",");
        const casts = casts_film.split(",");
        const productions = productions_film.split(",");
        let queryGenre = "";
        genres.forEach((genre) => {
          queryGenre += `INSERT INTO film_genre (film_id,genre_id) VALUES('${
            filmRow.film_id
          }','${genre.trim()}_id');`;
        });
        let queryCountry = "";
        countries.forEach((country) => {
          queryCountry += `INSERT INTO film_country (film_id,country_id) VALUES('${
            filmRow.film_id
          }','${country.trim()}_id');`;
        });
        const pre_productions = productions.map((pro) => pro.trim());
        const pre_casts = casts.map((cast) => cast.trim());
        var query = `INSERT INTO film (stt,id,title,poster,trailerurl,thumbnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES (${
          filmRow.stt
        },'${filmRow.film_id}','${filmRow.title}','${filmRow.poster}','${
          filmRow.trailerurl
        }','${filmRow.thumbnail}','${filmRow.time}','${filmRow.description
          .split("")
          .filter((des) => des !== '"' || des !== "'")
          .join("")}','${filmRow.tags}',${filmRow.rating},${filmRow.imdb},'${
          filmRow.release
        }','${filmRow.director}','${filmRow.type_id}','${
          filmRow.quantity_id
        }','${filmRow.year_id}');`;
        client.query(query, (error) => {
          if (error) throw error;
          console.log("1 record film inserted");
        });
        client.query(queryCountry, (error) => {
          if (error) throw error;
          console.log("1 record relationsive film with country inserted");
        });
        client.query(queryGenre, (error) => {
          if (error) throw error;
          console.log("1 record film with genre inserted");
        });
        pre_productions.forEach((product) => {
          const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
          client.query(querySelectProduct, (error, result) => {
            if (error) throw error;
            if (result.rows.length === 0) {
              const queryInsertProduct = `INSERT INTO productions (id, title)VALUES ('${product}_id','${product}');`;
              client.query(queryInsertProduct, (error, result) => {
                if (error) throw error;
                console.log("1 record production inserted");
                const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
                client.query(querySelectProduct, (error, result) => {
                  if (error) throw error;
                  const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
                  client.query(queryInsertFilmProduct, (error, result) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with production inserted (not yet production)"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
              client.query(queryInsertFilmProduct, (error, result) => {
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
          client.query(querySelectCast, (error, result) => {
            if (error) throw error;
            if (result.rows.length === 0) {
              const queryInsertCast = `INSERT INTO casts (id, title)VALUES ('${cast}_id','${cast}');`;
              client.query(queryInsertCast, (error, result) => {
                if (error) throw error;
                console.log("1 record cast inserted");
                const querySelectCast = `SELECT id FROM casts WHERE title = '${cast}'`;
                client.query(querySelectCast, (error, result) => {
                  if (error) throw error;
                  const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
                  client.query(queryInsertFilmCast, (error, result) => {
                    if (error) throw error;
                    console.log(
                      "1 record relationsive film with cast inserted"
                    );
                  });
                });
              });
            } else {
              const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
              client.query(queryInsertFilmCast, (error, result) => {
                if (error) throw error;
                console.log("1 record relationsive film with cast inserted");
              });
            }
          });
        });
      });
      res.json({
        success: true,
        message: "Updated film by id",
      });
    } catch (error) {
      throw error;
    }
  }
  // [GET] /api/films/search
  search(req, res) {
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct countries.title),',') as countries,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions,
    film.timestamps
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
    where film.title like '%${req.query.keyword}%'
    group by film.stt,types.title,quantities.title,years.title
    order by film.stt desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json({
        success: true,
        message: "get films search done",
        searchResult: result.rows,
      });
    });
  }
  // [GET] /api/films/byType
  filmByType(req, res) {
    const { key, type } = req.query;
    const filter = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct countries.title),',') as countries,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions,
    film.timestamps
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
    where ${
      key === "genre"
        ? "genres"
        : key === "country"
        ? "countries"
        : key === "cast"
        ? "casts"
        : "productions"
    }.title in ('${UppercaseFistChar(type)}')
    group by film.stt,types.title,quantities.title,years.title
    order by film.stt desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(filter, function (error, result) {
      if (error) throw error;
      res.json({
        success: true,
        message: "Get films by type done",
        filmsByType: result.rows,
      });
    });
  }
  // [POST] /api/films/filter
  filter(req, res) {
    const filters = Object.values(req.body.filters);
    let queryString = "";
    if (filters.some((filter) => filter.options.length !== 0))
      queryString = "where ";
    filters.map((filter) => {
      filter.options.map((option) => {
        queryString += `${filter.type}.title = '${option}' ${
          filter.options[filter.options.length - 1] === option
            ? filters[filters.indexOf(filter) + 1].options.length === 0
              ? ""
              : "and "
            : "or "
        }`;
      });
    });
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
      array_to_string(array_agg(distinct genres.title),',') as genres,
      array_to_string(array_agg(distinct countries.title),',') as countries,
      array_to_string(array_agg(distinct casts.title),',') as casts,
      array_to_string(array_agg(distinct productions.title),',') as productions,
      film.timestamps
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
      ${queryString}
      group by film.stt,types.title,quantities.title,years.title
      order by film.stt desc
      ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (error, result) {
      if (error) throw error;
      res.json({
        success: true,
        message: "Get films filter done !",
        filmsFilter: result.rows,
      });
    });
  }
  // [GET] /api/films/suggest/:id
  selectFilmsSuggest(req, res) {
    const { id } = req.params;
    const query = `select film.title,types.title as type,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions
    from film
    inner join film_genre on film_genre.film_id = film.id
    inner join genres on genres.id = film_genre.genre_id
    inner join film_cast on film_cast.film_id = film.id
    inner join casts on casts.id = film_cast.cast_id
    inner join film_production on film_production.film_id = film.id
    inner join productions on productions.id = film_production.production_id
    inner join types on types.id = film.type_id
    where film.id = '${id}'
    group by film.title,types.title
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (error, result) {
      if (error) {
        res.status(400).json({ success: false, message: "query error" });
        throw error;
      } else {
        const titleKey = result.rows[0].title;
        const typeKey = result.rows[0].type;
        const genreKey = result.rows[0].genres
          .split(",")
          .map((genre) => `'${genre.trim()}'`);
        const castKey = result.rows[0].casts
          .split(",")
          .map((cast) => `'${cast.trim()}'`);
        const productioKey = result.rows[0].productions
          .split(",")
          .map((production) => `'${production.trim()}'`);
        let query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
        array_to_string(array_agg(distinct genres.title),',') as genres,
	      array_to_string(array_agg(distinct countries.title),',') as countries,
	      array_to_string(array_agg(distinct casts.title),',') as casts,
	      array_to_string(array_agg(distinct productions.title),',') as productions,
        film.timestamps
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
        WHERE (film.title not like '${titleKey}' and types.title = '${typeKey}' and (
          casts.title in (${castKey}) or (productions.title in (${productioKey}) and genres.title in (${genreKey}))
        ))
        group by film.stt,types.title,quantities.title,years.title
        order by film.stt desc
        ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
        client.query(query, function (error, result) {
          if (error) {
            throw error;
          } else {
            res.json({
              success: true,
              message: "Get films suggest successfully",
              filmSuggests: result.rows,
            });
          }
        });
      }
    });
  }
  // [GET] /api/films/lastestMovies
  selectLastest(req, res) {
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct countries.title),',') as countries,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions,
    film.timestamps
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
    where types.title = '${UppercaseFistChar(req.params.type)}'
    group by film.stt,types.title,quantities.title,years.title
    order by film.releases desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (error, result) {
      if (error) {
        res.status(400).json({ success: false, message: error.message });
        throw error;
      } else {
        res.json({
          success: true,
          message: "get films lastest success",
          filmsType: result.rows,
        });
      }
    });
  }
  // [GET] /api/films/:condition/:key/:value
  selectByCondition(req, res) {
    const { condition, key, value } = req.params;
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
    array_to_string(array_agg(distinct genres.title),',') as genres,
	  array_to_string(array_agg(distinct countries.title),',') as countries,
	  array_to_string(array_agg(distinct casts.title),',') as casts,
	  array_to_string(array_agg(distinct productions.title),',') as productions,
    film.timestamps
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
    where ${key.toLowerCase()} ${condition} '${value}'
    group by film.stt,types.title,quantities.title,years.title
    order by film.stt
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (error, result) {
      if (error) {
        res.status(400).json({ success: false, message: error.message });
        throw error;
      } else {
        res.json({
          success: true,
          message: "get films by condition success",
          filmsType: result.rows,
        });
      }
    });
  }
  // [GET] /api/films/type/:params
  filmsType(req, res) {
    const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
      array_to_string(array_agg(distinct genres.title),',') as genres,
      array_to_string(array_agg(distinct countries.title),',') as countries,
      array_to_string(array_agg(distinct casts.title),',') as casts,
      array_to_string(array_agg(distinct productions.title),',') as productions,
      film.timestamps
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
      where types.title = '${UppercaseFistChar(req.params.params)}' ${
      req.query.year ? `and years.title = '${req.query.year}'` : ""
    }
      group by film.stt,types.title,quantities.title,years.title
      order by film.timestamps desc
      ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    client.query(query, function (err, result) {
      if (err) throw err;
      res.json({
        success: true,
        message: "get films type of movie done !",
        filmsType: result.rows,
      });
    });
  }
  // [GET] /api/film/:id
  film(req, res) {
    const film_id = req.params.id;
    try {
      const query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumbnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
        array_to_string(array_agg(distinct genres.title),',') as genres,
        array_to_string(array_agg(distinct countries.title),',') as countries,
        array_to_string(array_agg(distinct casts.title),',') as casts,
        array_to_string(array_agg(distinct productions.title),',') as productions,
        film.timestamps
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
        group by film.stt,types.title,quantities.title,years.title
        order by film.stt`;
      client.query(query, (error, result) => {
        if (error) throw error;
        res.json({
          success: true,
          message: `get film with id :${film_id}`,
          film: result.rows[0],
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
      const { sortDel } = req.query;
      const querySelectAllFilm = `SELECT stt,id,title,sortdel FROM film ${
        sortDel ? "where sortdel=true" : ""
      }`;
      client.query(querySelectAllFilm, (error, result) => {
        if (error) throw error;
        res.json({
          success: true,
          message: "selected all films",
          films: result.rows,
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
        queryGenre += `INSERT INTO film_genre (film_id,genre_id) VALUES('${
          filmRow.film_id
        }','${genre.trim()}_id');`;
      });
      let queryCountry = "";
      countries.forEach((country) => {
        queryCountry += `INSERT INTO film_country (film_id,country_id) VALUES('${
          filmRow.film_id
        }','${country.trim()}_id');`;
      });
      const pre_productions = productions.map((pro) => pro.trim());
      const pre_casts = casts.map((cast) => cast.trim());
      var query = `INSERT INTO film (id,title,poster,trailerurl,thumbnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES ('${
        filmRow.film_id
      }','${filmRow.title}','${filmRow.poster}','${filmRow.trailerurl}','${
        filmRow.thumbnail
      }','${filmRow.time}','${filmRow.description.replace(/['"]+/g, "")}','${
        filmRow.tags
      }',${filmRow.rating},${filmRow.imdb},'${filmRow.release}','${
        filmRow.director
      }','${filmRow.type_id}','${filmRow.quantity_id}','${filmRow.year_id}');`;
      client.query(query, (error) => {
        if (error) throw error;
        console.log("1 record film inserted");
      });
      client.query(queryCountry, (error) => {
        if (error) throw error;
        console.log("1 record relationsive film with country inserted");
      });
      client.query(queryGenre, (error) => {
        if (error) throw error;
        console.log("1 record film with genre inserted");
      });
      pre_productions.forEach((product) => {
        const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
        client.query(querySelectProduct, (error, result) => {
          if (error) throw error;
          if (result.rows.length === 0) {
            const queryInsertProduct = `INSERT INTO productions (id, title)VALUES ('${product}_id','${product}');`;
            client.query(queryInsertProduct, (error, result) => {
              if (error) throw error;
              console.log("1 record production inserted");
              const querySelectProduct = `SELECT id FROM productions WHERE title = '${product}'`;
              client.query(querySelectProduct, (error, result) => {
                if (error) throw error;
                const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
                client.query(queryInsertFilmProduct, (error, result) => {
                  if (error) throw error;
                  console.log(
                    "1 record relationsive film with production inserted (not yet production)"
                  );
                });
              });
            });
          } else {
            const queryInsertFilmProduct = `INSERT INTO film_production (film_id, production_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
            client.query(queryInsertFilmProduct, (error, result) => {
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
        client.query(querySelectCast, (error, result) => {
          if (error) throw error;
          if (result.rows.length === 0) {
            const queryInsertCast = `INSERT INTO casts (id, title)VALUES ('${cast}_id','${cast}');`;
            client.query(queryInsertCast, (error, result) => {
              if (error) throw error;
              console.log("1 record cast inserted");
              const querySelectCast = `SELECT id FROM casts WHERE title = '${cast}'`;
              client.query(querySelectCast, (error, result) => {
                if (error) throw error;
                const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
                client.query(queryInsertFilmCast, (error, result) => {
                  if (error) throw error;
                  console.log("1 record relationsive film with cast inserted");
                });
              });
            });
          } else {
            const queryInsertFilmCast = `INSERT INTO film_cast (film_id, cast_id)VALUES ('${filmRow.film_id}', '${result.rows[0].id}');`;
            client.query(queryInsertFilmCast, (error, result) => {
              if (error) throw error;
              console.log("1 record relationsive film with cast inserted");
            });
          }
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
