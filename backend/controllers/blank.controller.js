const Blank = require('../models/blank.model');

class BlankController {
  static async getAllBlanks(req, res) {
    try {
      const blanks = await Blank.find({});
      res.json(blanks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = BlankController;
