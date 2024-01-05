const RefreshTokenZalo = async (oa_id, refresh_token, app_id, secret_key) => {
    try {
        const response = await axios({
            method: "post",
            url: `https://oauth.zaloapp.com/v4/oa/access_token`,
            data: {
                refresh_token: refresh_token,
                app_id: app_id,
                grant_type: "refresh_token",
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                secret_key: secret_key,
            }
        })
  
        if (response.data.access_token) {
              // Cập nhật token
               await axios({
                   method: 'post',
                   url: 'http://210.245.108.202:9000/api/conversations/TokenZalo',
                   data: {
                     Type:"2",
                     oa_id:oa_id,
                     access_token:response.data.access_token,
                     refresh_token:response.data.refresh_token,
                   },
                   headers: { 'Content-Type': 'multipart/form-data' },
               })
               return response.data.access_token
        } else {
            //Có lỗi xảy ra không lấy được access_token
            console.log("FUNCTIONS REFRESH TOKEN",response.data)
            return null
        }
    } catch (err) {
        console.log('RefreshTokenZalo', err)
        return null
    }
  }
  
  
  //Việtm gửi tin nhắn Zalo đăng tin
  const callApiZaloPostNew = async (fromSite, type, phone, template_id, TEN_KH, MA_KH, THOI_GIAN, access_token) => {
    try {
      let data = {}
      if(type == 2 && fromSite == "Work247") {
        data = {
          TEN_KH: TEN_KH,
          MA_KH: String(MA_KH),
        }
      }else{
        data = {
          TEN_KH: TEN_KH,
          MA_KH: String(MA_KH),
          THOI_GIAN: THOI_GIAN
        }
      }
        const response = await axios({
            method: "post",
            url: `https://business.openapi.zalo.me/message/template`,
            data: {
                "phone": phone,
                "template_id": template_id,
                "template_data": data,
                "tracking_id": Date.now()
            },
            headers: {
                "Content-Type": "application/json",
                "access_token": access_token
            }
        })
        return response.data
    } catch (err) {
        console.log('callApiZaloPostNew', err)
        return null
    }
  } 
  
  const ConvertDateNow = () => {
    const now = new Date();
    now.setHours(now.getHours() + 7);
  
    const gio = now.getHours().toString().padStart(2, '0');
    const phut = now.getMinutes().toString().padStart(2, '0');
    const ngay = now.getDate().toString().padStart(2, '0');
    const thang = (now.getMonth() + 1).toString().padStart(2, '0');
    const nam = now.getFullYear();
  
    return `${gio}:${phut} ${ngay}/${thang}/${nam}`;
  }
  
  //Gửi tin nhắn OA Zalo đăng tin site timviec
  exports.SendMessageZaloPostNew = async (req, res) => {
    try {
       const phoneTK = req.body.phoneTK
       const userName = req.body.userName
       const idTimViec365 = req.body.idTimViec365
       const fromSite = req.body.fromSite
       const type = req.body.type
       if(!phoneTK || !userName || !idTimViec365 || !fromSite || !type){
        return res.status(500).send({ code: 401, message: " Nhập thiếu trường." });
       }
        //ID của template tin nhắn zalo
       let template_id = 0
       let OAID = ""
       if(fromSite == "ViecLam88"){
        OAID = "3632639904667010678"
          if(type == 1){// mẫu đăng tin
            template_id = 304854
          }else if(type == 2){// mẫu tri ân ứng viên đăng kí
            template_id = 304874
          }else{// Mẫu tri ân nhà tuyển dụng
            template_id = 304866
          }
       }else if(fromSite == "Work247"){
        OAID = "3544606466767986644"
          if(type == 1){// mẫu đăng tin
            template_id = 304705
          }else if(type == 2){// mẫu tri ân ứng viên đăng kí
            template_id = 304708
          }else{// Mẫu tri ân nhà tuyển dụng
            template_id = 304707
          }
       }
        //Lấy thông tin OA 
        const oa = await axios({
          method: 'post',
          url: 'http://210.245.108.202:9000/api/conversations/TokenZalo',
          data: {
            Type:"1",
            oa_id:OAID, //
          },
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        let access_token = oa.data.data.access_token
        const refresh_token = oa.data.data.refresh_token
        const app_id = oa.data.data.app_id
        const secret_key = oa.data.data.secret_key
        const oa_id = oa.data.data.oa_id
        // const oa = await TokenZalo.findOne({ _id: 4 })
        //Convert phone về dạng 84******
        let phone = phoneTK
        if (phone.startsWith('0')) {
            phone = '84' + phoneTK.slice(1);
        }
        //Convert thời gian đăng tin về dạng HH:mm dd/MM/yyyy
        const create_at = ConvertDateNow()
        //Gửi tin nhắn sang Zalo
        const response_data = await callApiZaloPostNew(fromSite, type, phone, template_id, userName, idTimViec365, create_at, access_token)
        console.log(response_data)
        
  
        //Bắt lỗi access_token hết hạn
        if (response_data && response_data.error == -124) {
            const access_token = await RefreshTokenZalo(OAID, refresh_token, app_id, secret_key)
            //Nếu lấy được access_token thì gửi lại tin nhắn
            if (access_token) {
                const resend = await callApiZaloPostNew(fromSite, type, phone, template_id, userName, idTimViec365, create_at, access_token)
                console.log("refresh Token",resend)
                if(resend.message == "Success"){
                  return res.status(200).send({ code: 200, message: " làm mới token và gửi tin nhắn thành công." });
                }else{
                  return res.status(500).send({ code: 401, message: " làm mới token nhưng gửi tin nhắn thất bại." });
                }
            }else{
              return res.status(500).send({ code: 401, message: " làm mới token thất bại." });
            }
        }else{
          return res.status(200).send({ code: 200, message: "gửi tin nhắn thành công." });
        }
    } catch (err) {
        console.log('SendMessageZaloPostNew', err)
    }
  }