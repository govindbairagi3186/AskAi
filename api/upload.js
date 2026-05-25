import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import formidable from "formidable";

// =========================
// DISABLE BODY PARSER
// =========================

export const config = {
  api: {
    bodyParser: false,
  },
};

// =========================
// MAIN API
// =========================

export default async function handler(req, res) {

  // ONLY POST
  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed",
    });

  }

  try {

    // =========================
    // FORMIDABLE CONFIG
    // =========================

    const form = formidable({

      multiples: false,

      keepExtensions: true,

    });

    // =========================
    // PARSE FILE
    // =========================

    form.parse(

      req,

      async (err, fields, files) => {

        try {

          // ERROR
          if (err) {

            console.log(err);

            return res.status(500).json({
              error: "Upload failed",
            });

          }

          // =========================
          // GET FILE
          // =========================

          const uploadedFile =
            files.file;

          const uploaded =
            Array.isArray(uploadedFile)
              ? uploadedFile[0]
              : uploadedFile;

          // NO FILE
          if (!uploaded) {

            return res.status(400).json({
              error: "No file uploaded",
            });

          }

          // =========================
          // FILE INFO
          // =========================

          const filepath =
            uploaded.filepath;

          const filename =
            uploaded.originalFilename
              .toLowerCase();

          let text = "";

          // =========================
          // TXT FILE
          // =========================

          if (
            filename.endsWith(".txt")
          ) {

            text =
              fs.readFileSync(
                filepath,
                "utf8"
              );

          }

          // =========================
          // PDF FILE
          // =========================

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

          // =========================
          // DOCX FILE
          // =========================

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

          // =========================
          // IMAGE FILE
          // =========================

          else if (

            filename.endsWith(".png") ||
            filename.endsWith(".jpg") ||
            filename.endsWith(".jpeg")

          ) {

            text =
              "Image uploaded successfully.";

          }

          // =========================
          // UNSUPPORTED
          // =========================

          else {

            text =
              "Unsupported file type.";

          }

          // =========================
          // SEND RESPONSE
          // =========================

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

      }

    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      error:
        "Server error",

    });

  }

}
