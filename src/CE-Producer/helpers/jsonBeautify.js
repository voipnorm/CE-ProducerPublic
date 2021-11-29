import log from 'electron-log';
import isJSON from './isJSON';

export default async (data) => {
  try{
    let text;
    log.info(await isJSON(data));
    if(await isJSON(data)){
      log.info("Is Json")
      text = JSON.stringify(data, null, 4)//.replace(/[&\/\\#+()$~%.'"*?<>{}]/g, "")
        //.replace(/[,]/g,"<br>");
    }else{
      if(isObject(data)){
        log.info("Is Obj")
        text = JSON.stringify(data, null, 4)//.replace(/[&\/\\#+()$~%.'"*?<>{}]/g, "")
          //.replace(/[,]/g,"<br>");
      }else{
        log.info("Is neither")
        text = data.replace(/[&\/\\#+()$~%.'"*?<>{}]/g, "")
          .replace(/[,]/g,"<br>")

      }
    }
    log.info(text);
    return `<pre style="color:white;"><code>${text}</code></pre>`;
  }catch(e){
    log.error(e);
  }

}
function isObject(a) {
  return (!!a) && (a.constructor === Object);
};

