-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 19, 2024 at 12:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `abhiman_assignment`
--

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` int(11) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `option_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `question_id`, `option_text`) VALUES
(1, 1, 'Red'),
(2, 1, 'Blue'),
(3, 1, 'Green'),
(4, 2, 'Pizza'),
(5, 2, 'Burger'),
(6, 2, 'Pasta'),
(21, 7, 'Shimla'),
(22, 7, 'Delhi'),
(23, 7, 'Kerala'),
(24, 8, 'Option 1'),
(25, 8, 'Option 2'),
(26, 8, 'Option 3'),
(27, 9, 'Option A'),
(28, 9, 'Option B'),
(29, 9, 'Option C');

-- --------------------------------------------------------

--
-- Table structure for table `pollanalytics`
--

CREATE TABLE `pollanalytics` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `option_id` int(11) DEFAULT NULL,
  `votes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pollanalytics`
--

INSERT INTO `pollanalytics` (`id`, `poll_id`, `option_id`, `votes`) VALUES
(1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `polls`
--

CREATE TABLE `polls` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `min_reward` int(11) DEFAULT NULL,
  `max_reward` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `polls`
--

INSERT INTO `polls` (`id`, `title`, `category`, `start_date`, `end_date`, `min_reward`, `max_reward`) VALUES
(1, 'Favorite Color', NULL, NULL, NULL, NULL, NULL),
(2, 'Favorite Food', NULL, NULL, NULL, NULL, NULL),
(3, 'New Poll Title', 'New Category', '2024-01-20', '2024-01-25', 5, 10),
(4, 'Favourite Place', 'Indian Places', '2024-01-20', '2024-01-30', 5, 10);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `question_type` varchar(25) NOT NULL,
  `question_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `poll_id`, `question_type`, `question_text`) VALUES
(1, 1, 'Multiple', 'What is your favorite color?'),
(2, 2, 'Multiple', 'What is your favorite food?'),
(7, 4, 'single', 'What is your favorite place?'),
(8, 3, 'single', 'New Question 1'),
(9, 3, 'multiple', 'New Question 2');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `rewards` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `rewards`) VALUES
(1, 'user1', 10),
(2, 'user2', 0);

-- --------------------------------------------------------

--
-- Table structure for table `uservotes`
--

CREATE TABLE `uservotes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `question_id` int(11) DEFAULT NULL,
  `selected_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`selected_options`)),
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uservotes`
--

INSERT INTO `uservotes` (`id`, `user_id`, `poll_id`, `question_id`, `selected_options`, `submission_date`) VALUES
(2, 1, 1, 1, '[1,2,3]', '2024-01-19 07:56:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `pollanalytics`
--
ALTER TABLE `pollanalytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `poll_id` (`poll_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `poll_id` (`poll_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uservotes`
--
ALTER TABLE `uservotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `poll_id` (`poll_id`),
  ADD KEY `question_id` (`question_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `pollanalytics`
--
ALTER TABLE `pollanalytics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `polls`
--
ALTER TABLE `polls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `uservotes`
--
ALTER TABLE `uservotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `options`
--
ALTER TABLE `options`
  ADD CONSTRAINT `options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Constraints for table `pollanalytics`
--
ALTER TABLE `pollanalytics`
  ADD CONSTRAINT `pollanalytics_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`),
  ADD CONSTRAINT `pollanalytics_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `options` (`id`);

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`);

--
-- Constraints for table `uservotes`
--
ALTER TABLE `uservotes`
  ADD CONSTRAINT `uservotes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `uservotes_ibfk_2` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`),
  ADD CONSTRAINT `uservotes_ibfk_3` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
