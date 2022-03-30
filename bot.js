const telegramApi = require('node-telegram-bot-api');

const token = '2115651627:AAEqxTjFKIG40GgwNynQIfst9ZB--1kaqRU';

const bot = new telegramApi(token, { polling: true });

const request = require('request');

var mediaUserId;

const options = {

    inline_keyboard: [
        [{ text: 'FLY', callback_data: 'fly' }, { text: 'IBV', callback_data: 'ibv' }],
        [{ text: 'VAST', callback_data: 'vast' }, { text: 'OVERLAY', callback_data: 'overlay' }],
        [{ text: 'Прикрепить к рулу', callback_data: `distribute` }],
        [{ text: 'Получить теги', callback_data: `receive` }],
    ]

}

var siteId;
var tokenAdlook;

var strSiteStart;
var strNameStart;
var strEmailStart;

var site;
var name;
var email;

var vastId = '';
var flyId = '';
var ibvId = '';
var lastId = '';
var applicantId;

var messageId;

var jsMsg;

const sendReq = function(type, text, name, site, email) {
    const chatId = '-1001274619231';
    const methods = type;
    const apiURL = `https://api.telegram.org/bot${token}/${methods}?`;
    if (type == 'sendMessage') {
        request.post({
                url: apiURL,
                body: JSON.stringify({
                    'chat_id': chatId,
                    'text': `Паблишер зарегистрирован в системе ADlook\n\nСайт: ${site}\nИмя: ${name}\nПочта: ${email}\n\nVAST: ${vastId}\nFLY: ${flyId}\nIBV: ${ibvId}`,
                    'reply_markup': JSON.stringify(options)
                }),
                headers: { 'content-type': 'application/json' }
            },
            function(err, response, body) {
                // console.log('body tg', body);
                // console.log('err tg', err);
                // console.log('response tg', response);
            }
        )
    }

    if (type == 'editMessageText') {
        request.post({
                url: apiURL,
                body: JSON.stringify({
                    'chat_id': chatId,
                    'text': text,
                    'reply_markup': JSON.stringify(options),
                    'message_id': messageId
                }),
                headers: { 'content-type': 'application/json' }
            },
            function(err, response, body) {
                // console.log('body tg', body);
                // console.log('err tg', err);
                // console.log('response tg', response);
            }
        )
    }
}

function gen_password(len) {
    var password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }

    return password;
}

