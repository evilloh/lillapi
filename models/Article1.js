const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: String,
    description: String,
    body: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
    tagList: [{ type: String }],
    author: { type: String },
    imgUrl: String,
    createdAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  }
);

const Articles = mongoose.model("Articles", articleSchema);
module.exports = Articles;
