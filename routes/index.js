const express = require('express');
const router = express.Router();
const articlesRouter = require("../routes/articles");
const apiRouter = require('./api')
require("../models/Users")

router.use('/api', apiRouter);
router.use("/articles", articlesRouter);

module.exports = router;