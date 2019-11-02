const crypto = require('crypto');

function numberTo8Hex(n) {
  n = n.toString(16);
  return '00000000'.substr(n.length) + n;
}

function unquot(text) {
  if(text && text[0] === '"' && text[text.length-1] === '"')
    return text.substr(1, text.length - 2);
  return text;
}

function quot(text) {
  if(text && text[0] !== '"')
    return ['"', text, '"'].join('');
  else if(text === '')
    return '""'
  return text;
}

function hash() {
  var hash = crypto.createHash('md5');

  var a = Array.prototype.join.call(arguments, ':');
  hash.update(a);

  return hash.digest('hex');
}

function rbytes() {
  return hash(Math.random().toString(), Math.random().toString());
}

function calculateDigest(ctx) {
  switch(ctx.qop) {
  case 'auth-int':
    return hash(ctx.ha1, ctx.nonce, ctx.nc, ctx.cnonce, ctx.qop, hash(ctx.method, ctx.uri, hash(ctx.entity)));
  case 'auth':
    return hash(ctx.ha1, ctx.nonce, ctx.nc, ctx.cnonce, ctx.qop, hash(ctx.method, ctx.uri));
  }

  return hash(ctx.ha1, ctx.nonce, hash(ctx.method, ctx.uri));
}

module.exports.challenge = function(session, response){
  session.proxy = response.status === 407;
  session.nonce = session.nonce || rbytes();
  session.nc = 0;
  session.qop = session.qop || 'auth,auth-int';
  session.algorithm = session.algorithm || 'md5';
  session.opaque = session.opaque || "";

  var headerName = session.proxy ? 'proxy-authenticate' : 'www-authenticate';
  (response.headers[headerName] || (response.headers[headerName] = [])).push({
    scheme: 'Digest',
    realm: quot(session.realm),
    qop: quot(session.qop),
    algorithm: quot(session.algorithm),
    nonce: quot(session.nonce)
  });

  return response;
}

module.exports.authenticate = function(username, session, credits, request){
  if(request.headers.authorization){
    session.nc = (session.nc || 0) + 1;
    var ha1 = hash(username, unquot(session.realm), credits.password);
    var ha2 = hash(request.method, request.headers.uri);
    var result = calculateDigest({ha1:ha1, method:request.method, nonce:session.nonce, nc:numberTo8Hex(session.nc), cnonce:unquot(request.headers.authorization.cnonce), qop:unquot(request.headers.authorization.qop), uri:unquot(request.headers.authorization.uri), entity:request.content.join('')});
    if(result == unquot(request.headers.authorization.response)){
      session.cnonce = unquot(request.headers.authorization.cnonce);
      session.qop = unquot(request.headers.authorization.qop);
      session.uri = unquot(request.headers.authorization.uri);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}