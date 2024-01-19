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
exports.createPoll = (title, category, startDate, endDate, minReward, maxReward, callback) => {
    const sql = 'INSERT INTO Polls (title, category, start_date, end_date, min_reward, max_reward) VALUES (?,?,?,?,?,?)';
    db.query(sql, [title, category, startDate, endDate, minReward, maxReward], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.insertId);
    });
};

// Model function for creating a question
exports.createQuestion = (pollId, questionText, questionType, callback) => {
    const sql = 'INSERT INTO Questions (poll_id, question_type, question_text) VALUES (?, ?, ?)';
    db.query(sql, [pollId, questionType, questionText], (err, result) => {
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

// Model function to get all polls
exports.getAllPolls = (callback) => {
    const sql = 'SELECT * FROM Polls';
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, results);
    });
};

// Model function to get poll details
exports.getPollDetails = (pollId, callback) => {
    const sqlTotalVotes = 'SELECT SUM(votes) as totalVotes FROM PollAnalytics WHERE poll_id = ?';
    const sqlNumQuestionSets = 'SELECT COUNT(id) as numQuestionSets FROM Questions WHERE poll_id = ?';
    const sqlQuestionDetails = 'SELECT id, question_text FROM Questions WHERE poll_id = ? LIMIT 1';

    // Fetch total votes for the poll
    db.query(sqlTotalVotes, [pollId], (err, totalVotesResult) => {
        if (err) {
            return callback(err, null);
        }

        const totalVotes = totalVotesResult[0].totalVotes || 0;

        // Fetch the number of question sets for the poll
        db.query(sqlNumQuestionSets, [pollId], (err, numQuestionSetsResult) => {
            if (err) {
                return callback(err, null);
            }

            const numQuestionSets = numQuestionSetsResult[0].numQuestionSets || 0;

            // Fetch details of at least one question for the poll
            db.query(sqlQuestionDetails, [pollId], (err, questionDetailsResult) => {
                if (err) {
                    return callback(err, null);
                }

                const questionDetails = questionDetailsResult.length > 0
                    ? { id: questionDetailsResult[0].id, question_text: questionDetailsResult[0].question_text }
                    : null;

                return callback(null, {
                    totalVotes: totalVotes,
                    numQuestionSets: numQuestionSets,
                    questionDetails: questionDetails,
                });
            });
        });
    });
};

// Model function for updating poll details
exports.updatePollDetails = (pollId, updateData, callback) => {
    // Generate the SET part of the SQL query dynamically based on the provided update data
    const updateFields = [];
    const updateValues = [];

    for (const key in updateData) {
        if (updateData.hasOwnProperty(key) && key !== 'pollId') {
            updateFields.push(`${key} = ?`);
            updateValues.push(updateData[key]);
        }
    }

    if (updateFields.length === 0) {
        // No valid fields to update
        return callback('No valid fields to update', null);
    }

    // Construct the SQL query
    const sql = `UPDATE Polls SET ${updateFields.join(', ')} WHERE id = ?`;
    const sqlValues = [...updateValues, pollId];

    // Execute the query
    db.query(sql, sqlValues, (err, result) => {
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
    const sql = 'SELECT Q.id, Q.question_text, Q.question_type, O.id AS option_id, O.option_text ' +
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
                    question_type: row.question_type,
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

// Model function to get min and max reward for a poll
exports.getMinAndMaxReward = (pollId, callback) => {
    const sql = 'SELECT min_reward, max_reward FROM Polls WHERE id = ?';
    db.query(sql, [pollId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback('Poll not found', null);
        }

        const { min_reward, max_reward } = results[0];
        return callback(null, { min_reward, max_reward });
    });
};

// Model function to get question type for a question
exports.getQuestionType = (questionId, callback) => {
    const sql = 'SELECT question_type FROM Questions WHERE id = ?';
    db.query(sql, [questionId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback('Question not found', null);
        }

        let questionType = results[0].question_type;
        questionType = questionType.toLowerCase();
        return callback(null, questionType);
    });
};
