UserRouter.post('/scan', async (req, res) => {
    const { fullname } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: 'Fullname is required' });
    }

    try {
        const user = await User.findOne({ fullname });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if(user.scanCount > 0) {
            user.scanCount -= 1;
            user.lastScanDate = new Date(); // update last scan date to today
            await user.save();

            res.status(200).json({
                message: 'Scan successful',
                remainingScans: user.scanCount
            });
            return;
        }

        if (user.scanCount <= 0) {
            return res.status(403).json({ error: 'Scan limit reached for today' });
        }

    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: 'Server error during scan check' });
    }
});
