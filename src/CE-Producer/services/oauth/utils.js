'use strict';
import log from "electron-log"


async function urlParams (url)
{
	const url_obj = url.split('?');
	const params = decodeURI(url_obj[1])
	.split('&')
	.map(param => param.split('='))
	.reduce((values, [ key, value ]) =>
	{
		values[ key ] = value
		return values
	},
	{});
  log.info(params)
	return params;
}

export{urlParams}
