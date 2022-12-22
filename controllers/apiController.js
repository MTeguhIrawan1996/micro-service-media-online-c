const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const { Media } = require("../models");
const fs = require("fs-extra");
const path = require("path");
const createError = require("../utils/error");
const removeImage = (filePath) => {
  filePath = path.join(__dirname, "../public", filePath);
  fs.unlink(filePath);
};

module.exports = {
  postMedia: async (req, res, next) => {
    const image = req.body.image;
    try {
      if (!isBase64(image, { mimeRequired: true })) {
        return next(createError(404, "Image Not Found"));
      }
      base64Img.img(
        image,
        "./public/images",
        Date.now(),
        async (err, filePath) => {
          if (err) {
            return next(createError(400, err.message));
          }
          const fileName = `images/${filePath
            .split("\\")
            .pop()
            .split("/")
            .pop()}`;

          const media = await Media.create({ image: fileName });

          return res.status(200).json({
            success: true,
            status: 200,
            message: "Success add media",
            details: {
              id: media.id,
              image: `${req.get("host")}/${media.image}`,
            },
          });
        }
      );
    } catch (err) {
      next(err);
    }
  },
  getMedia: async (req, res, next) => {
    try {
      const media = await Media.findAll({
        attributes: ["id", "image"],
      });

      const mappedMedia = media.map((m) => {
        m.image = `${req.get("host")}/${m.image}`;
        return m;
      });
      res.status(200).json({
        success: true,
        status: 200,
        message: "Success get media",
        details: mappedMedia,
      });
    } catch (err) {
      next(err);
    }
  },
  deleteMedia: async (req, res, next) => {
    const { id } = req.params;
    try {
      const media = await Media.findByPk(id);
      if (!media) {
        return next(createError(404, "Media Not Found"));
      }
      removeImage(media.image);
      await media.destroy({
        where: {
          id: media.id,
        },
      });
      res
        .status(200)
        .json({ success: true, status: 200, message: "Success Delete Media" });
    } catch (err) {
      next(err);
    }
  },
  updateMedia: async (req, res, next) => {
    const { id, image } = req.body;
    try {
      const media = await Media.findByPk(id);
      if (!media) {
        return next(createError(404, "Media Not Found"));
      }
      if (!isBase64(image, { mimeRequired: true })) {
        return next(createError(404, "Image Not Found"));
      }
      removeImage(media.image);

      base64Img.img(
        image,
        "./public/images",
        Date.now(),
        async (err, filePath) => {
          if (err) {
            return next(createError(400, err.message));
          }
          const fileName = `images/${filePath
            .split("\\")
            .pop()
            .split("/")
            .pop()}`;
          const newMedia = await media.update(
            { image: fileName },
            {
              where: {
                id: id,
              },
            }
          );

          return res.status(200).json({
            success: true,
            status: 200,
            message: "Success update media",
            details: {
              id: newMedia.id,
              image: `${req.get("host")}/${newMedia.image}`,
            },
          });
        }
      );
    } catch (err) {
      next(err);
    }
  },
};
