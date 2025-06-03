const Task = require('../models/Task');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');


exports.createTask = async (req, res) => {
  try {
    const { title, shortDescription, longDescription, priority, deadline, status, assignedTo, group } = req.body;

    const task = await Task.create({
      title,
      shortDescription,
      longDescription,
      priority,
      deadline,
      status,
      assignedTo,
      group,
      createdBy: req.user.id,
    });

    await User.findByIdAndUpdate(assignedTo, { $push: { tasks: task._id } });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Task.find()
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    } else {
      query = Task.find({
        $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }]
      })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    }

    const tasks = await query;

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (
      req.user.role !== 'admin' &&
      task.assignedTo._id.toString() !== req.user.id &&
      task.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete photos files
    if (task.photos && task.photos.length > 0) {
      for (const photo of task.photos) {
        try {
          const filePath = path.join(__dirname, '..', photo.imageUrl.replace(/^\//, ''));
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Failed to delete photo file:', err.message);
        }
      }
    }

    await task.remove();

    await User.findByIdAndUpdate(task.assignedTo, { $pull: { tasks: task._id } });

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ user: req.user.id, text: req.body.text });
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadTaskPhoto = async (req, res) => {
  try {
    console.log('Uploading photo for task:', req.params.id);
    console.log('User:', req.user);
    console.log('File:', req.file);

    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found');
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization: only admin or assigned user can upload
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    if (!task.photos) {
      task.photos = [];
    }

    const photo = {
      imageUrl: `/uploads/${req.file.filename}`,
      caption: req.body.caption || '',
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    };

    task.photos.push(photo);

    // Optionally update status when photo uploaded
    if (task.status === 'todo') task.status = 'inProgress';

    await task.save();

    console.log('Photo uploaded successfully');
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    console.error('Error in uploadTaskPhoto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTaskPhoto = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const photo = task.photos.id(req.params.photoId);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    const filePath = path.join(__dirname, '..', photo.imageUrl.replace(/^\//, ''));
    await fs.unlink(filePath);

    photo.remove();

    await task.save();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
