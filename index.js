const express = require('express');
const bodyParser = require('body-parser');
const pollRoutes = require('./routes/pollRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.use('/polls', pollRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
