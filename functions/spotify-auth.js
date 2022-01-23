const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request');

const app = express();
const router = express.Router();

/** Variables */

const stateKey = 'spotify_auth_state';
const client_id = 'ed4bbc18b5e844f6a2831f60206892cd';
const client_secret = '468a9e5f6cb04e65989aa75b9898fd8d';
const redirect_uri = 'http://localhost:8888/api/auth/callback/'

/* Internal functions */
const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text+=possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


/** The routes */
router.get('/auth/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    console.log('Generated state: ' +state);
    
    res.redirect(
        'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id,
            scope: 'user-read-private user-read-email',
            redirect_uri,
            state
        })
    );
});

router.get('/auth/callback', (req, res, next) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state===null || state!== storedState){
        res.redirect(
            '/#'+
            querystring.stringify({
                error: 'state_mismatch'
            })
        );
    } else {
        res.clearCookie(stateKey);
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code,
                redirect_uri,
                grant_type: 'authorization_code',
            },
            headers: {
                Authorization:
                'Basic '+ 
                new Buffer(
                    client_id + ':' + client_secret
                ).toString('base64'),
            },
            json:true,
        };
        request.post(authOptions, (error, response, body) => {
            if(!error && response.statusCode ===200){
                let access_token = body.access_token,
                    expires_in = body.expires_in,
                    scope = body.scope, 
                    refresh_token = body.refresh_token;
                let uri = 'http://localhost:8888/spotify-auth';
                res.redirect(
                    uri +
                    '?' +
                    querystring.stringify({
                        access_token,
                        refresh_token,
                        scope,
                        expires_in
                    })
                );
            } else {
                res.redirect(uri+querystring.stringify({
                    error:'Invalid token'
                }));
            }

        });
    }
});

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    next();
  });


app.use('/api', router);

exports.handler = serverless(app);