const axios = require('axios')
const functions = require('../../../services/functions')
const HistoryZalo = require('../../../models/crm/Marketing/HistoryZalo');
const ManagerZalo = require('../../../models/crm/Marketing/ManagerZalo');
const ZaloOAPermission = require('../../../models/crm/Marketing/ZaloOAPermission');
const ZaloSocial = require('zalo-sdk').ZaloSocial;
const FB = require('fb');
const { constants } = require('fs');
const crypto = require('crypto');
require('dotenv').config()
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY // 'your API key here'
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
        
    const ZSClient = new ZaloSocial({
        appId: clientID,
        redirectUri: callbackURL,
        appSecret: secret
    });
    console.log(ZSClient)
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
        googleMapsClient.geocode({
          address: "so 1 tran nguyen dan"
        }, function(err, response) {
          if (err) {
            // console.log('Có lỗi xảy ra:', err);
             return functions.setError(res, err.message)

          } else if (response.json.status === 'OK') {
            const location = response.json.results[0].geometry.location
            const lat = location.lat
            const long = location.lng
            return functions.success(res , 'API key hoạt động bình thường', {'Vĩ độ:': lat ,'Kinh độ:': long } )

          }else{
            // return functions.setError(res, err.message)
            // console.log('Có vấn đề với API key:', response.json.status);
            return functions.setError(res, "có vấn đề về api key")
          }
        })
    }else{
      return functions.setError(res, "Nhập thiếu trường")

    }
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
              // console.log('Có lỗi xảy ra:', err);
              return functions.setError(res, err.message)
              } else if (response.json.status === 'OK') {
                const location = response.json.results[0]
                // console.log('API key hoạt động bình thường', response.json.results[0] );
                return functions.success(res , 'API key hoạt động bình thường', {"Địa chỉ" : location } )
              }else{
                 // return functions.setError(res, err.message)
                // console.log('Có vấn đề với API key:', response.json.status);
                return functions.setError(res, "có vấn đề về api key")
              }
        })
      }else{
        return functions.setError(res, "Nhập thiếu trường")
  
      }
    
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message)
    }

}



