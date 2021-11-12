
import writeMessage from "../../helpers/messageWindow";
import dns from 'dns';
import log from 'electron-log'

const Traceroute = require('nodejs-traceroute');

function launchTracer(){
  return new Promise((resolve, reject) =>{
    try {
      let webexUrls =['webexapis.com'];
      writeMessage("primary", `traceroute to webexapis.com , 64 hops max, 52 byte packets`);
      webexUrls.forEach(async url => {
        await tracer(url);
      })

    } catch (e) {
      log.warn(e);
      reject(e);

    }
  })
}

function tracer(url){
  return new Promise(async (resolve, reject) =>{
    try {
      const tracer = new Traceroute();
      let ip = await lookup(url);
      writeMessage("primary", `${url} resolved to destination ${ip}`);
      tracer
        .on('pid', (pid) => {
          log.info(`pid: ${pid}`);
          writeMessage("primary", `pid: ${pid}`)
        })
        .on('destination', (destination) => {
          log.info(`destination: ${destination}`);
          writeMessage("success", `destination: ${destination}`);
        })
        .on('hop', (hop) => {
          log.info(`hop: ${JSON.stringify(hop)}`);
          writeMessage("success", `hop: ${JSON.stringify(hop)}`);
        })
        .on('close', (code) => {
          log.info(`close: code ${code}`);
          writeMessage("success", `close: code ${code}`);
          resolve()
        });
      tracer.trace(ip);
    } catch (ex) {
      log.warn(ex);
      writeMessage("danger", `error: code ${ex}`);
      reject(ex);

    }
  })

}

//resolve multiple DNS types
function resolve(domain,rrtype,cb){
  dns.resolve(domain,rrtype, function(err,response){
    if(err) {
      log.error("netTools.resolve :"+err)
      return cb("There was an issue with "+domain+". Please try again or a different domain.")
    };
    var text = parseReturn(domain, response)
      .replace(/_/g,'&#717;')
      .trim();
    cb(text);
  });
}
function reverse(ip){
  return new Promise((resolve, reject) => {
    try{
      dns.reverse(ip, function(err,response){
        if(err) reject(err);
        resolve(response);
      })
    }catch(e){
      log.error(e);
      reject(e);
    }
  })

}

function lookup(domain,options){
  return new Promise((resolve, reject) => {
    try{
      dns.lookup(domain, options, function(err,address, family){
        if(err) {
          log.error("netTools.lookup :"+err)
          reject(err)
        };
        resolve(address);
      });
    }catch(e){
      log.error(e);
      writeMessage("danger", `Failed to resolve ${url}`);
      reject(e);
    }
  })

}

export {launchTracer};
