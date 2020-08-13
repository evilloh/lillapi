const Articles = require("../models/Article1");
const mongoose = require("mongoose");

class ArticlesController {
  getAllArticles = async (req, res, next) => {
    try {
      await Articles.find().then((data) => {
        return res.json(data);
      });
    } catch (e) {
      console.log(e.message);
      res.sendStatus(500);
    }
  };

  postArticle = async (req, res) => {
    try {
      await Articles.create(req.body)
        .then((data) => res.json(data))
        .catch((err) => console.log("Error in posting a new Movie!! ", err));
    } catch (e) {
      console.log(e.message);
      res.sendStatus(500);
    }
  };

  deleteArticle = async (req, res) => {
    const checkOwner = (req, owner) => {
      const {
        headers: { user },
      } = req;
      if (user === owner) {
        console.log("sono uguali", user, owner);
        return true;
      }
      return false;
    };

    mongoose.set("useFindAndModify", false);
    try {
      await Articles.findById(req.params.id).then((article) => {
        if (checkOwner(req, article.author)) {
          Articles.findByIdAndRemove(req.params.id, function (err, user) {
            if (err)
              return res
                .status(500)
                .send("There was a problem deleting the article.");
            res
              .status(200)
              .send("Article: " + Articles.title + " was deleted.");
          });
        } else {
          return res
            .status(401)
            .send({ message: `Error during the deleting, not the author?` });
        }
      });
    } catch (e) {
      console.log(e.message);
      res.sendStatus(500);
    }
  };

  updateArticle = async (req, resa) => {
    const checkOwner = (req, owner) => {
      const {
        headers: { user },
      } = req;
      if (user === owner) {
        return true;
      }
      return false;
    };

    mongoose.set("useFindAndModify", false);
    let { id } = req.params;
    const body = { ...req.body };
    try {
      await Articles.findById(id).then((res) => {
        if (checkOwner(req, res.author)) {
          Articles.findOneAndUpdate({ _id: id }, body, { upsert: true }).then(
            function (res) {
              return resa
                .status(200)
                .send({ message: `Article with ${res.title} updated` });
            }
          );
        } else {
          return resa
            .status(401)
            .send({ message: `Error during the update, not the author?` });
        }
      });
    } catch (e) {
      resa
        .status(500)
        .send({ message: `Error during the update, couldnt find it?` });
    }
  };

  getArticle = async (req, res) => {
    let { id } = req.params;
    try {
      const response = await Articles.findOne({ _id: id }).populate({
        path: "comments",
        model: "Comments",
        // populate: { path: "author", model: "Users" },
      });
      res.json(response);
    } catch (e) {
      console.log(e.message);
      res.sendStatus(500);
    }
  };
}

module.exports = {
  ArticlesController,
};
