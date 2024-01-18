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

// Model function to check if the user has already voted in a poll
exports.hasUserVoted = (userId, pollId, callback) => {
    const sql = 'SELECT COUNT(*) AS count FROM UserVotes WHERE user_id = ? AND poll_id = ?';
    db.query(sql, [userId, pollId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        const hasVoted = results[0].count > 0;
        return callback(null, hasVoted);
    });
};

// Model function to submit a poll for a user
exports.submitPoll = (userId, pollId, questionId, selectedOptions, callback) => {
    const sql = 'INSERT INTO UserVotes (user_id, poll_id, question_id, selected_options) VALUES (?, ?, ?, ?)';
    db.query(sql, [userId, pollId, questionId, JSON.stringify(selectedOptions)], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result.insertId);
    });
};

// Model function to reward a user
exports.rewardUser = (userId, rewardAmount, callback) => {
    const sql = 'UPDATE Users SET rewards = rewards + ? WHERE id = ?';
    db.query(sql, [rewardAmount, userId], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};