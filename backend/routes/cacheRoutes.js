const express = require('express');
const router = express.Router();
const {
  getCacheStats,
  clearCacheKey,
  clearCachePattern,
  clearAllCache
} = require('../controllers/cacheController');

const { authenticationMiddleware } = require('../middleware/authenticationMiddleware');
const { authorizationMiddleware } = require('../middleware/authorizationMiddleware');

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(['admin']));

router.get('/stats', getCacheStats);
router.delete('/', clearAllCache);
router.delete('/:key', clearCacheKey);
router.delete('/pattern/:pattern', clearCachePattern);

module.exports = router;