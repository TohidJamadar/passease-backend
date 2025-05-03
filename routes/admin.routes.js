  const express = require('express');
  const bcrypt = require('bcrypt');
  const User = require('../models/User.model');

  const AdminRouter = express.Router();

  const VerifiedByAdmin = async (req, res) => {
      const { fullname } = req.body;

      if (!fullname) {
          return res.status(400).json({ error: 'Fullname is required' });
      }

      try {
          const user = await User.findOne({ fullname });

          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
                                                            
          user.isVerified = true;                                                          
          await user.save();

          res.status(200).json({ message: 'User verified successfully', user });
      } catch (error) {                   
          console.error('Verification error:', error);
          res.status(500).json({ error: 'Server error during verification' });
      }
  };

  AdminRouter.post('/verify', VerifiedByAdmin);

  AdminRouter.post('/reject', async (req, res) => {
      try {
        const { fullname, rejectMessage } = req.body;
    
        const user = await User.findOne({ fullname });
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        user.isVerified = false;
        user.rejectMessage = rejectMessage;
    
        await user.save();
    
        res.status(200).json({ message: 'User rejected with message' });
      } catch (error) {
        console.error('Reject failed:', error);
        res.status(500).json({ error: 'Server error' });
      }
  });

  AdminRouter.get('/analytics', async (req, res) => {
    try {
      const users = await User.find({});
      const routeCounts = {};
      let total = 0;
  
      users.forEach(user => {
        const route = user.route;
        if (route) {
          routeCounts[route] = (routeCounts[route] || 0) + 1;
          total++;
        }
      });
  
      res.status(200).json({ data: routeCounts, total });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Server error during analytics' });
    }
  });
  

    
  module.exports = AdminRouter;
