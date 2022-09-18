const { con } = require("../config/db");
const uuid = require("uuid");
const upperCaseFirst = require("../utils/UppercaseFistChar");

class FilmController {
  // [GET] /api
  index(req, res) {
    res.json({ message: "success" });
  }
  // [POST] /api/film/sortDelete
  sortDel(req, res) {
    const { id } = req.body;
    const query = `update film
    set sortDel = true
    where film.id = '${id}'`;
    con.query(query, function (error, rows) {
      if (error) throw error;
      res.json({
        success: true,
        message: "updated sortDel column",
        id: id,
      });
    });
  }
  // [POST] /api/film/update
  updateFilmById(req, res) {
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
    con.query(query, function (error, rows) {
      if (error) throw error;
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
      var query = `INSERT INTO film (stt,id,title,poster,trailerURL,thumnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES ("${filmRow.stt}","${filmRow.film_id}","${filmRow.title}","${filmRow.poster}","${filmRow.trailerURL}","${filmRow.thumnail}","${filmRow.time}","${filmRow.description}","${filmRow.tags}",${filmRow.rating},${filmRow.imdb},"${filmRow.release}","${filmRow.director}","${filmRow.type_id}","${filmRow.quantity_id}","${filmRow.year_id}");`;
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
                  console.log("1 record relationsive film with cast inserted");
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
      message: "Updated film by id",
    });
  }
  // [GET] /api/films/search
  search(req, res) {
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
    where film.title like '%${req.query.keyword}%'
    group by film.title
    order by film.stt desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(query, function (error, rows) {
      if (error) throw error;
      res.json({
        success: true,
        message: "get films search done",
        searchResult: rows,
      });
    });
  }
  // [GET] /api/films/byType
  filmByType(req, res) {
    const { key, type } = req.query;
    const filter = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
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
    where ${key === "genre" ? "genres" : "countries"}.title in ('${type}')
    group by film.title
    order by film.stt desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(filter, function (error, rows) {
      if (error) throw error;
      res.json({
        success: true,
        message: "Get films by type done",
        filmsByType: rows,
      });
    });
  }
  // [POST] /api/films/filter
  filter(req, res) {
    const filters = req.body.filters;
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
    ${
      filters.genre.length > 0 &&
      filters.type.length > 0 &&
      filters.country.length > 0 &&
      filters.year.length > 0 &&
      filters.quantity.length > 0
        ? `where genres.title in (${filters.genre.map(
            (gen) => `'${gen}'`
          )}) and types.title in (${filters.type.map(
            (ty) => `'${ty}'`
          )}) and countries.title in (${filters.country.map(
            (coun) => `'${coun}'`
          )}) and years.title in (${filters.year.map(
            (ye) => `'${ye}'`
          )}) and quantities.title in (${filters.quantity.map(
            (quan) => `'${quan}'`
          )})`
        : filters.genre.length > 0 &&
          filters.type.length > 0 &&
          filters.country.length > 0 &&
          filters.year.length > 0
        ? `where genres.title in (${filters.genre.map(
            (gen) => `'${gen}'`
          )}) and types.title in (${filters.type.map(
            (ty) => `'${ty}'`
          )}) and countries.title in (${filters.country.map(
            (coun) => `'${coun}'`
          )}) and years.title in (${filters.year.map((ye) => `'${ye}'`)})`
        : filters.genre.length > 0 &&
          filters.type.length > 0 &&
          filters.country.length > 0
        ? `where genres.title in (${filters.genre.map(
            (gen) => `'${gen}'`
          )}) and types.title in (${filters.type.map(
            (ty) => `'${ty}'`
          )}) and countries.title in (${filters.country.map(
            (coun) => `'${coun}'`
          )})`
        : filters.genre.length > 0 && filters.type.length > 0
        ? `where genres.title in (${filters.genre.map(
            (gen) => `'${gen}'`
          )}) and types.title in (${filters.type.map((ty) => `'${ty}'`)})`
        : filters.genre.length > 0
        ? `where genres.title in (${filters.genre.map((gen) => `'${gen}'`)})`
        : ``
    }   
    group by film.title
    order by film.stt desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(query, function (error, rows) {
      if (error) throw error;
      res.json({
        success: true,
        message: "Get films filter done !",
        filmsFilter: rows,
      });
    });
  }
  // [GET] /api/films/suggest/:id
  selectFilmsSuggest(req, res) {
    const { id } = req.params;
    const query = `select film.title,types.title as type,
    group_concat(distinct genres.title order by genres.title separator ", ") as genres,
    group_concat(distinct casts.title order by casts.title separator ", ") as casts,
    group_concat(distinct productions.title order by productions.title separator ", ") as productions
    from film
    inner join film_genre on film_genre.film_id = film.id
    inner join genres on genres.id = film_genre.genre_id
    inner join film_cast on film_cast.film_id = film.id
    inner join casts on casts.id = film_cast.cast_id
    inner join film_production on film_production.film_id = film.id
    inner join productions on productions.id = film_production.production_id
    inner join types on types.id = film.type_id
    where film.id = '${id}'
    group by film.title
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(query, function (error, rows) {
      if (error) {
        res.status(400).json({ success: false, message: "query error" });
        throw error;
      } else {
        const titleKey = rows[0].title;
        const typeKey = rows[0].type;
        const genreKey = rows[0].genres
          .split(",")
          .map((genre) => `'${genre.trim()}'`);
        const castKey = rows[0].casts
          .split(",")
          .map((cast) => `'${cast.trim()}'`);
        const productioKey = rows[0].productions
          .split(",")
          .map((production) => `'${production.trim()}'`);
        let query = `select film.stt,film.id,film.title,film.poster,film.trailerURL,film.thumnail,film.times,film.description,film.tags,film.rating,film.imdb,film.releases,film.director,types.title as type,quantities.title as quantity,years.title as year,
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
        WHERE (film.title not like '${titleKey}' and types.title = '${typeKey}' and (
          casts.title in (${castKey}) or (productions.title in (${productioKey}) and genres.title in (${genreKey}))
        ))
        group by film.title
        order by film.stt desc
        ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
        con.query(query, function (error, rows) {
          if (error) {
            throw error;
          } else {
            res.json({
              success: true,
              message: "Get films suggest successfully",
              filmSuggests: rows,
            });
          }
        });
      }
    });
  }
  // [GET] /api/films/lastestMovies
  selectLastest(req, res) {
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
    where types.title = '${req.params.type}'
    group by film.title
    order by film.releases desc
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;

    con.query(query, function (error, rows) {
      if (error) {
        res.status(400).json({ success: false, message: error.message });
        throw error;
      } else {
        res.json({
          success: true,
          message: "get films lastest success",
          filmsType: rows,
        });
      }
    });
  }
  // [GET] /api/films/:condition/:key/:value
  selectByCondition(req, res) {
    const { condition, key, value } = req.params;
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
    where ${key.toLowerCase()} ${condition} '${value}'
    group by film.title
    order by film.stt
    ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(query, function (error, rows) {
      if (error) {
        res.status(400).json({ success: false, message: error.message });
        throw error;
      } else {
        res.json({
          success: true,
          message: "get films by condition success",
          filmsType: rows,
        });
      }
    });
  }
  // [GET] /api/films/type/:params
  filmsType(req, res) {
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
      where types.title = '${req.params.params}' ${
      req.query.year ? `and years.title = ${req.query.year}` : ""
    }
      group by film.title
      order by film.up_to_date desc
      ${req.query.limit ? `LIMIT ${req.query.limit}` : ""};`;
    con.query(query, function (err, results) {
      if (err) throw err;
      res.json({
        success: true,
        message: "get films type of movie done !",
        filmsType: results,
      });
    });
  }
  // [GET] /api/film/:id
  film(req, res) {
    const film_id = req.params.id;
    try {
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
      const querySelectAllFilm = `SELECT stt,id,title,sortDel FROM film`;
      con.query(querySelectAllFilm, (error, rows) => {
        if (error) throw error;
        res.json({
          success: true,
          message: "selected all films",
          films: rows,
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
                  console.log("1 record relationsive film with cast inserted");
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
