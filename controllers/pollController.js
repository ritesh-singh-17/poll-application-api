const userModel = require('../models/userModel');
const pollModel = require('../models/pollModel');


// Helper function to add questions set to poll
function addQuestionSetsToPoll(pollId, questionSets, callback) {
    // Validate and add each question set to the poll
    questionSets.forEach((questionSet, index) => {
        const { questionText, questionType, options } = questionSet;

        // Validate the question set
        if (!questionText || !questionType || !options || !Array.isArray(options) || options.length === 0) {
            return callback(`Invalid question set at index ${index}`);
        }

        // Add the question set to the poll
        pollModel.createQuestion(pollId, questionText, questionType, (err, questionId) => {
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
function calculateReward(minReward, maxReward) {
    return Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
}









// Controller function for creating poll
exports.createPoll = (req, res) => {
    const { title, category, startDate, endDate, minReward, maxReward, questionSets } = req.body;


    // Validate the request body
    if (!title || !category || !startDate || !endDate || !minReward || !maxReward || !questionSets || !Array.isArray(questionSets) || questionSets.length === 0) {
        return res.status(400).json({
            error: 'Invalid request body',
        });
    }

    // Create the poll
    pollModel.createPoll(title, category, startDate, endDate, minReward, maxReward, (err, pollId) => {
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


// Controller function for fetching all created polls
exports.getAllPolls = (req, res) => {
    // Call the pollModel function to get all polls
    pollModel.getAllPolls((err, polls) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        // Iterate through each poll and fetch additional details
        const pollsWithDetails = [];

        polls.forEach((poll) => {
            // Call the pollModel function to get total votes and question details for the poll
            pollModel.getPollDetails(poll.id, (err, pollDetails) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Internal Server Error',
                    });
                }

                // Add details to the poll object
                const pollWithDetails = {
                    id: poll.id,
                    title: poll.title,
                    category: poll.category,
                    startDate: poll.start_date,
                    endDate: poll.end_date,
                    totalVotes: pollDetails.totalVotes,
                    numQuestionSets: pollDetails.numQuestionSets,
                    questionDetails: pollDetails.questionDetails,
                };

                // Add the poll to the result array
                pollsWithDetails.push(pollWithDetails);

                // If all polls have been processed, send the response
                if (pollsWithDetails.length === polls.length) {
                    return res.status(200).json({
                        polls: pollsWithDetails,
                    });
                }
            });
        });
    });
};



// Controller function for updating a particular poll (details and question sets)
exports.updatePoll = (req, res) => {
    const { pollId } = req.params;
    const {updateData, questionSets} = req.body;

    // Validate the request body
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
            error: 'Invalid request body',
        });
    }

    // Update the poll details
    pollModel.updatePollDetails(pollId, updateData, (err, affectedRows) => {
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

    // Fetch question type to determine if it's single or multiple selection
    pollModel.getQuestionType(questionId, (err, questionType) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
            });
        }

        // Check if the selected options are valid based on question type
        if ((questionType === 'single' && selectedOptions.length !== 1) ||
            (questionType === 'multiple' && selectedOptions.length < 2)) {
            return res.status(400).json({
                error: 'Invalid number of selected options based on question type',
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

                // Fetch minReward and maxReward from your polls table
                pollModel.getMinAndMaxReward(pollId, (err, { min_reward, max_reward }) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            error: 'Internal Server Error',
                        });
                    }

                    // Reward the user with a value between min_reward and max_reward
                    const rewardAmount = calculateReward(min_reward, max_reward);

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
