const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

router.get('/auth/login', (req, res) => {
    res.json({
        'path':'Home'
    });
});







app.use('/api', router);

exports.handler = serverless(app);