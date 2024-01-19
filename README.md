# Poll Application API

This project implements a RESTful API for a poll application using Node.js, Express, and MySQL.

## Project Details

- **Node.js:** Version 20.9.0
- **Express:** Version 4.18.2
- **Database:** MySQL

## Setup Instructions

1. **Clone the Repository:**
   git clone https://github.com/ritesh-singh-17/poll-application-api.git
   cd poll-application-api

2. **Install Dependencies**
   npm install

3. **Set Up Database:**
   Create a MySQL database.
   Import abhiman_assignment.sql to your database.

4. **Run the Application:**
   nodemon index.js or node index.js

## Database Schema

- **Tables:**

1. Polls:
   id (Primary Key)
   title (Poll title)

2. Questions:
   id (Primary Key)
   poll_id (Foreign Key referencing Polls)
   question_text (Text of the question)

3. Options:
   id (Primary Key)
   question_id (Foreign Key referencing Questions)
   option_text (Text of the option)

4. Users:
   id (Primary Key)
   username (Username of the user)

5. UserVotes:
   id (Primary Key)
   user_id (Foreign Key referencing Users)
   poll_id (Foreign Key referencing Polls)
   question_id (Foreign Key referencing Questions)
   selected_options (JSON array containing selected option IDs)

6. PollAnalytics:
   id (Primary Key)
   poll_id (Foreign Key referencing Polls)
   question_id (Foreign Key referencing Questions)
   option_id (Foreign Key referencing Options)
   votes (Votes received for the option)

- Detailed information about the database schema can be found in the abhiman_assignment.sql file.


## API Documentation


1. **Create a new poll**
Endpoint: POST /polls
Request Body:
    {
        "title": "Favourite Place",
        "category": "Indian Places",
        "startDate": "2024-01-20",
        "endDate": "2024-01-30",
        "minReward": 5,
        "maxReward": 10,
        "questionSets": [
            {
                "questionType": "single",
                "questionText": "What is your favorite place?",
                "options": ["Shimla", "Delhi", "Kerala"]
            }
        ]
    }


2. **Fetch all polls with analytics**
Endpoint: GET /polls

3. **Update a particular poll**
Endpoint: PUT /polls/:pollId
Request Body:
    {
        "updateData": {
            "title": "New Poll Title",
            "category": "New Category",
            "min_reward": 5,
            "max_reward": 10,
            "start_date": "2024-01-20",
            "end_date": "2024-01-25"
        },
        "questionSets": [
            {
                "questionText": "New Question 1",
                "questionType": "single",
                "options": ["Option 1", "Option 2", "Option 3"]
            },
            {
                "questionText": "New Question 2",
                "questionType": "multiple",
                "options": ["Option A", "Option B", "Option C"]
            }
        ]
    }


4. **Fetch user polls and serve questions**
Endpoint: GET /polls/:userId

5. **Submit a poll and update user data**
Endpoint: POST /polls/submit/:userId/:pollId/:questionId
Request Body:
    {
        "selectedOptions": [1, 2]
    }

6. **Fetch poll analytics for a particular poll**
Endpoint: GET /polls/analytics/:pollId

7. **Fetch overall poll analytics**
Endpoint: GET /polls/overall-analytics


## Postman Collection
For easy access to API endpoints, you can use the following link:
https://api.postman.com/collections/29361977-7fc30f12-286e-4613-bbd5-c5eed4c19aef?access_key=PMAT-01HMF9ZVR5W13E18KYC93GYSS8