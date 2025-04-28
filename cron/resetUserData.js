const cron = require('node-cron');
const User = require('../models/User.model');

// Runs every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      if (user.paid) {
        if (user.daysLeft > 0) {
          user.daysLeft -= 1;
          user.scanCount = 2; // Reset scan count
        }

        if (user.daysLeft === 0) {
          user.paid = false;
          user.scanCount = 0; 
        }

        await user.save();
      }
    }

    console.log('User data reset at midnight.');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
