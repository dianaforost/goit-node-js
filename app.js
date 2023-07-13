const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
// const fs = require('fs').promises;
const multer = require('multer');
const uploadDir = path.join(process.cwd(), 'public/avatars');
// const storeImage = path.join(process.cwd(), 'images');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});
// console.log(storage);
const upload = multer({
  storage: storage,
});
upload.single('picture');
const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.post('/upload', upload.single('picture'), async (req, res, next) => {
  const { description } = req.body;
  // const { path: temporaryName, originalname } = req.file;
  // const fileName = path.join(storeImage, originalname);
  try {
    console.log('file:', req.file);
    // await fs.rename(temporaryName, fileName);
  } catch (err) {
    // await fs.unlink(temporaryName);
    return next(err);
  }
  res.json({ description, message: 'Файл успішно завантажено', status: 200 });
});
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/contacts', contactsRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
