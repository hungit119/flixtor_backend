const { client } = require("../config/db");
class CommentController {
  index(req, res) {
    const querySelectCommentByFilmId = `select c.id as comment_id, m.body,u.username,f.id as film_id,c.up_to_date from "comment" c
    inner join message m on c.message_id = m.id 
    inner join users u on m.user_id = u.id 
    inner join film f on c.film_id = f.id 
    where f.id = '${req.query.filmId}'`;
    client.query(querySelectCommentByFilmId, (error, result) => {
      if (error) throw error;
      res.json({
        success: true,
        message: "Get comments success",
        comments: result.rows,
      });
    });
  }
  writeComment(req, res) {
    const { comment } = req.body;
    // store msg
    const queryStoreMsg = `Insert into message (id,body,user_id) values ('${comment.msg.id}','${comment.msg.text}','${comment.user_id}')`;
    const queryCreateComment = `Insert into comment (id,film_id,message_id) values ('${comment.id}','${comment.film_id}','${comment.msg.id}')`;

    client.query(queryStoreMsg, (error) => {
      if (error) throw error;
      console.log("stored a new message.");
      client.query(queryCreateComment, (error) => {
        if (error) throw error;
        console.log("created a new comment.");
        const queryRecentComment = `select c.id as commentId ,m.body,u.username,f.id as filmId,c.up_to_date from "comment" c
        inner join message m on c.message_id = m.id 
        inner join users u on m.user_id = u.id 
        inner join film f on c.film_id = f.id 
        where c.id = '${comment.id}'`;
        client.query(queryRecentComment, (error, result) => {
          if (error) throw error;
          res.json({
            success: true,
            message: "Created a new comment",
            comment: result.rows[0],
          });
        });
      });
    });
  }
}
module.exports = new CommentController();
