const uuid = require("uuid");
const db = require("../config/db");
class FilmController {
  // [GET] /api
  index(req, res) {
    res.json({ message: "success" });
  }
  // [POST] /api/film/create
  create(req, res) {
    try {
      const {
        payload: { filmData },
      } = req.body;
      const filmRow = {
        film_id: uuid.v4(),
        ...filmData,
      };
      console.log(filmRow);
      // db.connect((con) => {
      //   let query = `INSERT INTO film (film_id,title,poster,trailerURL,thumnail,times,description,tags,rating,imdb,releases,director,type_id,quantity_id,year_id)VALUES ("${filmRow.film_id}","${filmRow.title}","${filmRow.poster}","${filmRow.trailerURL}","${filmRow.thumnail}","${filmRow.time}","${filmRow.description}","${filmRow.tags}",${filmRow.rating},${filmRow.imdb},"${filmRow.release}","${filmRow.director}","${filmRow.type_id}","${filmRow.quantity_id}","${filmRow.year_id}");`;
      //   console.log(query);
      //   con.query(query, (error, rows) => {
      //     if (error) throw error;
      //     console.log(rows);
      //   });
      // });
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
