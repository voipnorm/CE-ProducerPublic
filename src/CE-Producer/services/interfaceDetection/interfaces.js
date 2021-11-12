import log from 'electron-log';

var os = require('os');
var ifaces = os.networkInterfaces();

export default async () => {
  return new Promise(function (resolve, reject) {
    try {
      let addresses = [];
      log.info(Object.keys(ifaces));
      Object.keys(ifaces).forEach(function (ifname, i) {
        var alias = 0;

        log.info(i + 1, Object.keys(ifaces).length);
        log.info("Interface Name: " + ifname);

        ifaces[ifname].forEach(function (iface, index) {

          log.info(index + 1, ifaces[ifname].length);

          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            log.info("Not valid for CED, moving to next: " + JSON.stringify(iface, null,4));
            return;
          }

          if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            addresses.push(iface.address)

          } else {
            // this interface has only one ipv4 address

            log.info("Valid IP address: " + JSON.stringify(iface, null,4));
            addresses.push(iface.address)
          }
          ++alias;
          //i + 1, Object.keys(ifaces).length


        });
        if (i + 1 === Object.keys(ifaces).length) {
          console.log("All ips collected");
          resolve(addresses)
        }

      });

    } catch (e) {
      log.error(e)
      reject(e)
    }

  })
};
