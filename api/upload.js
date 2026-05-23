import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed",
    });

  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {

    try {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: "Upload failed",
        });

      }

      // IMPORTANT FIX
      const file =
        files.file;

      const uploaded =
        Array.isArray(file)
          ? file[0]
          : file;

      if (!uploaded) {

        return res.status(400).json({
          error: "No file",
        });

      }

      const filepath =
        uploaded.filepath;

      const filename =
        uploaded.originalFilename;

      let text = "";

      // TXT
      if (
        filename.endsWith(".txt")
      ) {

        text =
          fs.readFileSync(
            filepath,
            "utf8"
          );

      }

      // PDF
      else if (
        filename.endsWith(".pdf")
      ) {

        const dataBuffer =
          fs.readFileSync(filepath);

        const pdfData =
          await pdf(dataBuffer);

        text =
          pdfData.text;

      }

      // DOCX
      else if (
        filename.endsWith(".docx")
      ) {

        const result =
          await mammoth.extractRawText({
            path: filepath,
          });

        text =
          result.value;

      }

      // IMAGES
      else if (

        filename.endsWith(".png") ||
        filename.endsWith(".jpg") ||
        filename.endsWith(".jpeg")

      ) {

        text =
          "Image uploaded successfully.";

      }

      else {

        text =
          "Unsupported file type.";

      }

      return res.status(200).json({
        text,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        error:
          error.message,
      });

    }

  });

}
