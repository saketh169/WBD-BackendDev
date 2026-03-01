const TeamBoard = require('../models/teamBoardModel');

/**
 * GET /api/teamboard?orgName=XYZ&limit=100
 * Fetch posts for an organisation, newest first.
 */
exports.getPosts = async (req, res) => {
  const { orgName, limit = 100 } = req.query;

  if (!orgName || !orgName.trim()) {
    return res.status(400).json({ success: false, message: 'orgName query parameter is required.' });
  }

  try {
    const posts = await TeamBoard.find({ orgName: orgName.trim() })
      .sort({ postedAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error('TeamBoard getPosts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch team board posts.' });
  }
};

/**
 * POST /api/teamboard
 * Create a new board post.
 * Body: { orgName, author, email, message, isOrg? }
 */
exports.createPost = async (req, res) => {
  const { orgName, author, email, message, isOrg } = req.body;

  if (!orgName || !author || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'orgName, author, email and message are required.',
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  }

  try {
    const post = new TeamBoard({
      orgName: orgName.trim(),
      author: author.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      isOrg: Boolean(isOrg),
      postedAt: new Date(),
    });

    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error('TeamBoard createPost error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create team board post.' });
  }
};

/**
 * DELETE /api/teamboard/:id
 * Delete a board post.
 * Only the post owner (matching email) or an org-admin (isOrg: true) can delete.
 */
exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const { email, isOrg } = req.query; // identify requester

  try {
    const post = await TeamBoard.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Allow deletion if: it's the post owner OR the requester is an org admin
    const isOwner = post.email === (email || '').trim().toLowerCase();
    const requesterIsOrg = isOrg === 'true';

    if (!isOwner && !requesterIsOrg) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this post.' });
    }

    await TeamBoard.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    console.error('TeamBoard deletePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};
