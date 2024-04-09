const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./Usermodule');
const cors = require('cors');
const multer = require('multer');
const TimeEntry = require('./TimeEntry')
const AdminMessage = require('./AdminMessage')
const path = require('path'); 
const LeaveRequest = require('./LeaveRequest'); 
const app = express();
app.use(bodyParser.json());

app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });


  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect("mongodb+srv://gowthamahendiran:rmrh7LWA7oZMz31I@tronlogix-time-db.zhsbcwe.mongodb.net/?retryWrites=true&w=majority&appName=tronlogix-time-db", { useNewUrlParser: true, useUnifiedTopology: true });


app.post('/signup', upload.single('profileImage'), async (req, res) => {
    try {
      const { name, email, password, employeeId, role , category } = req.body;
      const user = await User.create({ name, email, password, employeeId, role, profileImage: req.file.path , category });
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(400).json({ message: 'Signup failed', error });
    }
  });

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(400).json({ message: 'Login failed', error });
    }
});

app.get('/employees', async (req, res) => {
    try {
        const employees = await User.find({});
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees', error });
    }
});


app.put('/update-profile-picture/:userId', upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const profileImage = req.file.path;

        const user = await User.findByIdAndUpdate(userId, { profileImage }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile picture updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile picture', error });
    }
});



app.post('/timesheet/timein/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { timeIn } = req.body;
        const existingEntry = await TimeEntry.findOne({ userId, timeOut: null });
        if (existingEntry) {
            return res.status(400).json({ message: 'Time In already recorded' });
        }
        const newEntry = await TimeEntry.create({ userId, timeIn });
        res.status(201).json({ message: 'Time In recorded successfully', entry: newEntry });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record Time In', error });
    }
});

app.post('/timesheet/timeout/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { timeOut } = req.body;
        const existingEntry = await TimeEntry.findOne({ userId, timeOut: null });
        if (!existingEntry) {
            return res.status(400).json({ message: 'Time In has not been recorded' });
        }
        existingEntry.timeOut = timeOut;
        await existingEntry.save();
        res.status(200).json({ message: 'Time Out recorded successfully', entry: existingEntry });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record Time Out', error });
    }
});

app.get('/timesheet/:userId/entries', async (req, res) => {
    try {
        const userId = req.params.userId;
        const entries = await TimeEntry.find({ userId });
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch time entries', error });
    }
});

app.get('/timesheet/:userId/latest-entry', async (req, res) => {
    try {
        const userId = req.params.userId;
        const latestEntry = await TimeEntry.findOne({ userId }).sort({ createdAt: -1 });
        if (latestEntry) {
            res.status(200).json(latestEntry);
        } else {
            res.status(404).json({ message: 'No time entry found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch latest time entry', error });
    }
});


app.post('/admin/message', async (req, res) => {
    try {
        const { message } = req.body;
        const adminMessage = await AdminMessage.create({ message });
        res.status(201).json({ message: 'Admin message stored successfully', adminMessage });
    } catch (error) {
        res.status(400).json({ message: 'Failed to store admin message', error });
    }
});

app.get('/admin/message/latest', async (req, res) => {
    try {
        const latestMessage = await AdminMessage.findOne().sort({ createdAt: -1 });
        res.status(200).json(latestMessage);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch latest admin message', error });
    }
});

app.post('/leave-request', async (req, res) => {
    try {
        const { name, email, fromDate, toDate, totalDays, reasonLeave, message } = req.body;
        const leaveRequest = await LeaveRequest.create({ name, email, fromDate, toDate, totalDays, reasonLeave, message });
        res.status(201).json({ message: 'Leave request stored successfully', leaveRequest });
    } catch (error) {
        res.status(400).json({ message: 'Failed to store leave request', error });
    }
});

app.get('/leave-history/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const leaveHistory = await LeaveRequest.find({ email });
      res.status(200).json(leaveHistory);
    } catch (error) {
      console.error("Error fetching leave history:", error);
      res.status(500).json({ message: 'Failed to fetch leave history' });
    }
  });

  app.get('/admin/leave-requests', async (req, res) => {
    try {
        const allLeaveRequests = await LeaveRequest.find();
        res.status(200).json(allLeaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch leave requests', error });
    }
});

app.put('/admin/leave-requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status, AdminLeaveMessage } = req.body; 

        const leaveRequest = await LeaveRequest.findByIdAndUpdate(requestId, { status, AdminLeaveMessage }, { new: true });

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        res.status(200).json({ message: 'Leave request updated successfully', leaveRequest });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update leave request', error });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
