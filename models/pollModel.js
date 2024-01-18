const mysql = require('mysql');

// Create a MySQL connection
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "abhiman_assignment"
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Model functions
exports.createPoll = (title, callback) => {
    const sql = 'INSERT INTO Polls (title) VALUES (?)';
    db.query(sql, [title], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.insertId);
    });
};

// Model function for creating a question
exports.createQuestion = (pollId, questionText, callback) => {
    const sql = 'INSERT INTO Questions (poll_id, question_text) VALUES (?, ?)';
    db.query(sql, [pollId, questionText], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.insertId);
    });
};

// Model function for creating an option
exports.createOption = (questionId, optionText, callback) => {
    const sql = 'INSERT INTO Options (question_id, option_text) VALUES (?, ?)';
    db.query(sql, [questionId, optionText], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.insertId);
    });
};

// Model function to get all poll analytics
exports.getAllPollsAnalytics = (callback) => {
    const sql = 'SELECT Polls.*, PollAnalytics.* FROM Polls LEFT JOIN PollAnalytics ON Polls.id = PollAnalytics.poll_id';
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }

        const pollsWithAnalytics = [];

        // Organize results into polls with analytics
        results.forEach((row) => {
            const pollId = row.poll_id;

            // Find if the poll already exists in the array
            const existingPoll = pollsWithAnalytics.find((poll) => poll.id === pollId);

            if (existingPoll) {
                // If the poll exists, add analytics data
                existingPoll.analytics.push({
                    optionId: row.option_id,
                    totalVotes: row.votes,
                    votes: row.votes,
                });
            } else {
                // If the poll doesn't exist, create a new poll object
                const newPoll = {
                    id: pollId,
                    title: row.title,
                    analytics: [
                        {
                            optionId: row.option_id,
                            totalVotes: row.votes,
                            votes: row.votes,
                        },
                    ],
                };

                pollsWithAnalytics.push(newPoll);
            }
        });

        return callback(null, pollsWithAnalytics);
    });
};


// Model function for updating poll details
exports.updatePollDetails = (pollId, title, callback) => {
    const sql = 'UPDATE Polls SET title = ? WHERE id = ?';
    db.query(sql, [title, pollId], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.affectedRows);
    });
};

// Model function for deleting question sets for a poll
exports.deleteQuestionSetsForPoll = (pollId, callback) => {
    const sqlDeleteQuestions = 'DELETE FROM Questions WHERE poll_id = ?';
    const sqlDeleteOptions = 'DELETE FROM Options WHERE question_id IN (SELECT id FROM Questions WHERE poll_id = ?)';
    
    // Delete options first to avoid foreign key constraint violation
    db.query(sqlDeleteOptions, [pollId], (err) => {
        if (err) {
            return callback(err);
        }

        // Delete questions after options are deleted
        db.query(sqlDeleteQuestions, [pollId], (err, result) => {
            if (err) {
                return callback(err);
            }

            return callback(null, result.affectedRows);
        });
    });
};

// Model function to fetch user polls
exports.getUserPolls = (userId, callback) => {
    const sql = 'SELECT DISTINCT poll_id FROM UserVotes WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, results);
    });
};

// Model function to fetch questions and options for a poll
exports.getQuestionsAndOptionsForPoll = (pollId, callback) => {
    const sql = 'SELECT Q.id, Q.question_text, O.id AS option_id, O.option_text ' +
                'FROM Questions Q ' +
                'LEFT JOIN Options O ON Q.id = O.question_id ' +
                'WHERE Q.poll_id = ?';
    db.query(sql, [pollId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // Organize the results into a structured format
        const questionsWithOptions = [];
        let currentQuestion = null;

        results.forEach(row => {
            if (!currentQuestion || currentQuestion.id !== row.id) {
                // New question
                currentQuestion = {
                    id: row.id,
                    question_text: row.question_text,
                    options: []
                };
                questionsWithOptions.push(currentQuestion);
            }

            // Add option to the current question
            if (row.option_id) {
                currentQuestion.options.push({
                    option_id: row.option_id,
                    option_text: row.option_text
                });
            }
        });

        return callback(null, questionsWithOptions);
    });
};

// Model function to update poll analytics
exports.updatePollAnalytics = (pollId, selectedOptions, callback) => {

    const updatePollSql = 'UPDATE PollAnalytics SET votes = votes + 1 WHERE poll_id = ?';
    db.query(updatePollSql, [pollId], (err, result) => {
        if (err) {
            return callback(err);
        }

        // Loop through selected options and update votes for each option
        selectedOptions.forEach((optionId) => {
            const updateOptionSql = 'UPDATE PollAnalytics SET votes = votes + 1 WHERE poll_id = ? AND option_id = ?';
            db.query(updateOptionSql, [pollId, optionId], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        });

        return callback(null);
    });
};

// Model function to get poll analytics for a particular poll
exports.getPollAnalytics = (pollId, callback) => {
    const sql = 'SELECT * FROM PollAnalytics WHERE poll_id = ?';
    db.query(sql, [pollId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, results);
    });
};

// Model function to get overall poll analytics
exports.getOverallPollAnalytics = (callback) => {
    const sql = 'SELECT poll_id, SUM(votes) as votes, SUM(votes) as votes FROM PollAnalytics GROUP BY poll_id';
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, results);
    });
};
