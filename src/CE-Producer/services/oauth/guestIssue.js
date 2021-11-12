import log from 'electron-log';
import request from "../httpRequests/axiosRequest";
import jwt from "jsonwebtoken";


function getJwtToken(Guest_ID,Guest_Secret ) {
    return new Promise((resolve, reject) => {
        try{
            //log.info("GuestId "+Guest_ID);
            //log.info("GuestSecret "+Guest_Secret)
            var d = new Date();

            var date = d.getTime();

            var names = [
                "Operations",
                "Engineering"
            ];
            var name = names[Math.floor(Math.random() * names.length)];
            var payload = {
                sub: "guest-user-" + date,
                name: name,
                iss: Guest_ID
            };

            let jwtToken = jwt.sign(payload, Buffer.from(Guest_Secret, "base64"), {
                    expiresIn: "14h"});
            //log.info(jwtToken);
            resolve(jwtToken)

        }catch(e){
            log.error(e);
            reject(e)
        }

    });
}

function getAccessTokenFromGuest(guestToken) {
    return new Promise(async (resolve, reject) => {
        try{
            var options = {
                method: "POST",
                url: "https://webexapis.com/v1/jwt/login",
                headers: {
                    Authorization: "Bearer " + guestToken
                }
            };
            log.info("Issuing token request");
            let response  = await request(options);
            //log.info(response);
            resolve(response.data.token);
        }catch(e){
            log.error(e);

            reject(e)
        }
    });
}
function getUserDetails(token) {
    return new Promise(async (resolve, reject) => {
        try{
            var options = {
                method: "GET",
                url: "https://webexapis.com/v1/people/me",
                headers: {
                    Authorization: "Bearer " + token
                }
            };
            let response = await request(options);
            //log.info(response);
            resolve(response.data.emails[0]);
        }catch(e){
            log.error(e);
            reject(e)
        }
    });
}

export {
    getJwtToken,
    getAccessTokenFromGuest,
    getUserDetails
}
