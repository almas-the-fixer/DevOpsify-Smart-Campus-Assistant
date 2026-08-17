import express from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";
import Material from "../../models/teacherModels/material.js";
import verifyToken from "../../middleware/auth.Middleware.js";
import User from "../../models/adminModels/User.js";
import { sendMaterialEmail } from "../../utils/sendMaterialEmail.js";
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Upload
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {

    try {

      const stream = cloudinary.uploader.upload_stream(
  {
    folder: "materials",
    resource_type: "raw",
    public_id: Date.now() + "-" + req.file.originalname,
  },

        async (error, uploadResult) => {

          if (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
          }

          const material = new Material({
            title: req.body.title,
            description: req.body.description,
            subject: req.body.subject,
            semester: req.body.semester,
            teacherId: req.user.id,
            fileUrl: uploadResult.secure_url,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size
          });

          await material.save();


          //sending email
          // Get students of same semester
          const students = await User.find({ semester: material.semester })
          .select("email");

          const emails = students.map(s => s.email);

          // teacher info
          const teacher = await User.findById(req.user.id);

          await sendMaterialEmail(emails, material, teacher.name);


          res.json({
            message: "Material uploaded",
            material
          });

        }
      );

      // IMPORTANT
      stream.end(req.file.buffer);

    } catch (err) {

      console.error(err);
      res.status(500).json({ message: err.message });

    }

  }
);

// Get teacher materials
router.get("/my", verifyToken, async (req, res) => {
  const data = await Material.find({
    teacherId: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(data);
});

// Delete material
router.delete("/:id", verifyToken, async (req, res) => {

  try {

    const material = await Material.findOne({
      _id: req.params.id,
      teacherId: req.user.id,
    });

    if (!material) {
      return res.status(404).json({ message: "Not found" });
    }

    await material.deleteOne();

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update material (With File Replace)

router.put(
  "/:id",
  verifyToken,
  upload.single("file"),

  async (req, res) => {

    try {

      const material = await Material.findOne({
        _id: req.params.id,
        teacherId: req.user.id,
      });

      if (!material) {
        return res.status(404).json({ message: "Not found" });
      }


      // Update text fields
      material.title = req.body.title;
      material.description = req.body.description;


      // If new file uploaded
      if (req.file) {

        const result = await cloudinary.uploader.upload_stream(
          {
            folder: "materials",
            resource_type: "raw",
          },

          async (error, uploadResult) => {

            if (error) throw error;

            material.fileUrl = uploadResult.secure_url;
            material.fileName = req.file.originalname;
            material.fileType = req.file.mimetype;
            material.fileSize = req.file.size;

            await material.save();

            res.json(material);
          }
        );

        result.end(req.file.buffer);

      } else {

        // No new file → only text update
        await material.save();

        res.json(material);
      }

    } catch (err) {

      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
