const express = require('express');
const { Router } = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('GET User');
});

module.exports = router;
