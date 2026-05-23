import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import formidable from "formidable";

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req,res){

  const form =
    formidable({});

  form.parse(
    req,
    async(err,fields,files)=>{

      try{

        const file =
          files.file[0];

        const filePath =
          file.filepath;

        const ext =
          path.extname(
            file.originalFilename
          ).toLowerCase();

        let text = "";

        // PDF
        if(ext === ".pdf"){

          const dataBuffer =
            fs.readFileSync(filePath);

          const data =
            await pdf(dataBuffer);

          text = data.text;

        }

        // DOCX
        else if(ext === ".docx"){

          const result =
            await mammoth.extractRawText({
              path:filePath
            });

          text = result.value;

        }

        // TXT
        else if(ext === ".txt"){

          text =
            fs.readFileSync(
              filePath,
              "utf8"
            );

        }

        // IMAGE
        else if(
          ext === ".png" ||
          ext === ".jpg" ||
          ext === ".jpeg"
        ){

          text =
            "Image uploaded. Vision AI coming soon.";

        }

        else{

          text =
            "Unsupported file type.";

        }

        return res.status(200).json({
          text
        });

      }catch(error){

        return res.status(500).json({
          error:error.message
        });

      }

    }
  );

}
