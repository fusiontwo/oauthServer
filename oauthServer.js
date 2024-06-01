const express = require('express');
const bodyParser = require('body-parser');
const FitbitApiClient = require('fitbit-node');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'UI', 'view'));

app.use(express.static(path.join(__dirname, 'UI')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let fitbitClient;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/UI/view/login.html');
});

app.post('/getInfo', (req, res) => {
    const clientId = req.body.clientId;
    const clientSecret = req.body.clientSecret;

    console.log(clientId)
    console.log(clientSecret)

    fitbitClient = new FitbitApiClient({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: 'http://localhost:3000/callback'
    });

    console.log(fitbitClient)
    // res.send(fitbitClient)

    // res.redirect(__dirname + '/UI/view/index.ejs');
    res.render('index', { clientId, clientSecret });
});


// 잘 안 됐던 부분 (아마 삭제)

// app.post('/login', (req, res) => {
//     if (!fitbitClient) {
//         res.send('<h1>Fitbit 클라이언트 정보가 없습니다.</h1>');
//         return;
//     }

//     const authUrl = fitbitClient.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', 'http://localhost:3000/callback');
//     res.redirect(authUrl);
// });

// app.get('/callback', async (req, res) => {
//     const code = req.query.code;

//     if (!fitbitClient) {
//         res.send('<h1>Fitbit 클라이언트 정보가 없습니다.</h1>');
//         return;
//     }

//     fitbitClient.getAccessToken(code, 'http://localhost:3000/callback').then(result => {
//         const accessToken = result.access_token;

//         fitbitClient.get('/profile.json', accessToken).then(response => {
//             const userData = response[0].user;

//             const htmlResponse = `
//                 <h1>Fitbit 유저 정보</h1>
//                 <p>이름: ${userData.fullName}</p>
//                 <p>나이: ${userData.age}</p>
//                 <p>성별: ${userData.gender}</p>
//                 <p>키: ${userData.height}</p>
//                 <p>몸무게: ${userData.weight}</p>
//             `;
//             res.send(htmlResponse);
//         }).catch(err => {
//             console.log(err);
//             res.send('<h1>사용자 정보를 가져오는 데 실패했습니다.</h1>');
//         });
//     }).catch(err => {
//         console.log(err);
//         res.send('<h1>로그인 실패</h1>');
//     });
// });

// 서버 시작
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