bot.on('callback_query', async msg => {
    messageId = msg.message.message_id;

    if (msg.data === 'vast') {
        // http://api.adlook.me/public/tags     VAST
        const paramsVast = {
            adTypeId: 2,
            apiFrameworks: [2],
            blockedCategories: [],
            blockedDomains: [],
            linearity: 1,
            maxBitrate: 4000,
            maxDuration: 300,
            mimeTypes: [1, 4, 5, 6, 7, 8, 9, 17], // 1,9,7
            minBitrate: 50,
            minDuration: 5,
            name: site + ' vast',
            playbackMethods: [2], // 2
            siteId: siteId,
            sizeId: 5,
            startDelay: 0
        }

        request.post({
                url: 'http://api.adlook.me/public/tags',
                body: JSON.stringify(paramsVast),
                headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
            },
            function(err, response, body) {
                if (!response.headers.location) {
                    return;
                }
                
                var startId = response.headers.location.lastIndexOf("/");
                var tagId = response.headers.location.substring(startId + 1);
                vastId = tagId;
                lastId = vastId;
                var t = msg.message.text.replace("VAST:", `VAST: ${vastId}`);
                request.put({
                        // put frame
                        url: `http://api.adlook.me/public/tags/${tagId}/apiFrameworks`,
                        body: JSON.stringify({
                            items: [2],
                            whiteList: true
                        }),
                        headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                    },
                    function(err, response, body) {

                    }
                );
                request.put({
                        // put frame
                        url: `http://api.adlook.me/public/tags/${tagId}/playbackMethods`,
                        body: JSON.stringify({
                            items: [2],
                            whiteList: true
                        }),
                        headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                    },
                    function(err, response, body) {

                    }
                );
                request.put({
                        // put frame
                        url: `http://api.adlook.me/public/tags/${tagId}/mimeTypes`,
                        body: JSON.stringify({
                            items: [1, 4, 5, 6, 7, 8, 9, 17],
                            whiteList: true
                        }),
                        headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                    },
                    function(err, response, body) {

                    }
                );

                sendReq('editMessageText', t);
            }
        );
    } else if (msg.data === 'fly') {

        const paramsOutstream = {
            adTypeId: 5,
            blockedCategories: [],
            blockedDomains: [],
            name: site + ' fly',
            siteId: siteId
        }

        request.post({
                url: 'http://api.adlook.me/public/tags',
                body: JSON.stringify(paramsOutstream),
                headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
            },
            function(err, response, body) {
                if (!response.headers.location) {
                    return;
                }
                
                var startId = response.headers.location.lastIndexOf("/");
                var tagId = response.headers.location.substring(startId + 1);
                flyId = tagId;
                lastId = flyId;
                var t = msg.message.text.replace("FLY:", `FLY: ${flyId}`);
                sendReq("editMessageText", t);
            }
        );
    } else if (msg.data === 'ibv') {

        const paramsOutstream = {
            adTypeId: 5,
            blockedCategories: [],
            blockedDomains: [],
            name: site + ' ibv',
            siteId: siteId
        }

        request.post({
                url: 'http://api.adlook.me/public/tags',
                body: JSON.stringify(paramsOutstream),
                headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
            },
            function(err, response, body) {
                if (!response.headers.location) {
                    return;
                }

                var startId = response.headers.location.lastIndexOf("/");
                var tagId = response.headers.location.substring(startId + 1);
                ibvId = tagId;
                lastId = ibvId;
                var t = msg.message.text.replace("IBV:", `IBV: ${tagId}`);
                sendReq("editMessageText", t);
            }
        );
    } else if (msg.data === 'receive') {
        var one = msg.message.text.indexOf("Сайт: ") + 6;
        var two = msg.message.text.indexOf("Имя: "); // +5
        var siteTag = msg.message.text.substring(one, two - 1);
        mediaUserId = msg.from.id;
        const methods = 'sendMessage';
        const apiURL = `https://api.telegram.org/bot${token}/${methods}?`;
        request.post({
                url: apiURL,
                body: JSON.stringify({
                    'chat_id': mediaUserId,
                    'text': `ТЕГИ    ${siteTag}
-------
🔴 Fly Roll
<!-- Paste next code to the place where in-read ad should appear -->
<div class="tgx-rlf" data-rlf-id="${flyId}" data-rlf-auto="1" data-rlf-flt="1" data-rlf-dock="0" data-rlf-align="rb" data-rlf-min-time="60" data-rlf-fw="600"></div>
<!-- Paste next line before closing BODY tag -->
<script defer src="https://cdn.adlook.me/js/rlf.js"></script>
-------
🔵 IBV
<!-- Paste next code to the place where in-banner ad should appear -->
<div  class="tgx-vbf" data-vbf-id="${ibvId}" data-vbf-exp="1" data-vbf-hide="0" data-vbf-loop="10" data-vbf-w="400" data-vbf-h="225"></div>
<!-- Paste next line before closing BODY tag -->
<script defer src="https://cdn.adlook.me/js/vbf.js"></script>
-------
⚫️ VAST
https://ads.adlook.me/vast?id=${vastId}`
                }),
                headers: { 'content-type': 'application/json' }
            },
            function(err, response, body) {

            }
        )
    } else if (msg.data === 'distribute') {
        request.get({
            // distribute tags
            url: `http://api.adlook.me/public/tags/${lastId}/distribute`,
            headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
        },
        function(err, response, body) {
            if (!err) {
                var t = msg.message.text.replace(lastId, `${lastId} (подключен)`);
                sendReq("editMessageText", t);
            }
        }
    );
    } else {
        console.log(msg);
        jsMsg = JSON.parse(msg.data);
        if (jsMsg.status == 'ok') {
            strSiteStart = msg.message.text.indexOf("Сайт: ") + 6;
            strNameStart = msg.message.text.indexOf("Имя: "); // +5
            strEmailStart = msg.message.text.indexOf("Email: "); // +7

            site = msg.message.text.substring(strSiteStart, strNameStart - 1);
            name = msg.message.text.substring(strNameStart + 5, strEmailStart - 1);
            email = msg.message.text.substring(strEmailStart + 7);

            vastId = '';
            flyId = '';
            ibvId = '';
            applicantId = '';

            var pass = gen_password(10);
            applicantId = jsMsg.id;

            var params = {
                "applicantId": applicantId, // TUT
                "name": name,
                "email": email,
                "password": pass,
                "addWebsite": true,
                "website": site,
                "paymentTerms": 30,
                "sendWelcome": true,
                "welcomeHTML": `<html xmlns="http://www.w3.org/1999/xhtml"><head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Sidekick!</title>
                <style type="text/css">
                    /* Based on The MailChimp Reset INLINE: Yes. */  
                    @import url(http://fonts.googleapis.com/css?family=Comfortaa);
            
                    /* Client-specific Styles */
                    #outlook a {padding:0;} /* Force Outlook to provide a "view in browser" menu link. */
                    body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;} 
                    /* Prevent Webkit and Windows Mobile platforms from changing default font sizes.*/ 
                    .ExternalClass {width:100%;} /* Force Hotmail to display emails at full width */  
                    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
                    /* Forces Hotmail to display normal line spacing.  More on that: http://www.emailonacid.com/forum/viewthread/43/ */ 
                    #backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
                    /* End reset */
            
                    /* Some sensible defaults for images
                    Bring inline: Yes. */
                    img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;} 
                    a img {border:none;} 
                    .image_fix {display:block;}
            
                    /* Yahoo paragraph fix
                    Bring inline: Yes. */
                    p {margin: 1em 0;font-family: "Segoe UI", Arial, sans-serif;line-height: 1.5em;color: #515151 !important;}
            
                    /* Hotmail header color reset
                    Bring inline: Yes. */
                    h1, h2, h3, h4, h5, h6 {color: black;font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;}
            
                    h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: #014054 !important;}
            
                    h1{color:#04A6DF !important;}
                    h2{color:#B7B7B7 !important;}
                    h3{color:#626262 !important;font-size: 20px;}
                    h4{ margin: 0.5em;}
                     
                    /* Outlook 07, 10 Padding issue fix
                    Bring inline: No.*/
                    table td {border-collapse: collapse;}
            
                    /* Remove spacing around Outlook 07, 10 tables
                    Bring inline: Yes */
                    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
            
                    /* Styling your links has become much simpler with the new Yahoo.  In fact, it falls in line with the main credo of styling in email and make sure to bring your styles inline.  Your link colors will be uniform across clients when brought inline.
                    Bring inline: Yes. */
                    a {color: #04A6DF;}
            
                    /***************************************************
                    ****************************************************
                    MOBILE TARGETING
                    ****************************************************
                    ***************************************************/
                    @media only screen and (max-device-width: 480px) {
                        /* Part one of controlling phone number linking for mobile. */
                        a[href^="tel"], a[href^="sms"] {
                                    text-decoration: none;
                                    color: blue; /* or whatever your want */
                                    pointer-events: none;
                                    cursor: default;
                                }
            
                        .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
                                    text-decoration: default;
                                    color: orange !important;
                                    pointer-events: auto;
                                    cursor: default;
                                }
            
                    }
            
                    /* More Specific Targeting */
            
                    @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
                    /* You guessed it, ipad (tablets, smaller screens, etc) */
                        /* repeating for the ipad */
                        a[href^="tel"], a[href^="sms"] {
                                    text-decoration: none;
                                    color: blue; /* or whatever your want */
                                    pointer-events: none;
                                    cursor: default;
                                }
            
                        .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
                                    text-decoration: default;
                                    color: orange !important;
                                    pointer-events: auto;
                                    cursor: default;
                                }
                    }
            
                    @media only screen and (-webkit-min-device-pixel-ratio: 2) {
                    /* Put your iPhone 4g styles in here */ 
                    }
            
                    /* Android targeting */
                    @media only screen and (-webkit-device-pixel-ratio:.75){
                    /* Put CSS for low density (ldpi) Android layouts in here */
                    }
                    @media only screen and (-webkit-device-pixel-ratio:1){
                    /* Put CSS for medium density (mdpi) Android layouts in here */
                    }
                    @media only screen and (-webkit-device-pixel-ratio:1.5){
                    /* Put CSS for high density (hdpi) Android layouts in here */
                    }
                    /* end Android targeting */
            
                </style>
            </head>
            <body>
            
            <!-- Wrapper/Container Table: Use a wrapper table to control the width and the background color consistently of your email. Use this approach instead of setting attributes on the body tag. -->
            <table cellpadding="0" cellspacing="0" border="0" id="backgroundTable">
                <tbody><tr>
                    <td valign="top">
                        <!-- Tables are the most common way to format your email consistently. Set your table widths inside cells and in most cases reset cellpadding, cellspacing, and border to zero. Use nested tables as a way to space effectively in your message. -->
                        <table cellpadding="0" cellspacing="0" border="0" align="center">
                            <tbody><tr>
                                <td width="600" colspan="3" height="1" bgcolor="#EDEDED" cellpadding="0" cellspacing="0"></td>
                            </tr>
                            <tr>
                                <td width="600" colspan="3" valign="top" align="center" cellpadding="10">
                                    <h1>Welcome to ADlook SSP!</h1>
                                </td>
                            </tr>
                            <tr>
                                <td width="600" colspan="3" height="1" bgcolor="#EDEDED" cellpadding="0" cellspacing="0"></td>
                            </tr>
                            <tr>
                                <td width="600" colspan="3" cellpadding="0" cellspacing="0">
                                    <p>Thank you for registering to ADlook SSP, the power of mobile automation.</p>
                                    <p>Here are your login details:</p>
                                    <p class="alt">
                                        <strong>Url:</strong> <a href="https://dash.adlook.me/">dash.adlook.me</a><br>
                                        <strong>Login:</strong> ${email}<br>
                                        <strong>Password:</strong> ${pass}<br>
                                    </p>
                                    <p>
                                        Looking forward to see you around in ADlook, feel free to <a href="mailto:support@adlook.me">contact us</a> in case you need help with your account.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td width="600" colspan="3" height="1" bgcolor="#EDEDED" cellpadding="0" cellspacing="0"></td>
                            </tr>
                            <tr>
                                <td colspan="3" width="600" cellspacing="10" align="center" cellpadding="5">
                                    <h2>Thanks for working with us!</h2>
                                    <h3>ADlook Team</h3>
                                </td>
                            </tr>
                        </tbody></table>
                    </td>
                </tr>
            </tbody></table>
            <!-- End of wrapper table -->
            
            
            </body></html>` // верстка емейла
            }

            // console.log("name users: ", name);
            // console.log("pass users: ", pass);
            // console.log("email users: ", email);
            // console.log("site users: ", site);

            var par2 = {
                "grant_type": "password",
                "client_id": "nV9bB3gV0aW1iA3vC9wJ3eP2nR0zF6wPnK5mY2wW3fX2dS9o",
                "username": "a.osipov@adlook.me",
                "password": "12345"
            }

            request.post({
                    // authorization and receiving token
                    url: 'http://api.adlook.me/public/oauth2/access_token',
                    body: JSON.stringify(par2),
                    headers: { 'content-type': 'application/json' }
                },
                function(err, response, body) {
                    // console.log('err token', err);
                    tokenAdlook = JSON.parse(body).access_token;
                    request.post({
                            // registration new pub
                            url: 'http://api.adlook.me/public/applicants/new_user',
                            body: JSON.stringify(params),
                            headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                        },
                        function(err, response, body) {
                            // console.log('err reg ', err);
                            if (!response.headers.location) {
                                return;
                            }
                            var startId = response.headers.location.lastIndexOf("/"); // || null
                            var userId = response.headers.location.substring(startId + 1);
                            if (!err && userId) {
                                sendReq('sendMessage', '', name, site, email);
                                // get info about user
                                request.get({
                                        url: `http://api.adlook.me/public/users/${userId}`,
                                        headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                                    },
                                    function(err, response, body) {
                                        // console.log("err user", err);
                                        var pubId = JSON.parse(body).publisherIds[0];
                                        // console.log(pubId);
                                        request.get({
                                                // get publishers sites
                                                url: `http://api.adlook.me/public/users/${userId}/publishers/${pubId}/sites`,
                                                headers: { 'content-type': 'application/json', 'Authorization': tokenAdlook }
                                            },
                                            function(err, response, body) {
                                                // console.log('body ', body);
                                                // console.log("err pub", err);
                                                siteId = JSON.parse(body)._embedded.items[0].id;
                                                // console.log(siteId);
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    );
                }
            )
        }
    }
})