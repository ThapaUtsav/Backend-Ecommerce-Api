import multer from "multer";
import path from "path";

//storage configuration for multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

//filterfile with its types to upload
const filefilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type.Only JPEG,PNG and GIF are allowed"));
  }
};
//limit image size
export const upload = multer({
  storage,
  fileFilter: filefilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
