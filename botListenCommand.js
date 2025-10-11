async function botListenCommand() {
    const { Client, GatewayIntentBits, MessageFlags } = require("discord.js");
    const fse = require('fs-extra');

    const client = new Client({
        intents: [GatewayIntentBits.Guilds]
    });

    const { getPollAllReplys } = require('./getPollAllReplys');
    const { addLog } = require('./addLog');

    const config = require('./config.json');

    const serverId = config.botConfig.serverId;

    client.login(config.botConfig.botToken);

    client.once('ready', () => {
        console.log('ready');
    });

    client.addListener('interactionCreate', async (interaction) => {
        if (interaction.isCommand() == false) return;

        if (interaction.commandName == 'scores') {
            await addLog('INFO', `${interaction.user.username}(${interaction.user.id}) used /scores in ${interaction.channel.name}(${interaction.channel.id})`);

            await interaction.reply({ content: '正在計算投票結果...\n(計算時間取決於discord api)', flags: MessageFlags.Ephemeral });
            let pollReplyArray;

            let threadId = interaction.channelId;

            let guild, channel;

            try {
                guild = await client.guilds.fetch(serverId);
                if (!guild) throw new Error('Find channel error.');

                channel = await guild.channels.fetch(threadId);
                if (!channel || !channel.isTextBased()) {
                    throw new Error('Find channel error.');
                };
            } catch(e) {
                ;
            };   

            let pollId;
            try {
                pollId = fse.readFileSync(`./pollData/${threadId}.txt`);
            } catch (e) {
                try {
                    await channel.send(`<@${interaction.user.id}>這個頻道不能使用\`/scores\`<:dog_wtf:948229715448172626>`)
                } catch(e) {
                    ;
                };
                await addLog('WARNING', `${interaction.user.username}(${interaction.user.id}) used /scores fail`);
            };

            // console.log(threadId, pollId);

            await getPollAllReplys(threadId, pollId)
                .then((res) => {
                    if (res != undefined) {
                        pollReplyArray = res
                    } else {
                        return;
                    }
                });

            if (pollReplyArray != undefined) {
                let totalScore = 0, numberOfVotes = 0;
                for (let i = 0; i < 10; i++) {
                    totalScore = totalScore + ((i + 1) * (pollReplyArray[i]));
                    numberOfVotes = numberOfVotes + pollReplyArray[i];
                };
                let averageScore30 = (totalScore / numberOfVotes * 3).toFixed(2);

                // await interaction.channel.send(`成員投票成績: \`${String(parseFloat(averageScore30))}/30\`\n公式: \`投票平均分數 * 3\` 滿分30`);

                await channel.send(`成員投票成績: \`${String(parseFloat(averageScore30))}/30\`\n公式: \`投票平均分數 * 3\` 滿分30`);
                await addLog('INFO', `${interaction.user.username}(${interaction.user.id}) used /scores success`);
            };
        };
    });
};

module.exports = { botListenCommand: botListenCommand };