var sip = require('./sip'),
    digest = require('./digest');
const net = require('net');
const vm = require('vm');
const fs = require('fs');

const crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var registered = [],
    sessions = {};

var timeouts = {};
var userSockets = {},
    callSockets = {};

var registry = {};
var debug = false;

const readline = require('readline');
var hostname = "Exchange",
    level = {name: "prv", value: 0};

const commands = {
    clear: {
        requiredLevel: function(level){return true;},
        run: function(){
            console.log("\033[2J\033[0f")
        }
    },
    config: {
        requiredLevel: function(level){return level.value >= 0},
        run: function(){
            level = {name: "config", value: 1};
            rl.setPrompt(hostname + " (" + level.name + ")#");
        }
    },
    exit: {
        requiredLevel: function(level){return true;},
        run: function(){
            level = {name: "prv", value: 0};
            rl.setPrompt(hostname + " (" + level.name + ")>");
        }
    },
    show: {
        requiredLevel: function(level){return level.value == 0},
        run: function(query){
            let public = {
                registry: registry,
                sessions: sessions,
                registered: registered,
                hostname: hostname,
                sockets: {
                    user: userSockets,
                    call: callSockets
                }
            }
            query = query.split(' ');
            what = query[0];
            if(what != 'brief'){
                try {
                    if(what.indexOf('users') > -1){
                        what = what.replace('users', 'registry');
                    }
                    let result = vm.runInNewContext(what, public);
                    console.log(result || 'Requested resource does not exist');  
                } catch (e) {
                    console.log('Requested resource does not exist');
                }
            } else if(this.hasOwnProperty(query[0])) {
                this[query[0]].run(query.slice(1).join(' '));
            }
        },
        brief: {
            run: function(query){
                let public = {
                    registry: registry,
                    sessions: sessions,
                    registered: registered,
                    hostname: hostname,
                    sockets: {
                        user: userSockets,
                        call: callSockets
                    }
                }
                what = query;
                let result;
                try{
                    if(what.indexOf('users') > -1){
                        what = what.replace('users', 'registry');
                    }
                    if(vm.runInNewContext(what, public).constructor == Object){
                        result = Object.keys(vm.runInNewContext(what, public));
                    }
                } catch (e) {
                    result = undefined;
                }
                console.log((result || 'Requested resource cannot be shortened'));
            }
        }
    },
    hostname: {
        requiredLevel: function(level){return level.value >= 1},
        run: function(name){
            hostname = name;
            rl.setPrompt(hostname + " (" + level.name + ")#");
        }
    },
    set: {
        requiredLevel: function(level){return level.value >= 1},
        run: function(query){
            query = query.split(' ');
            if(this.hasOwnProperty(query[0])){
                this[query[0]].run(query.slice(1).join(' '));
            }
        },
        sip: {
            run: function(query){
                query = query.split(' ');
                if(this.hasOwnProperty(query[0])){
                    this[query[0]].run(query.slice(1).join(' '));
                }
            },
            listen: {
                run: function(query){
                    query = query.split(' ');
                    if(query[0] == 'enable'){
                        if(!Number(query[1])){
                            var port = 5060;
                        } else {
                            var port = query[1];
                        }
                        server.listen(port, function(){
                            console.log("SIP server listening on port " + port + "\r\n");
                        });
                    } else if (query[0] == 'disable'){
                        server.close();
                    }
                }
            }
        },
        erase: {
            run: function(){
                fs.unlinkSync('./registry');
                console.log('You will need to manually restart the process.');
                console.log('Bye');
                process.exit();
            }
        },
        debug: {
            run: function(query){
                query = query.split(' ');
                if(query[0] == '' || query[0] == 'status'){
                    console.log('Debugging is ' + (debug ? 'enabled.' : 'disabled.'));
                } else if (query[0] == 'enable') {
                    console.log('Debug enabled');
                    debug = true;
                } else {
                    console.log('Debug disabled');
                    debug = false;
                }
            }
        },
        password: {
            run: function(query){
                query = query.split(' ');
                password = query[0];
                if(password.length < 4){
                    console.log('Password needs at least 4 characters');
                } else {
                    function encrypt(text, password){
                      var cipher = crypto.createCipher(algorithm, password)
                      var crypted = cipher.update(text,'utf8','hex')
                      crypted += cipher.final('hex');
                      return crypted;
                    }
                    var savedRegistry = registry;
                    for(let user of Object.keys(savedRegistry)){
                        delete savedRegistry[user].contact;
                        delete savedRegistry[user].port;
                        delete savedRegistry[user].ip;
                    }
                    fs.writeFileSync('./registry', encrypt(JSON.stringify(registry), password));
                    console.log('Saved config');
                }
            }
        },
        user: {
            run: function(query){
                query = query.split(' ');
                name = query[0];
                if(this.hasOwnProperty(query[1])){
                    this[query[1]].run(name, query.slice(2).join(' '));
                }
            },
            password: {
                run: function(name, query){
                    if(!registry.hasOwnProperty(name)){
                        registry[name] = {};
                        console.log('Initialized a new user: ' + name);
                    }
                    if(registered.indexOf(name) < 0){
                        registry[name].password = query.split(' ')[0];
                    } else {
                        console.warn('Cannot change user: ' + name + ' (currently registered)');  
                    }
                }
            },
            remove: {
                run: function(name, query){
                    if(registry.hasOwnProperty(name)){
                        if(registered.indexOf(name) < 0){
                            delete registry[name];
                            console.log('Removed user: ' + name);
                        } else {
                            console.warn('Cannot remove user: ' + name + ' (currently registered)');   
                        }
                    }
                }
            }
        }
    }
}

    const completions = Object.keys(commands).sort();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: tabCompleter
    });

    function runQuery(query){
        query = query.split(' ');
        var command = commands[query[0]];
        if(command){
            if(command.requiredLevel(level)){
                command.run(query.slice(1).join(' '));
            } else {
                console.log('Check your privilege level');
            }
        }
        rl.prompt();
    }

    rl.setPrompt(hostname + " (" + level.name + ")>");

    rl.on('line', function(line){
        runQuery(line);
    });

    rl.on('SIGINT', () => {
      rl.question('Are you sure you want to exit? ', (answer) => {
        if (answer.match(/^y(es)?$/i)) {
            console.log('Bye');
            process.exit();
        }
      });
    });

    function tabCompleter(line) {
      var hits = completions.filter((c) => c.startsWith(line));
      hits = hits.filter((h) => {return commands[h].requiredLevel(level)});
      // show all completions if none found
      return [hits.length ? hits : completions, line];
    }

