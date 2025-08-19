import multer from 'multer'
import path from 'path'

import { fileURLToPath } from 'url'

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/temp')) // Use path.join for safer path handling
  },
  filename: function (req, file, cb) {
    const uniqueFilename = Date.now() + '-' + file.originalname
    cb(null, uniqueFilename)
  }
})

const upload = multer({ storage: storage })
export { upload }
