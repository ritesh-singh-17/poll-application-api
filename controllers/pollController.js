const userModel = require('../models/userModel');
const pollModel = require('../models/pollModel');


// Helper function to add questions set to poll
function addQuestionSetsToPoll(pollId, questionSets, callback) {
    // Validate and add each question set to the poll
    questionSets.forEach((questionSet, index) => {
        const { questionText, options } = questionSet;

        // Validate the question set
        if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
            return callback(`Invalid question set at index ${index}`);
        }

        // Add the question set to the poll
        pollModel.createQuestion(pollId, questionText, (err, questionId) => {
            if (err) {
                return callback(err);
            }

            // Add options to the question
            addOptionsToQuestion(questionId, options, (err) => {
                if (err) {
                    return callback(err);
                }
            });
        });
    });

    return callback(null);
}

// Helper function to add options to a question
function addOptionsToQuestion(questionId, options, callback) {
    // Validate and add each option to the question
    options.forEach((option, index) => {
        // Validate the option
        if (!option || typeof option !== 'string') {
            return callback(`Invalid option at index ${index}`);
        }

        // Add the option to the question
        pollModel.createOption(questionId, option, (err) => {
            if (err) {
                return callback(err);
            }
        });
    });

    return callback(null);
}

// Helper function to update question sets for a poll
function updateQuestionSetsForPoll(pollId, questionSets, callback) {
    // Delete existing question sets for the poll
    pollModel.deleteQuestionSetsForPoll(pollId, (err) => {
        if (err) {
            return callback(err);
        }

        // Add new question sets to the poll
        addQuestionSetsToPoll(pollId, questionSets, (err) => {
            if (err) {
                return callback(err);
            }
        });
    });

    return callback(null);
}


// Helper function to serve questions one at a time for each user poll
function serveQuestionsForUserPolls(userId, userPolls, res) {
    // Use recursion to serve questions for each user poll
    serveNextQuestion(userId, userPolls, 0, res);
}

// Recursive helper function to serve questions one at a time
function serveNextQuestion(userId, userPolls, index, res) {
    if (index < userPolls.length) {
        const pollId = userPolls[index].poll_id;

        // Fetch questions and options for the current user poll
        pollModel.getQuestionsAndOptionsForPoll(pollId, (err, questionsWithOptions) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal Server Error',
                });
            }

            // Serve the first question (assuming questions are in order)
            const firstQuestion = questionsWithOptions[0];

            if (firstQuestion) {
                // Respond with the question, poll details, and options
                res.status(200).json({
                    pollId: pollId,
                    questionId: firstQuestion.id,
                    questionText: firstQuestion.question_text,
                    options: firstQuestion.options
                });
            } else {
                // No questions for the current poll
                res.status(200).json({
                    message: 'No more questions for the user poll',
                });
            }

            // Serve the next question for the next user poll
            serveNextQuestion(userId, userPolls, index + 1, res);
        });
    } else {
        // No more user polls
        res.status(200).json({
            message: 'No more user polls',
        });
    }
}

// Helper function to calculate reward
function calculateReward() {
    return Math.floor(Math.random() * (10 - 1 + 1)) + 1; 
}






// Controller function for creating poll
exports.createPoll = (req, res) => {
    const { title, questionSets } = req.body;

    // Validate the request body
    if (!title || !questionSets || !Array.isArray(questionSets) || questionSets.length === 0) {
        return res.status(400).json({
            error: 'Invalid request body',
        });
    }

    // Create the poll
    pollModel.createPoll(title, (err, pollId) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        // Add question sets to the poll
        addQuestionSetsToPoll(pollId, questionSets, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal Server Error',
                });
            }

            res.status(201).json({
                message: 'Poll created successfully',
                pollId: pollId,
            });
        });
    });
};


// Controller function for getting all polls
exports.getAllPolls = (req, res) => {
    pollModel.getAllPollsAnalytics((err, polls) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        res.status(200).json({
            polls: polls,
        });
    });
};


// Controller function for updating a particular poll (details and question sets)
exports.updatePoll = (req, res) => {
    const { pollId } = req.params;
    const { title, questionSets } = req.body;

    // Validate the request body
    if (!title || !questionSets || !Array.isArray(questionSets) || questionSets.length === 0) {
        return res.status(400).json({
            error: 'Invalid request body',
        });
    }

    // Update the poll details
    pollModel.updatePollDetails(pollId, title, (err, affectedRows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        // Update question sets for the poll
        updateQuestionSetsForPoll(pollId, questionSets, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal Server Error',
                });
            }

            res.status(200).json({
                message: 'Poll updated successfully',
            });
        });
    });
};


// Controller function for fetching user polls and serving questions one at a time
exports.getUserPollsAndQuestions = (req, res) => {
    const { userId } = req.params;

    // Fetch user polls
    pollModel.getUserPolls(userId, (err, userPolls) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        // Serve questions one at a time for each user poll
        serveQuestionsForUserPolls(userId, userPolls, res);
    });
};


// Controller function for submitting a poll and updating user data, rewarding the user, and updating poll analytics
exports.submitPollAndUpdateData = (req, res) => {
    const { userId, pollId, questionId } = req.params;
    const { selectedOptions } = req.body;

    // Validate the request body
    if (!selectedOptions || !Array.isArray(selectedOptions)) {
        return res.status(400).json({
            error: 'Invalid request body',
        });
    }

    // Check if the user has already submitted the poll
    userModel.hasUserVoted(userId, pollId, (err, hasVoted) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        if (hasVoted) {
            return res.status(400).json({
                error: 'User has already submitted the poll',
            });
        }

        // Record user vote
        userModel.submitPoll(userId, pollId, questionId, selectedOptions, (err, submissionId) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Internal Server Error',
                });
            }

            // Reward the user 
            const rewardAmount = calculateReward(); 
            userModel.rewardUser(userId, rewardAmount, (err) => {
                if (err) {
                    console.error(err);
                }

                // Update poll analytics
                pollModel.updatePollAnalytics(pollId, selectedOptions, (err) => {
                    if (err) {
                        console.error(err);
                    }

                    res.status(201).json({
                        message: 'Poll submitted successfully',
                        submissionId: submissionId,
                        rewardAmount: rewardAmount,
                    });
                });
            });
        });
    });
};

// Controller function for fetching poll analytics for a particular poll
exports.getPollAnalytics = (req, res) => {
    const { pollId } = req.params;

    pollModel.getPollAnalytics(pollId, (err, analytics) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        res.status(200).json({
            analytics: analytics,
        });
    });
};

// Controller function for fetching overall poll analytics
exports.getOverallPollAnalytics = (req, res) => {
    pollModel.getOverallPollAnalytics((err, overallAnalytics) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        res.status(200).json({
            overallAnalytics: overallAnalytics,
        });
    });
};
