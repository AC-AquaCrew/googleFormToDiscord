async function getPollAllReplys(threadsId, pollId) {
    const { config } = require('./config.json');
    try {
        let replysArray = [];

        for (let i = 1; i <= 10; i++) {
            const response = await fetch(`https://discord.com/api/v10/channels/${threadsId}/polls/${pollId}/answers/${i}`, {
                method: 'GET',
                headers: {
                    'Authorization': `bot ${config.botConfig.botToken}`
                },
            });

            const data = await response.json();
            replysArray.push(data.users.length);
        };
        return (replysArray);
    } catch(e) {
        return (undefined);
    };
};

// try{
//     getPollAllReplys()
//         .then(value => {
//             console.log(value);
//         });
// } catch(err) {
//     console.error(err);
// }; 

module.exports = {getPollAllReplys: getPollAllReplys};