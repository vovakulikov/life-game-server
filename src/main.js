'use strict';

//
// YOUR CODE GOES HERE...

const WebSocket = require('ws');
const url = require('url');
const lgVirtualDom = require(`../lib/LifeGameVirtualDom`);

const store = {};
const wss = new WebSocket.Server({ port: 3000 });

/**
 * Котроллер на подключение нового юзера к серверу игры
 */
wss.on('connection', (ws, req) => {
    // Парсинг токена
    const parsedUrl = url.parse(req.url, { parseQueryString: true });
    const token = parsedUrl.query.token;

    // Инициализация комнаты игры по токену
    store[token] = store[token] || { clients: [], game: new lgVirtualDom() }
    const room = store[token];
    const initAction = createInitialAction(token, room);

    room.clients.push(ws);
    room.game.sendUpdates = (data) => {
        room.clients.forEach((ws) => {
            const updateAction = createUpdateAction(data);

            ws.send(JSON.stringify(updateAction));
        });
    }

    ws.send(JSON.stringify(initAction));

    ws.on('message', (message) => {
        const action = JSON.parse(message);
        
        if ( action.type === 'ADD_POINT') {
            room.game.applyUpdates(action.data);
        }
    });

    ws.on('close', () => {
        const index = room.clients.indexOf(ws);

        room.clients.splice(index, 1);
    })
})

/**
 * Action creator for init action
 * 
 * @param {string} token 
 * @param {*} room 
 */
function createInitialAction(token, room) {
    return {
        type: 'INITIALIZE',
        data: {
            state: room.game.state,
            settings: room.game.settings,
            user: {
                token: token,
                color: getRandomColor()
            }
        }
    }
}
/**
 * Action creator for update action
 * @param {*} data 
 */
function createUpdateAction(data) {
    return {
        type: 'UPDATE_STATE',
        data
    }
}

/**
 * Get random color
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (var i = 0; i < 3; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

//
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//
