const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

router.post("/", apiController.postMedia);
router.get("/", apiController.getMedia);
router.delete("/:id", apiController.deleteMedia);
router.put("/", apiController.updateMedia);

module.exports = router;
