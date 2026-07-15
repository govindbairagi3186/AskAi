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
      success: false,
      error: "Method not allowed",
    });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    try {
      const uploaded = Array.isArray(files.file)
        ? files.file[0]
        : files.file;

      if (!uploaded) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded.",
        });
      }

      const filePath = uploaded.filepath;
      const fileName = (uploaded.originalFilename || "").toLowerCase();

      let extractedText = "";
      let fileType = "";

      if (fileName.endsWith(".txt")) {
        fileType = "text";
        extractedText = fs.readFileSync(filePath, "utf8");
      }

      else if (fileName.endsWith(".pdf")) {
        fileType = "pdf";
        const buffer = fs.readFileSync(filePath);
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text;
      }

      else if (fileName.endsWith(".docx")) {
        fileType = "docx";
        const result = await mammoth.extractRawText({
          path: filePath,
        });
        extractedText = result.value;
      }

      else if (
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".webp")
      ) {
        fileType = "image";
        extractedText =
          "Image uploaded successfully. OCR support will be added later.";
      }

      else {
        fs.unlinkSync(filePath);

        return res.status(400).json({
          success: false,
          error: "Unsupported file type.",
        });
      }

      if (!extractedText.trim()) {
        extractedText = "No readable text found.";
      }

      // Delete temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({
        success: true,
        fileName: uploaded.originalFilename,
        fileType,
        characters: extractedText.length,
        text: extractedText,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}
