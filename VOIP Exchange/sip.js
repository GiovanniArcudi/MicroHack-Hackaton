var sip = {};
module.exports = sip;


sip.parseRequest = function(message){
    try {
        if(!message.startsWith('SIP')){
            var rq = {
                headers: {},
                content: []
            };
            message = message.split('\r\n');
            var first = message.shift().split(" ");
            rq.method = first[0];
            rq.uri = first[1];
            rq.version = first[first.length - 1].substring(4);
            let should_break = false;
            for(let splitted of message){
                if(splitted.indexOf(":") > -1 && !should_break){
                    let sp = splitted.split(':');
                    if(sp.toLowerCase === 'content-length'){
                        should_break = true;
                    }
                    rq.headers[sp[0].trim().toLowerCase()] = sp.slice(1).join(':').trim();
                } else if (typeof splitted === 'string' && splitted !== '') {
                    rq.content.push(splitted);
                }
            }
            if(rq.headers.authorization){
                rq.headers.authorization = parseAuthHeader(rq.headers.authorization);
            }
            return rq;
        } else {
            var rq = {
                headers: {}
            };
            rq.status = message.split(' ')[1];
            rq.statusMessage = message.split(' ')[2];
            message = message.split('\r\n');
            for (let splitted of message){
                if(splitted.indexOf('From:') > -1){
                    rq.headers.from = splitted.split(':').slice(1).join(":")
                }
                if(splitted.indexOf('To:') > -1){
                    rq.headers.to = splitted.split(':').slice(1).join(":")
                }
            }
            rq.text = message;
            return rq;
        }
    } catch (e) {
        return false;
    }
}

sip.parseResponse = function(rq, status, reason, ext){
    var rs = {
        status: status,
        reason: reason || "",
        version: rq.version,
        headers: {
            Via: rq.headers.via,
            to: rq.headers.to,
            from: rq.headers.from, 
            'call-id': rq.headers['call-id'],
            cseq: rq.headers.cseq
        },
        'content-length': 0
    };

    if(ext){
        if(ext.headers){
            Object.keys(ext.headers).forEach(function(header){
                rs.headers[header] = ext.headers[header];
            });
        }
        rs.content = ext.content;
    }
    rs['content-length'] = rs.content ? rs.content.length : rs['content-length'];
    return rs;
}

sip.stringifyResponse = require('./stringify');

sip.parseAndStringifyResponse = function(rq, status, reason, ext){
    return this.stringifyResponse(this.parseResponse(rq, status, reason, ext));
}

var parseAuthHeader = function(header){
    header = header.split(',');
    var parsed = {};
    while(header.indexOf('"') > -1 ){
        header = header.replace('"', '');
    }
    for(let subheader of header){
        let parsedSubheader = require('querystring').parse(subheader.trim());
        parsed = {...parsed, ...parsedSubheader};
    }
    return parsed;
}