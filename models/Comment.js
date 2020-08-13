var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    body: { type: "String", required: true },
    author: { type: String, required: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Requires population of author
CommentSchema.methods.toJSONFor = function (user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user),
  };
};

const Comments = mongoose.model("Comments", CommentSchema);
module.exports = Comments;
