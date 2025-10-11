async function addLog(option, message) {
    const fse = require('fs-extra');

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    try {
        fse.appendFileSync('./useCommand.log', `[${formatted}] ${option} ${message}\n`);
    } catch (e) {
        ;
    };
};

module.exports = { addLog: addLog };