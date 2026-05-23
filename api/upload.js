import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import formidable from "formidable";

// Disable body parser
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

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {

    try {

      if (err) {

        return res.status(500).json({
          error: "File upload error",
        });

      }

      const file =
        files.file[0];

      const filepath =
        file.filepath;

      const filename =
        file.originalFilename;

      let text = "";

      // PDF
      if (filename.endsWith(".pdf")) {

        const dataBuffer =
          fs.readFileSync(filepath);

        const data =
          await pdf(dataBuffer);

        text = data.text;

      }

      // DOCX
      else if (
        filename.endsWith(".docx")
      ) {

        const result =
          await mammoth.extractRawText({
            path: filepath,
          });

        text = result.value;

      }

      // TXT
      else if (
        filename.endsWith(".txt")
      ) {

        text =
          fs.readFileSync(
            filepath,
            "utf8"
          );

      }

      // IMAGE
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
          "Failed to analyze file",
      });

    }

  });

}
