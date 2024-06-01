const express = require('express');
const axios = require('axios');
const path = require('path');
const session = require('express-session');

const app = express();

const GOOGLE_CLIENT_ID = '';
const GOOGLE_CLIENT_SECRET = '';
const GOOGLE_LOGIN_REDIRECT_URI = 'http://localhost:3000/login/redirect';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const FITBIT_CLIENT_ID = '';
const FITBIT_CLIENT_SECRET = '';
const FITBIT_LOGIN_REDIRECT_URI = 'http://localhost:3000/fitbit/redirect';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_USERINFO_URL = 'https://api.fitbit.com/1/user/-/profile.json';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'UI', 'view'));

app.use(express.static(path.join(__dirname, 'UI')));
app.use(session({ secret: 'random_secret_key', resave: false, saveUninitialized: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'UI', 'view', 'login.html'));
});

app.get('/login', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
    url += '&response_type=code';
    url += '&scope=email profile';
    res.redirect(url);
});

app.get('/login/redirect', async (req, res) => {
    const { code } = req.query;
    console.log(`Google code: ${code}`);

    try {
        const resp = await axios.post(GOOGLE_TOKEN_URL, null, {
            params: {
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
                grant_type: 'authorization_code',
            },
        });

        const { access_token } = resp.data;

        const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        req.session.googleUser = resp2.data;
        res.redirect('/fitbit/login');

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/fitbit/login', (req, res) => {
    let url = 'https://www.fitbit.com/oauth2/authorize';
    url += `?client_id=${FITBIT_CLIENT_ID}`;
    url += `&redirect_uri=${FITBIT_LOGIN_REDIRECT_URI}`;
    url += '&response_type=code';
    url += '&scope=activity profile';
    res.redirect(url);
});

app.get('/fitbit/redirect', async (req, res) => {
    const { code } = req.query;
    console.log(`Fitbit code: ${code}`);

    try {
        const resp = await axios.post(FITBIT_TOKEN_URL, null, {
            params: {
                code,
                client_id: FITBIT_CLIENT_ID,
                client_secret: FITBIT_CLIENT_SECRET,
                redirect_uri: FITBIT_LOGIN_REDIRECT_URI,
                grant_type: 'authorization_code',
            },
        });

        const { access_token } = resp.data;

        const fitbitUserInfo = await axios.get(FITBIT_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        res.render('index', {
            googleUser: req.session.googleUser,
            fitbitUser: fitbitUserInfo.data.user,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});