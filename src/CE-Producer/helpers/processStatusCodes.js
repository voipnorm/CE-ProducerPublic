var statusCodes = {};

statusCodes[202] = "Accepted";
statusCodes[502] = "The server received an invalid response from an upstream server while processing the request. Try again later.";
statusCodes[400] = "The request was invalid or cannot be otherwise served. Check inbound connections are allowed on machine firewalls for CE-Deploy. For custom file downloads a custom checksum may be required. Check logs for more information.";
statusCodes[409] = "The request could not be processed because it conflicts with some established rule of the system. For example, a person may not be added to a room more than once.";
statusCodes[100] = "Continue";
statusCodes[201] = "Created";
statusCodes[417] = "Expectation Failed";
statusCodes[424] = "Failed Dependency";
statusCodes[403] = "The request is understood, but it has been refused or access is not allowed.";
statusCodes[504] = "Gateway Timeout. This is most likely caused by fetch command failure or a unsupported command. Check the PC running CE-Deploy allows in coming connections and your endpoint can reach this machine.";
statusCodes[410] = "Gone";
statusCodes[505] = "HTTP Version Not Supported";
statusCodes[418] = "I'm a teapot";
statusCodes[419] = "Insufficient Space on Resource";
statusCodes[507] = "Insufficient Storage";
statusCodes[500] = "Something went wrong on the server. If the issue persists, feel free to contact the Webex Developer Support team.";
statusCodes[411] = "Length Required";
statusCodes[423] = "Locked";
statusCodes[420] = "Method Failure";
statusCodes[405] = "The request was made to a resource using an HTTP request method that is not supported.";
statusCodes[301] = "Moved Permanently";
statusCodes[302] = "Moved Temporarily";
statusCodes[207] = "Multi-Status";
statusCodes[300] = "Multiple Choices";
statusCodes[511] = "Network Authentication Required";
statusCodes[204] = "Successful request without body content.";
statusCodes[203] = "Non Authoritative Information";
statusCodes[406] = "Not Acceptable";
statusCodes[404] = "The URI requested is invalid or the resource requested, such as a user, does not exist. Also returned when the requested format is not supported by the requested method.";
statusCodes[501] = "Not Implemented";
statusCodes[304] = "Not Modified";
statusCodes[200] = "OK. The request has succeeded.";
statusCodes[206] = "Partial Content";
statusCodes[402] = "Payment Required";
statusCodes[308] = "Permanent Redirect";
statusCodes[412] = "Precondition Failed";
statusCodes[428] = "Precondition Required";
statusCodes[102] = "Processing";
statusCodes[407] = "Proxy Authentication Required";
statusCodes[431] = "Request Header Fields Too Large";
statusCodes[408] = "Request Timeout";
statusCodes[413] = "Request Entity Too Large";
statusCodes[414] = "Request-URI Too Long";
statusCodes[416] = "Requested Range Not Satisfiable";
statusCodes[205] = "Reset Content";
statusCodes[303] = "See Other";
statusCodes[503] = "Server is overloaded with requests. Try again later.";
statusCodes[101] = "Switching Protocols";
statusCodes[307] = "Temporary Redirect";
statusCodes[429] = "Too many requests have been sent in a given amount of time and the request has been rate limited. A Retry-After header should be present that specifies how many seconds you need to wait before a successful request can be made.";
statusCodes[401] = "Authentication credentials were missing or incorrect.";
statusCodes[422] = "Unprocessable Entity";
statusCodes[415] = "The request was made to a resource without specifying a media type or used a media type that is not supported.";
statusCodes[305] = "Use Proxy";

async function getStatusText(statusCode) {
  if (statusCode in statusCodes) {
    let ep = statusCodes[statusCode];
    return ep;
  }
  if (statusCodes.hasOwnProperty(statusCode)) {
    return statusCodes[statusCode];
  } else {
    return ("Status code does not exist: " + statusCode);
  }
};

export {getStatusText}
