const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (req.params.photoId && !mongoose.Types.ObjectId.isValid(req.params.photoId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid photo ID format'
    });
  }
  
  next();
};

module.exports = validateObjectId;