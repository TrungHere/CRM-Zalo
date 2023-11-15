const axios = require('axios')
const functions = require('../../../services/functions')
const HistoryZalo = require('../../../models/crm/Marketing/HistoryZalo');
const ManagerZalo = require('../../../models/crm/Marketing/ManagerZalo');
const ZaloSocial = require('zalo-sdk').ZaloSocial;
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAIP0eQ3ptzjM-RDn9lOfX6VLDFDAFdrpM' // 'your API key here'
});

// exports.handleZaloError = async (options, verify) => {
//     if (typeof options == 'function') {
//         verify = options;
//         options = {};
//     }
//     if (!verify) {
//         throw new TypeError('PassportZalo requires a verify callback');
//     }
//     if (!options.clientSecret) {
//         throw new TypeError('PassportZalo requires a verify clientSecret');
//     }
//     if (!options.clientID) {
//         throw new TypeError('PassportZalo requires a verify clientID');
//     }
//     if (!options.callbackURL) {
//         throw new TypeError('PassportZalo requires a verify callbackUrl');
//     }
//     this.name = 'zalo';
//     this.appSecret = options.clientSecret;
//     this.appId = options.clientID;
//     this.redirectUri = options.callbackURL;
//     this._verify = verify;

// }
exports.Strategy = async (req, res) => {
    const secret = req.body.secret
    const clientID = req.body.clientID
    const callbackURL = req.body.callbackURL
        // Kiểm tra các giá trị từ yêu cầu
        if (!secret) {
            throw new TypeError('Zalo login requires a verify clientSecret');
        }
        if (!clientID) {
            throw new TypeError('Zalo login requires a verify clientID');
        }
        if (!callbackURL) {
            throw new TypeError('Zalo login requires a verify callbackUrl');
        }
        
    var ZSClient = new ZaloSocial({
        appId: clientID,
        redirectUri: callbackURL,
        appSecret: secret
    });
    try {
        // kiểm tra yêu cầu để xem có lỗi nào không
        if (req.query && req.query.error_code && !req.query.error) {
            // return res.error(req.query.error_message);
            console.log(1)
            return functions.setError(res, "lỗi yêu cầu");
        }
        //chuyển hướng người dùng đến trang đăng nhập của Zalo
        if (!req.query || (req.query && !req.query.code)) {
            console.log(2)
            return res.redirect(ZSClient.getLoginUrl());
          
        } else {
            // Nếu người dùng đã đăng nhập, nó sẽ lấy mã truy cập và gọi API của Zalo để lấy thông tin người dùng. 
            console.log(3)
            ZSClient.getAccessTokenByOauthCode(req.query.code, function (response) {
                if (response && response.access_token) {
                    ZSClient.setAccessToken(response.access_token);
                    ZSClient.api('me', 'GET', {fields: 'id, name, birthday, gender, picture'}, function (response) {
                        if (response && !response.error) {
                            return functions.success(response.access_token, null, response, done);
                        } else {
                            return functions.setError(response);
                        }
                    });
                } else {
                    return functions.setError(response);
                }
            });
        }
    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
};




exports.getInfoUserAndFriend = async (req,res) =>{
    try{
        // const ZaloSocial = require('zalo-sdk').ZaloSocial;
        const dotenv = require("dotenv")
        const _ = console.log
        const appSecret = req.body.secret
        const appId = req.body.clientID
        const redirectUri = req.body.callbackURL
        const oauthCode = req.body.oauthCode

        dotenv.config()
        // const {
        //   APP_ID: appId,
        //   APP_REDIRECT_URI: redirectUri,
        //   APP_SECRET: appSecret,
        //   ZALO_ACCESS_TOKEN: accessToken,
        //   ZALO_OAUTH_CODE: oauthCode,
        // } = process.env

        const zsConfig = {appId, redirectUri, appSecret};

        const ZSClient = new ZaloSocial(zsConfig);

        const waitToken = new Promise((resolve, reject) => {
            ZSClient.getAccessTokenByOauthCode(oauthCode, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result && result.access_token);
                }
            });
        });
    
        waitToken.then(token => {
            console.log(token);
        }).catch(error => {
            console.error(error);
            res.status(500).send({ error: 'An error occurred' });
        });

        waitToken.then(token => _(token))

        waitToken.then(accessToken => {
          ZSClient.setAccessToken(accessToken);
          const waitApi = new Promise(rslv => {
            ZSClient.api('me', 'GET', { fields: 'id, name, birthday, gender, picture' }, (res) => {
              rslv(res);
            });
          })
      
          waitApi.then(res => _(res))
        })

        waitToken.then(accessToken => {
          ZSClient.setAccessToken(accessToken);
          const waitApi = new Promise(rslv => {
            ZSClient.api('me/invitable_friends', 'GET', { fields: 'id, name, birthday, gender, picture', limit: 20, offset: 5 }, (res) => {
              rslv(res);
            });
          })
      
          waitApi.then(res => _(res))
        })
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message)
    }

}

exports.testAPIkey = async (req, res) => {
    try{
        googleMapsClient.geocode({
            address: '1600 Amphitheatre Parkway, Mountain View, CA'
          }, function(err, response) {
            if (err) {
              console.log('Có lỗi xảy ra:', err);
            } else if (response.json.status === 'OK') {
              console.log('API key hoạt động bình thường');
            } else {
              console.log('Có vấn đề với API key:', response.json.status);
            }
          });
}catch(e){
    console.log(e)
    return functions.setError(res, e.message)
}

}

exports.takeLatLong = async (req, res) => {
try{
    const address = req.body.address
    if(address){
        console.log(address)
        googleMapsClient.geocode({
          address: "so 1 tran nguyen dan"
        }, function(err, response) {
          if (err) {
            // return functions.success(response.json.results , "Lấy thành công");
            console.log('Có lỗi xảy ra:', err);
          } else if (response.json.status === 'OK') {
            const location = response.json.results[0].geometry.location
            console.log('API key hoạt động bình thường', 'Vĩ độ:', location.lat ,'Kinh độ:', location.lng );
          }else{
            // return functions.setError(res, err.message)
            console.log('Có vấn đề với API key:', response.json.status);
          }
        })
    }
    // return functions.setError(res, "Nhập thiếu trường")
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message)
    }

}
exports.takeAddress = async (req, res) => {
try{
    const lat = req.body.lat
    const long = req.body.long
    if(lat && long){
        googleMapsClient.reverseGeocode({
          latlng: [lat, long],
        }, function(err, response) {
            if (err) {
                // return functions.success(response.json.results , "Lấy thành công");
                console.log('Có lỗi xảy ra:', err);
              } else if (response.json.status === 'OK') {
                // const location = response.json.results[0]
                console.log('API key hoạt động bình thường', response.json.results[0] );
              }else{
                // return functions.setError(res, err.message)
                console.log('Có vấn đề với API key:', response.json.status);
              }
        })
    }
    // return functions.setError(res, "Nhập thiếu trường")
    
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message)
    }

}