var server = net.createServer(function(socket){
    socket.on('error', function(error){
        console.warn(error.message);
    });
    socket.on('data', function(message){
        message = message.toString();
        if(message.split('\r\n').join('') == ''){
            socket.write('\r\n');
        } else {
            var rq = sip.parseRequest(message);
            rq.headers.via = rq.headers.via + ";received=" + socket.remoteAddress;
            if(rq){
                socket.write(sip.parseAndStringifyResponse(rq, 100, "Trying"));
                if(rq.method === "REGISTER"){
                    let user = rq.headers.from.split('@')[0].split(':')[1];
                    if(!registry[user].ip || registry[user].ip == socket.remoteAddress){
                        sessions[user] = sessions[user] || {realm: require('os').hostname()};
                        if(!digest.authenticate(user, sessions[user], registry[user], rq)){
                            var rs = digest.challenge(sessions[user], sip.parseResponse(rq, 401, 'Unauthorized'));
                            rs.headers.contact = rq.headers.contact;
                            socket.write(sip.stringifyResponse(rs));
                        } else {
                            clearTimeout(timeouts[user]);
                            if(rq.headers.contact.split('expires=')[1] != 0){
                                if(registered.indexOf(user) < 0){
                                    registered.push(user);
                                    if(debug) console.log('Registered user ' + user);
                                }
                                else {
                                    if(debug) console.log('Keep alive user ' + user);;
                                }
                                timeouts[user] = setTimeout(function(){
                                    delete registry[user].contact;
                                    delete registry[user].ip
                                    delete registry[user].port;
                                    if(debug) console.log('Unregistered timeout user ' + user);
                                }, 600000);
                                let rs = sip.parseResponse(rq, 200, "OK");
                                rs.headers.contact = rq.headers.contact;
                                registry[user].contact = rs.headers.contact;
                                registry[user].ip = socket.remoteAddress;
                                registry[user].port = Number(rs.headers.contact.split('@')[1].split(":").slice(-1)[0].split(';')[0]);
                                socket.write(sip.stringifyResponse(rs));
                            } else {
                                delete registered[registered.indexOf(user)];
                                registered = registered.filter((e) => {return e != null});
                                if(debug) console.log('Unregistered user ' + user);
                                let rs = sip.parseResponse(rq, 200, "OK");
                                rs.headers.contact = rq.headers.contact;
                                delete registry[user].contact;
                                delete registry[user].ip;
                                delete registry[user].port;
                                socket.write(sip.stringifyResponse(rs));
                            }
                        }
                    } else {
                        socket.write(sip.parseAndStringifyResponse(rq, 403, "User already registered"));
                    }
                }
                if(rq.method === "INVITE"){
                    var user = rq.headers.from.split('@')[0].split(':')[1];
                    var call = rq.headers.to.split('@')[0].split(':')[1];
                    if(registered.indexOf(call) < 0){
                        if(call == "*982"){
                            socket.write(sip.parseAndStringifyResponse(rq, 204, 'Service accepted'));
                        } else {
                            socket.write(sip.parseAndStringifyResponse(rq, 481, "Call does not exist"));
                        }
                    } else {
                        var callSocket = net.Socket();
                        callSockets[registry[call].port] = callSocket;
                        callSocket.connect(registry[call].port, registry[call].ip);
                        callSocket.on('connect', function(){
                            callSocket.write(message);
                        });
                        callSocket.on('data', function(callData){
                            userSocket.write(callData);
                        });
                        var userSocket = net.Socket();
                        userSockets[registry[user].port] = userSocket;
                        userSocket.connect(registry[user].port, registry[user].ip);
                        userSocket.on('data', function(userData){
                            callSocket.write(userData);
                        });
                        callSocket.setTimeout(60000);
                        userSocket.setTimeout(60000);
                        callSocket.on('timeout', function(){
                            callSocket.end();
                        });
                        userSocket.on('timeout', function(){
                            userSocket.end();
                        });
                        callSocket.on('error', function(error){
                            console.warn(error.message);
                        });
                        userSocket.on('error', function(error){
                            console.warn(error.message);
                        });
                    }
                }
                if(rq.method === 'CANCEL'){
                    var user = rq.headers.from.split('@')[0].split(':')[1];
                    var call = rq.headers.to.split('@')[0].split(':')[1];
                    callSockets[registry[call].port].write(message);
                    callSockets[registry[call].port].end();
                    userSockets[registry[user].port].end();
                }
                if(rq.method === 'MESSAGE'){
                    var user = rq.headers.from.split('@')[0].split(':')[1];
                    var call = rq.headers.to.split('@')[0].split(':')[1];
                    if(registered.indexOf(call) < 0){
                        socket.write(sip.parseAndStringifyResponse(rq, 481, "Call does not exist"));
                    } else {
                        var callSocket = net.Socket();
                        callSockets[registry[call].port] = callSocket;
                        callSocket.connect(registry[call].port, registry[call].ip);
                        callSocket.on('connect', function(){
                            callSocket.write(message);
                        });
                        callSocket.on('data', function(data){
                            var pdata = sip.parseRequest(data);
                            if(pdata.status == 200){
                                socket.write(data);
                                callSocket.end();
                            } else {
                                socket.write(data);
                            }
                        });
                        callSocket.on('error', function(error){
                            console.warn(error.message);
                        });
                        callSocket.setTimeout(60000);
                        callSocket.on('timeout', function(){
                            callSocket.end();
                        });
                    }
                }
                if(rq.method ===  'SUBSCRIBE'){
                    socket.write(sip.parseAndStringifyResponse(rq, 200, 'OK'));
                }
                if (['MESSAGE', 'CANCEL', 'REGISTER', 'INVITE', 'SUBSCRIBE'].indexOf(rq.method) < 0){
                    if(['ACK', 'BYE'].indexOf(rq.method) > -1){
                        socket.write(sip.parseAndStringifyResponse(rq, 200, 'OK'));
                    } else if(['OPTIONS', 'PRACK', 'NOTIFY', 'PUBLISH', 'INFO', 'REFER', 'UPDATE'].indexOf(rq.method) > -1){
                        if(debug) console.log('not allowed', rq.method);
                        socket.write(sip.parseAndStringifyResponse(rq, 405, 'Method ' + rq.method + ' not supported.'));
                    } else {
                        if(debug) console.log('not implemented', rq.method);
                        socket.write(sip.parseAndStringifyResponse(rq, 501, 'Not implemented.'));
                    }
                }
            }
        }
    });
});

var question = fs.existsSync('./registry') ? 'Enter your password: ' : 'Press enter to continue';
rl.question(question, answer => {
    function encrypt(text, password){
      var cipher = crypto.createCipher(algorithm, password)
      var crypted = cipher.update(text,'utf8','hex')
      crypted += cipher.final('hex');
      return crypted;
    }
     
    function decrypt(text, password){
      var decipher = crypto.createDecipher(algorithm, password)
      var dec = decipher.update(text,'hex','utf8')
      dec += decipher.final('utf8');
      return dec;
    }
    if(fs.existsSync('./registry')){
        password = answer;
        var registryFile = decrypt(fs.readFileSync('./registry', 'utf-8'), answer);
        try {
            registry = JSON.parse(registryFile);
        } catch (e) {
            throw new Error('Wrong password');
        }
    } else {
        console.log('Initialized new registry.');
    }
    rl.prompt();
});