const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

// Create a new poll
router.post('/', pollController.createPoll);

// Fetch all polls
router.get('/', pollController.getAllPolls);

// updating a particular poll (details and question sets)
router.put('/:pollId', pollController.updatePoll);

// Route for fetching user polls and serving questions one at a time
router.get('/user/:userId', pollController.getUserPollsAndQuestions);

// Route for Submitting a poll and updating user data, rewarding the user, and updating poll analytics
router.post('/submit/:userId/:pollId/:questionId', pollController.submitPollAndUpdateData);

// Route for Fetching poll analytics for a particular poll
router.get('/analytics/:pollId', pollController.getPollAnalytics);

// Route for Fetching overall poll analytics
router.get('/overall-analytics', pollController.getOverallPollAnalytics);

module.exports = router;