exports.webhook = async (req, res) => {
  try{
    const OAsecretKey = "aXHoSlryZXxPMXV1koOm"
    const appID = "2474451999345960065"
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    // console.log(req.body)
    // console.log(to_id,message)
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
          let access_token = check.access_token
          const raw_verify = appID + JSON.stringify(req.body) + req.body.timestamp + OAsecretKey;
          const mac = crypto.createHash('sha256').update(raw_verify).digest('hex');
          const response = await axios({// Lấy dữ liệu từ Zalo Server
            method: "post",
            url: `https://hungha365.com/`,
            data: req.body,
            headers: {
                "Content-Type": "application/json",
                "X-ZEvent-Signature": mac,
                "access_token": access_token
            }
          })
          console.log('Received data:', response.data);
      }
    

  // Xử lý dữ liệu ở đây
  // ...

  // res.json({ message: 'Webhook received successfully' });
    
}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
exports.webhook = async (req, res) => {
  try{
    const OAsecretKey = "aXHoSlryZXxPMXV1koOm"
    const appID = "2474451999345960065"


          const raw_verify = appID + JSON.stringify(req.body) + req.body.timestamp + OAsecretKey;
          const mac = crypto.createHash('sha256').update(raw_verify).digest('hex');
          // const response = await axios({// Lấy dữ liệu từ Zalo Server
          //   method: "post",
          //   url: `https://hungha365.com/`,
          //   data: req.body,
          //   headers: {
          //       "Content-Type": "application/json",
          //       "X-ZEvent-Signature": mac,
          //   }
          // })
          console.log('Received data:', req.body);
    

  // Xử lý dữ liệu ở đây
  // ...

  // res.json({ message: 'Webhook received successfully' });
    
}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
exports.getPermission = async (req, res) => {
  try{
    
     return res.redirect(`https://oauth.zaloapp.com/v4/oa/permission?app_id=2474451999345960065&redirect_uri=https%3A%2F%2Fhungha365.com%2F`);
    
}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
exports.checkID = async (req, res) => {
  try{
    const id_oa = req.body.id_oa;
    const access_token = 'LyvNBFDuRWvHmreWyNLY3bJ7No_oQm5B4fbu1AnvCdrhZsqGcpGcSN7XOHVI9nXJ2T9a7jOpAZannb9UqW8T0X7PL4RjBXqN3EPSSTmUEISs_LP-n2iQNIJwG0J-JXn-0A0ZKVHsUX1Uc2Srf6rGRLshBZsa6nfaUTnd7PauNMvymnWjW7HM0cgy2bkCK6uVJx46V9jWMJ5NiJWJYW9XPsZVNmQF7W1eBCew3ESWKayWqJ9eWYaDJ7RzTocW5pOFOFm2USKIFJqwoNb6ucP34aU385EYO5GEQQW-STSJM2eMfH9Vn79yVIUVEmRnMWz5Jvul8vb9JKH7WN82Wb9BS5I5TWksFn4nRUH_TCis7pGqntPlo3K88MpGI0-oDN9-LUGyKFOZ22GIxqHGqZyk2aGvau8D5_1YQ0y'
    const response = await axios({
      method: "get",
      url: `https://openapi.zalo.me/v2.0/oa/getprofile?data=%7B%22user_id%22%3A%22${id_oa}%22%7D`,
      headers: {
          "Content-Type": "application/json",
          "access_token": access_token
      }
    })
    console.log(response?.data?.data)

}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}


exports.getToken = async (req, res) => {
  try{
    const app_id = "2474451999345960065";
    const secret_key = "XdIjXdI7ZQ3ROiR2k1lE";
    const grant_type =  "authorization_code";
    const code = req.body.code;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    //Ktra
    const check = await ZaloOAPermission.findOne({
      idQLC : Number(userId),
      com_id : Number(com_id),
    }).select("code").lean()
    // const code = check.code;

    const response = await axios({
      method: "post",
      url: `https://oauth.zaloapp.com/v4/oa/access_token`,
      data: {
          "code": code,
          "app_id": app_id,
          "grant_type": grant_type,
      },
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "secret_key": secret_key
      }
    })
    // console.log(response.data)
    if (response.data.access_token) {
      if(check){
        // Cập nhật thông tin người dùng
        await ZaloOAPermission.updateOne({ 
          com_id: Number(com_id), 
          idQLC : Number(userId),
        }, { 
          $set: {
            secret_key: secret_key, 
            app_id: app_id, 
            access_token: response.data.access_token, 
            refresh_token: response.data.refresh_token, 
            create_at: new Date() 
          } 
          })
          return functions.success(res, "Cập nhật thành công",{
            access_token :response.data.access_token,
            refresh_token: response.data.refresh_token, 
          })
      }else{
        // Thêm mới thông tin người dùng
        let max = await functions.getMaxIdByField(ZaloOAPermission, "_id")
        const insert = new ZaloOAPermission({
          _id : max ,
          idQLC : userId,
          com_id : com_id,
          secret_key: secret_key, 
          app_id: app_id, 
          access_token: response.data.access_token, 
          refresh_token: response.data.refresh_token, 
          create_at: new Date() 
        })
        await insert.save()
        return functions.success(res, "Thêm thành công",{
          access_token :response.data.access_token,
          refresh_token: response.data.refresh_token, 
        })
      }
  }
  //Bắt lỗi////////////////////////////////////////////////
  else if (response.data.error == -14019) {

     return functions.setError(res, 'Code hết hạn.'
   )
  }
  else if (response.data.error == -14020) {

     return functions.setError(res, 'Refresh token hết hạn.'
     )
  }
  else if (response.data.error == -14014) {
     return functions.setError(res, 'Refresh token không chính xác'
     )
  }
  else if (response.data.error == -14002) {
     return functions.setError(res, 'App Id không chính xác'
     )
  }
  else if (response.data.error == -14004) {
     return functions.setError(res, 'Secret key không chính xác'
     )
  }
  else {
     return functions.setError(res, response.data.error_name
     )
  }

}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
const refreshTokenZalo = async (app_id, secret_key, refresh_token, com_id, userId) => {
  try {
      const response = await axios({
          method: "post",
          url: `https://oauth.zaloapp.com/v4/oa/access_token`,
          data: {
              "refresh_token": refresh_token,
              "app_id": app_id,
              "grant_type": "refresh_token",
          },
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "secret_key": secret_key
          }
      })
      if (response.data.access_token) {
       // Cập nhật thông tin người dùng
        await ZaloOAPermission.updateOne({ 
          com_id: Number(com_id), 
          idQLC : Number(userId),
        }, { 
          $set: { 
            access_token: response.data.access_token, 
            refresh_token: response.data.refresh_token, 
            create_at: new Date() 
          } 
          })
          return {
              err: false,
              message: response.data.access_token
          }
      }
      if (response.data.error == -14020) {
          return {
              err: true,
              message: 'Refresh token hết hạn.'
          }
      }
      if (response.data.error == -14014) {
          return {
              err: true,
              message: 'Refresh token không chính xác'
          }
      }
      if (response.data.error == -14002) {
          return {
              err: true,
              message: 'App Id không chính xác'
          }
      }
      if (response.data.error == -14004) {
          return {
              err: true,
              message: 'Secret key không chính xác'
          }
      }
      else {
          return {
              err: true,
              message: response.data.error_name
          }
      }
  } catch (err) {
      console.log(err)
      return {
          err: true,
          message: err.message
      }
  }
}
exports.sendFile = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const message = req.body.message ;
    const url = req.body.url ;
    const to_id = req.body.to_id ;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    // console.log(to_id,message)
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "post",
            url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
            data: {
              "recipient": {
                "user_id": to_id
              },
              "message": {
                "attachment": {
                  "payload": {
                    "token": "token"
                  },
                  "type": "file"
                }
              }
            },
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        if (response.data?.error == -216) {
            responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "post",
                url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
                data: {
                  "recipient": {
                    "user_id": to_id
                  },
                  "message": {
                    "attachment": {
                      "payload": {
                        "token": "token"
                      },
                      "type": "file"
                    }
                  }
                },
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.sendMessageWithImgV2 = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const message = req.body.message ;
    const url = req.body.url ;
    const to_id = req.body.to_id ;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    // console.log(to_id,message)
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "post",
            url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
            data: {
              "recipient": {
                "user_id": to_id
              },
              "message": {
                "attachment": {
                  "payload": {
                    "elements": [
                      {
                        "image_url": "https://developers.zalo.me/web/static/zalo.png",
                        "subtitle": "Đang yêu cầu thông tin từ bạn",
                        "title": message
                      }
                    ],
                    "template_type": "request_user_info"
                  },
                  "type": "template"
                }
              }
            },
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "post",
                url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
                data: {
                      "recipient": {
                        "user_id": to_id
                      },
                      "message": {
                        "attachment": {
                          "payload": {
                            "elements": [
                              {
                                "media_type": "image",
                                "url": "https://stc-developers.zdn.vn/images/bg_1.jpg"
                              }
                            ],
                            "template_type": "media"
                          },
                          "type": "template"
                        },
                        "text": message
                      }
                },
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.sendMessageWithIMG = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const message = req.body.message ;
    const url = req.body.url ;
    const to_id = req.body.to_id ;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    // console.log(to_id,message)
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "post",
            url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
            data: {
                  "recipient": {
                    "user_id": to_id
                  },
                  "message": {
                    "attachment": {
                      "payload": {
                        "elements": [
                          {
                            "media_type": "image",
                            "url": "https://stc-developers.zdn.vn/images/bg_1.jpg"
                          }
                        ],
                        "template_type": "media"
                      },
                      "type": "template"
                    },
                    "text": message
                  }
            },
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "post",
                url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
                data: {
                      "recipient": {
                        "user_id": to_id
                      },
                      "message": {
                        "attachment": {
                          "payload": {
                            "elements": [
                              {
                                "media_type": "image",
                                "url": "https://stc-developers.zdn.vn/images/bg_1.jpg"
                              }
                            ],
                            "template_type": "media"
                          },
                          "type": "template"
                        },
                        "text": message
                      }
                },
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.sendMessageText = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const message = req.body.message ;
    const to_id = req.body.to_id ;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    // console.log(to_id,message)
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "post",
            url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
            data: {
                 "recipient": {
                   "user_id": to_id
                 },
                 "message": {
                   "text": message
                 }
            },
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "post",
                url: `https://openapi.zalo.me/v3.0/oa/message/cs`,
                data: {
                     "recipient": {
                       "user_id": to_id
                     },
                     "message": {
                       "text": message
                     }
                },
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.get1ListMessage = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    const to_id = req.body.to_id ;

      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "get",
            url: `https://openapi.zalo.me/v2.0/oa/conversation?data=%7B%22offset%22%3A${page}%2C%22user_id%22%3A${to_id}%2C%22count%22%3A${pageSize}%7D`,
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        // console.log(response.data)
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "get",
                url: `https://openapi.zalo.me/v2.0/oa/conversation?data=%7B%22offset%22%3A${page}%2C%22user_id%22%3A${to_id}%2C%22count%22%3A${pageSize}%7D`,
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "Lấy danh sách 1 đoạn hội thoại thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.getListUserCare = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
    const to_id = req.body.to_id ;

      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "get",
            url: `https://openapi.zalo.me/v2.0/oa/getfollowers?data=%7B%22offset%22%3A${page}%2C%22count%22%3A${pageSize}%7D`,
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        // console.log(response.data)
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "get",
                url: `https://openapi.zalo.me/v2.0/oa/getfollowers?data=%7B%22offset%22%3A${page}%2C%22count%22%3A${pageSize}%7D`,
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }

        const followers = response?.data?.data?.followers
        // console.log(followers);
        let userIds = []
        if(followers) userIds = followers.map(item => item.user_id);
        // console.log(userIds);
        let data = []
        for(let i = 0 ; i < userIds.length ; i++){
          const respon = await axios({
            method: "get",
            url: `https://openapi.zalo.me/v2.0/oa/getprofile?data=%7B%22user_id%22%3A%22${userIds[i]}%22%7D`,
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        // console.log(respon?.data)
        if(respon?.data?.error == 0) {
          data.push(respon?.data)
        //   const dataUser = respon?.data?.data
        //   console.log(dataUser)
        //   await axios({
        //     method: 'post',
        //     url: 'http://localhost:9007/api/conversations/createUserZalo',
        //     data: {
        //       user_id:dataUser?.user_id,
        //       oa_id:"579745863508352884",
        //       app_id:"2474451999345960065",
        //       userName:dataUser?.display_name,
        //       avatar:dataUser?.avatar,
        //     },
        //     headers: { 'Content-Type': 'multipart/form-data' },
        // });
        }
        }
        return functions.success(
          res, 
          "Lấy danh sách người dùng quan tâm thành công", 
        { data: data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.getListMessage = async (req, res, next) => {
  try {   
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize || 10;
    const userId = req.user.data.idQLC;
    const com_id = req.user.data.com_id;
      const check = await ZaloOAPermission.findOne({
        idQLC : Number(userId),
        com_id : Number(com_id),
      }).lean()
      if(check){
        let access_token = check.access_token
        const response = await axios({
            method: "get",
            url: `https://openapi.zalo.me/v2.0/oa/listrecentchat?data=%7B%22offset%22%3A${page}%2C%22count%22%3A${pageSize}%7D`,
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        });
        // console.log(response.data)
        if (response.data?.error == -216) {
          responseRefreshToken = await refreshTokenZalo(check.app_id, check.secret_key, check.refresh_token, check.com_id, check.idQLC)
            if (responseRefreshToken.err) {
                return functions.setError(res, responseRefreshToken.message);
            }
            else {
                access_token = responseRefreshToken.message
            }
            const response = await axios({
                method: "get",
                url: `https://openapi.zalo.me/v2.0/oa/listrecentchat?data=%7B%22offset%22%3A${page}%2C%22count%22%3A${pageSize}%7D`,
                headers: {
                    "Content-Type": "application/json",
                    "access_token": access_token
                }
            });
            if (!response?.data?.data) {
                return functions.setError(res, { message: response.data.message });
            }
        }
        return functions.success(
          res, 
          "Lấy danh sách tin nhắn gần đây thành công", 
        { data: response?.data?.data }
        );

      }else{
        return functions.setError(res, "Người dùng chưa được cấp quyền Zalo OA");

      }
     
  } catch (error) {
      console.log(error);
      return functions.setError(res, error.message);
  }
}
exports.refreshToken = async (req, res) => {
  try{
    // import fetch from node-fetch;  
  
        const refreshToken = req.body.refreshToken ;  
        const SECRET_KEY = req.body.key ;  
        const APP_ID = req.body.app_id ;  
          
        const URL = `https://oauth.zaloapp.com/v4/oa/access_token?refresh_token=${refreshToken}&app_id=${APP_ID}&grant_type=refresh_token`;  
          
        const headers = {  
            "secret_key": SECRET_KEY,  
            "Content-Type": "application/x-www-form-urlencoded",  
        };  
      
        const response = await fetch(URL, {  
            method: post,  
            headers: headers  
        });  
        const data = await response.json();  
      
        console.log(data);  
      
}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
exports.testAPIZalo = async (req, res) => {
  try{
    const app_id = req.body.app_id;
    const clientSecret = req.body.secret;
    const redirectUri =  req.body.callbackURL;
    let accessToken = null;

    app.get('/callback', async (req, res) => {
      const code = req.query.code;
    
      // Exchange code for access token
      const tokenUrl = `https://oauth.zaloapp.com/v4/access_token?app_id=${app_id}&app_secret=${clientSecret}&code=${code}`;
      try {
        const response = await axios.get(tokenUrl);
        accessToken = response.data.access_token;
    
        res.send(`Access Token: ${accessToken}`);
      } catch (error) {
        console.error('Error exchanging code for access token:', error.message);
        res.status(500).send('Internal Server Error');
      }
    });


}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
exports.testAPIfb = async (req, res) => {
  try{

FB.options({version: 'v18.0'});
FB.setAccessToken('your access token');//your access token

FB.api('/me', { fields: 'id,name' }, function (res) {
if(!res || res.error) {
console.log(!res ? 'error occurred' : res.error);
return;
}
console.log(res.id);
console.log(res.name);
});


}catch(e){
  console.log(e)
  return functions.setError(res, e.message)
}
}
// You can also use the fb.getLoginUrl and fb.getLoginStatus methods for authentication

// Note: Make sure to handle errors and edge cases appropriately in a production environment.

// age_range,birthday,about,education