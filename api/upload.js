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

  try {

    const form =
      formidable({
        multiples: false,
        keepExtensions: true,
      });

    form.parse(
      req,
      async (err, fields, files) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            error: "Upload parsing failed",
          });

        }

        try {

          const uploadedFile =
            files.file;

          const file =
            Array.isArray(uploadedFile)
              ? uploadedFile[0]
              : uploadedFile;

          if (!file) {

            return res.status(400).json({
              error: "No file uploaded",
            });

          }

          const filepath =
            file.filepath;

          const filename =
            file.originalFilename.toLowerCase();

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
              "File analysis failed",
          });

        }

      }
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      error: "Server error",
    });

  }

}