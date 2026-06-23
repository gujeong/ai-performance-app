import formidable from 'formidable'
import fs from 'fs'

export const multipartConfig = {
  api: { bodyParser: false },
}

export function parseMultipart(req) {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 1,
    keepExtensions: true,
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      const pick = (v) => (Array.isArray(v) ? v[0] : v)
      resolve({
        fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, pick(v)])),
        file: pick(files.file),
      })
    })
  })
}

export async function readUploadedFile(file) {
  const buffer = await fs.promises.readFile(file.filepath)
  await fs.promises.unlink(file.filepath).catch(() => {})
  return buffer
}
