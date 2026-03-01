const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost } = require('../controllers/teamBoardController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// All team board routes require a valid JWT
router.use(authenticateJWT);

// GET /api/teamboard?orgName=XYZ   — fetch posts for an org
router.get('/', getPosts);

// POST /api/teamboard              — create a new post
router.post('/', createPost);

// DELETE /api/teamboard/:id        — delete a post (owner or org admin)
router.delete('/:id', deletePost);

module.exports = router;
