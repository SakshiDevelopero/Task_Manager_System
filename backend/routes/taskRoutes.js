const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  uploadTaskPhoto,
  deleteTaskPhoto
} = require('../controllers/taskController');



// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists and is writable
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Protect all routes
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('admin'), deleteTask);

// Comment routes
router.post('/:id/comments', addComment);

// Photo routes
router.post('/:id/photos', upload.single('photo'), uploadTaskPhoto);
router.delete('/:id/photos/:photoId', deleteTaskPhoto);

module.exports = router;
