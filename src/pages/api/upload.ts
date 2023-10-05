// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Formidable } from "formidable";

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB in bytes
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');

type ProcessedFiles = Array<[string, File]>;

async function ensureUploadsDirectory() {
  try {
    if(!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    }
  } catch (error) {
    console.error('upload - unable to create uploads directory', error);
    return false;
  }
}

export const config = {
  api: {
    bodyParser: false,
    // bodyParser: {
    //   sizeLimit: '10mb',
    // },    
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      await ensureUploadsDirectory(); // Ensure the uploads/images directory exists

      // const data = await new Promise((resolve, reject) => {
      //   const form = new Formidable();
    
      //   form.parse(req, (err, fields, files) => {
      //     if (err) reject({ err })
      //     resolve({ err, fields, files })
      //   }) 
      // })

      // console.log(data);

      // // const data = req.body
      // // console.log(Object.keys(data));
      // const file = data.files.file[0];
      // console.log(file);

      // if (!file) {
      //   console.error("upload - no file provided");
      //   return res.status(400).json({ error: 'No file provided' });
      // }

      // const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      // const dataBuffer = Buffer.from(base64Data, 'base64');

      // if (dataBuffer.length > MAX_FILE_SIZE) {
      //   console.error("upload - file size exceeds the maximum allowed (6MB)");
      //   return res.status(400).json({ error: 'File size exceeds the maximum allowed (6MB)' });
      // }

      // const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      // const fileExtension = path.extname(req.body.fileName).toLowerCase();

      // if (!allowedExtensions.includes(fileExtension)) {
      //   console.error("upload - invalid file type. Allowed extensions are .jpg, .jpeg, .png, .gif");
      //   return res.status(400).json({ error: 'Invalid file type. Allowed extensions are .jpg, .jpeg, .png, .gif' });
      // }

      // const fileName = `image_${Date.now()}${fileExtension}`;
      // const filePath = path.join(UPLOADS_DIR, fileName);

      // fs.writeFileSync(filePath, dataBuffer);

      // const imageUrl = `/uploads/images/${fileName}`;
      const imageUrl = '';
      res.status(200).json({ imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
