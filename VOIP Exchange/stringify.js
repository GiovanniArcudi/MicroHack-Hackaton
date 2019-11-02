module.exports = function(response){
  let stringifyVersion = function(v) {
    return v || '2.0';
  }

  let stringifyAuthHeader = function(a) {
    var s = [];

    for(var n in a) {
      if(n !== 'scheme' && a[n] !== undefined) {
        s.push(n + '=' + a[n]);
      }
    }

    return a.scheme ? a.scheme + ' ' + s.join(',') : s.join(',');
  }

  let stringifiers = {
    to: function(h) {
      return 'To: ' + h + '\r\n';
     },
    from: function(h) {
      return 'From: ' + h+'\r\n';
    },
    contact: function(h) { 
      return 'Contact: '+ h + '\r\n';
    },
    'content-length': function(h) { 
      return 'Content-Length: '+ h + '\r\n';
    },
    'call-id': function(h){
      return 'Call-ID: ' + h + '\r\n';
    },
    route: function(h) {
      return h.length ? 'Route: ' + h + '\r\n' : '';
    },
    'record-route': function(h) {
      return h.length ? 'Record-Route: ' + h + '\r\n' : '';
    },
    'path': function(h) { 
      return h.length ? 'Path: ' + h + '\r\n' : '';
    },
    cseq: function(cseq) { 
      return 'CSeq: ' + cseq + '\r\n';
    },
    'www-authenticate': function(h) { 
      return h.map(function(x) { return 'WWW-Authenticate: ' + stringifyAuthHeader(x)+'\r\n'; }).join('');
    },
    'proxy-authenticate': function(h) { 
      return h.map(function(x) { return 'Proxy-Authenticate: ' + stringifyAuthHeader(x)+'\r\n'; }).join('');
    },
    'authorization': function(h) {
      return h.map(function(x) { return 'Authorization: ' + stringifyAuthHeader(x) + '\r\n'}).join('');
    },
    'proxy-authorization': function(h) {
      return h.map(function(x) { return 'Proxy-Authorization: ' + stringifyAuthHeader(x) + '\r\n'}).join('');; 
    },
    'authentication-info': function(h) {
      return 'Authentication-Info: ' + stringifyAuthHeader(h) + '\r\n';
    },
    'refer-to': function(h) { 
      return 'Refer-To: ' + h + '\r\n'; 
    },
    'subscription-state': function(h) {
      return 'Subscription-State: ' + h + '\r\n';
    },
    'event': function(h) {
      return 'Event: ' + h + '\r\n';
    }
  };

  var str = "";
  if(response.status){
      str = "SIP/" + (response.version || "2.0") + " " + response.status + " " + response.reason + "\r\n"; 
  } else {
      str = response.method + " " + response.uri + " " + ("SIP/" + response.version || "2.0") + "\r\n";
  }

  for(let header in response.headers){
    if(stringifiers[header]){
      str += stringifiers[header](response.headers[header]);
    } else {
      str += header + ": " + response.headers[header] + "\r\n";
    }
  }

  str += 'Content-Length: ' + response['content-length'] + '\r\n';

  str += "\r\n";

  if(response.content){
      str += response.content;
  }

  return str;
}