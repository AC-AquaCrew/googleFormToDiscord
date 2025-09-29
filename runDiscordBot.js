async function runDiscordBot() {
    const { Client, GatewayIntentBits } = require('discord.js');
    const path = require('path');
    const tar = require('tar');
    const fse = require('fs-extra');

    const client = new Client({
        intents: [GatewayIntentBits.Guilds]
    });

    const config = require('./config.json');

    const serverId = config.botConfig.serverId;
    const channelId = config.botConfig.channelId;

    try {

        const baseDir = path.join(__dirname, 'responses');

        let resJson = null;

        try {
            const entries = fse.readdirSync(baseDir, { withFileTypes: true });

            const firstDir = entries.find(entry => entry.isDirectory());

            if (!firstDir) {
                console.log('Can\'t found any folder. return.');
                return;
            }

            const dirName = firstDir.name;
            const dirPath = path.join(baseDir, dirName);
            const jsonPath = path.join(dirPath, 'response.json');

            // let resJson = null;
            if (fse.existsSync(jsonPath)) {
                const jsonContent = fse.readFileSync(jsonPath, 'utf-8');
                resJson = JSON.parse(jsonContent);
                client.login(config.botConfig.botToken);

                client.once('ready', async () => {
                    console.log(`Logged in as ${client.user.tag}!`);

                    const guild = await client.guilds.fetch(serverId);
                    if (!guild) throw new Error('Find channel error.');

                    const channel = await guild.channels.fetch(channelId);
                    if (!channel || !channel.isTextBased()) {
                        throw new Error('Find channel error.');
                    }

                    if (resJson.answers['0d053d2d'].textAnswers.answers[0].value == '後勤') {
                        let score = 70;

                        const thread = await channel.threads.create({
                            name: `${resJson.answers['08aa22bf'].textAnswers.answers[0].value} -- 職種'${resJson.answers['0d053d2d'].textAnswers.answers[0].value}'`
                        });

                        await thread.send('<@&847051639886315570>');

                        const correct_answer = require('./embed/correct_answer.json');
                        correct_answer.embed.color = 0x000000;
                        await thread.send({ embeds: [correct_answer.embed] });

                        const form_reply_embed = require('./embed/form_reply.json');

                        const fieldMap = [
                            { id: '0069af93', idx: 0 },   // Discord暱稱
                            { id: '08aa22bf', idx: 1 },   // minecraft id
                            { id: '42d58dd5', idx: 2 },   // 年紀
                            { id: '6d3716b7', idx: 3 },   // 性別
                            { id: '0d053d2d', idx: 4 },   // 組別
                            { id: '20db3c1f', idx: 5 },   // 機器、建築等損毀時，你會怎麼做
                            { id: '205bffa9', idx: 6 },   // 上線頻率與時間
                            { id: '39201f70', idx: 7 },   // 是否曾經接觸過生電玩法?
                            { id: '4d5093a5', idx: 9, correct: '15格' }, //紅石粉最遠的傳輸距離為何 15格
                            { id: '599c2651', idx: 10, correct: '12個' }, //請問活塞最多可推動多少個方塊 12個
                            { id: '200fcd5b', idx: 11, correct: '活塞能跨區塊更新' }, //有關半連接性(QC)的敘述何者錯誤 活塞能跨區塊更新
                            { id: '5dd8457b', idx: 12, correct: '280' }, //280
                            { id: '31553a25', idx: 14, correct: '是' },
                            { id: '15d6e487', idx: 15, correct: '是' }
                        ];

                        form_reply_embed.embed.color = 0xae6800;

                        fieldMap.forEach(({ id, idx, correct }) => {
                            const answer = resJson.answers[id]?.textAnswers?.answers[0];
                            if (!answer) return;
                            if (correct) {
                                if (answer.value != correct) {
                                    form_reply_embed.embed.fields[idx].value = `❌${answer.value}`;
                                    if (idx == 14 || idx == 15) score -= 5; else score -= 10;
                                } else {
                                    form_reply_embed.embed.fields[idx].value = `✅${answer.value}`;
                                };
                            } else {
                                form_reply_embed.embed.fields[idx].value = answer.value;
                            };
                        });

                        function buildMultiAnswer(id) {
                            const answers = resJson.answers[id]?.textAnswers?.answers || [];
                            let lastIndex = answers.findLastIndex(a => a != null);
                            if (lastIndex === -1) return '';

                            const parts = [];
                            for (let i = 0; i <= lastIndex; i++) {
                                if (answers[i]) {
                                    if (id == '52b45c60') {
                                        if (answers[i].value != '怪物在距離玩家128格以外會立即消失' && answers[i].value != '非空氣方塊都會影響LC值') {
                                            parts.push(`❌${answers[i].value}`);
                                            score -= 2.5;
                                        } else {
                                            parts.push(`✅${answers[i].value}`)
                                        }
                                    } else if (id == '7c5977e0') {
                                        if (answers[i].value != '第一格放10個雪球，後面四格全各放1個木棍' && answers[i].value != '第一格放41個玻璃，後面四格全各放1個木棍') {
                                            parts.push(`❌${answers[i].value}`);
                                            score -= 2.5
                                        } else {
                                            parts.push(`✅${answers[i].value}`)
                                        }
                                    };
                                };
                            }
                            return parts.join('\n');
                        }

                        form_reply_embed.embed.fields[8].value = buildMultiAnswer('52b45c60');
                        form_reply_embed.embed.fields[13].value = buildMultiAnswer('7c5977e0');

                        if (!form_reply_embed.embed.fields[8].value.includes('怪物在距離玩家128格以外會立即消失')) { form_reply_embed.embed.fields[8].value = `${form_reply_embed.embed.fields[8].value}\n⭕怪物在距離玩家128格以外會立即消失`; score -= 2.5; };
                        if (!form_reply_embed.embed.fields[8].value.includes('非空氣方塊都會影響LC值')) { form_reply_embed.embed.fields[8].value = `${form_reply_embed.embed.fields[8].value}\n⭕非空氣方塊都會影響LC值`; score -= 2.5; };
                        if (!form_reply_embed.embed.fields[8].value.includes('距離玩家半徑24格內不會自然刷新怪物')) { form_reply_embed.embed.fields[8].value = `${form_reply_embed.embed.fields[8].value}\n⭕距離玩家半徑24格內不會自然刷新怪物`; score -= 2.5; };

                        if (!form_reply_embed.embed.fields[13].value.includes('第一格放10個雪球，後面四格全各放1個木棍')) { form_reply_embed.embed.fields[13].value = `${form_reply_embed.embed.fields[13].value}\n⭕第一格放10個雪球，後面四格全各放1個木棍`; score -= 2.5; };
                        if (!form_reply_embed.embed.fields[13].value.includes('第一格放41個玻璃，後面四格全各放1個木棍')) { form_reply_embed.embed.fields[13].value = `${form_reply_embed.embed.fields[13].value}\n⭕第一格放41個玻璃，後面四格全各放1個木棍`; score -= 2.5; };

                        form_reply_embed.embed.fields[16].value = `\`${score}/70\``

                        const sentMessage = await thread.send({ embeds: [form_reply_embed.embed] });

                        const file_embed = require('./embed/files.json');
                        file_embed.embed.color = 0xae6800;

                        if (resJson.answers['3efa64d8']) {
                            const answerLength = resJson.answers['3efa64d8'].fileUploadAnswers.answers.length;
                            let i = 0;
                            let fileName = '';
                            let fileUrl = '';
                            while (i < answerLength) {
                                fileName = `${fileName}${resJson.answers['3efa64d8'].fileUploadAnswers.answers[i].fileName}\n`;
                                fileUrl = `${fileUrl}https://drive.google.com/file/d/${resJson.answers['3efa64d8'].fileUploadAnswers.answers[i].fileId}/view\n`;
                                i += 1;
                            };
                            file_embed.embed.fields[0].value = fileName;
                            file_embed.embed.fields[1].value = fileUrl;
                        } else {
                            file_embed.embed.fields[0].value = '無';
                            file_embed.embed.fields[1].value = '無';
                        };

                        await thread.send({ embeds: [file_embed.embed] });

                        const form_reply_self_embed = require('./embed/form_reply_self.json');
                        form_reply_self_embed.embed.color = 0xae6800;
                        form_reply_self_embed.embed.fields[0].value = resJson.answers['6b892e64'].textAnswers.answers[0].value;

                        await thread.send({ embeds: [form_reply_self_embed.embed] });

                        const pollData = require('./poll.json');
                        await thread.send({ poll: pollData.poll });

                        console.log(`Sent message with ID: ${sentMessage.id}`);
                        client.destroy();
                    } else if (resJson.answers['0d053d2d'].textAnswers.answers[0].value == '建築') {
                        const thread = await channel.threads.create({
                            name: `${resJson.answers['08aa22bf'].textAnswers.answers[0].value} -- 職種'${resJson.answers['0d053d2d'].textAnswers.answers[0].value}'`
                        });

                        await thread.send('<@&847051639886315570>');

                        const form_reply_arch = require('./embed/form_reply_arch.json');

                        const fieldMap = [
                            { id: '0069af93', idx: 0 },   // Discord暱稱
                            { id: '08aa22bf', idx: 1 },   // minecraft id
                            { id: '42d58dd5', idx: 2 },   // 年紀
                            { id: '6d3716b7', idx: 3 },   // 性別
                            { id: '0d053d2d', idx: 4 },   // 組別
                            { id: '7234faeb', idx: 5 },   // 擅長何種風格的建築?
                            { id: '7f17232b', idx: 6 },   // 作品連結或其它備註:
                            { id: '70ebf9e9', idx: 7 },   // 作品介紹:
                        ];

                        form_reply_arch.embed.color = 0x804040;

                        fieldMap.forEach(({ id, idx }) => {
                            const answer = resJson.answers[id]?.textAnswers?.answers[0];
                            if (!answer) return;

                            form_reply_arch.embed.fields[idx].value = answer.value;
                        });

                        const sentMessage = await thread.send({ embeds: [form_reply_arch.embed] });

                        const file_embed = require('./embed/files.json');
                        file_embed.embed.color = 0x804040;

                        const answerLength = resJson.answers['0e4efcd2'].fileUploadAnswers.answers.length;
                        let i = 0;
                        let fileName = '';
                        let fileUrl = '';
                        while (i < answerLength) {
                            fileName = `${fileName}${resJson.answers['0e4efcd2'].fileUploadAnswers.answers[i].fileName}\n`;
                            fileUrl = `${fileUrl}https://drive.google.com/file/d/${resJson.answers['0e4efcd2'].fileUploadAnswers.answers[i].fileId}/view\n`;
                            i += 1;
                        };
                        file_embed.embed.fields[0].value = fileName;
                        file_embed.embed.fields[1].value = fileUrl;

                        await thread.send({ embeds: [file_embed.embed] });

                        const form_reply_self_embed = require('./embed/form_reply_self.json');
                        form_reply_self_embed.embed.color = 0xae6800;
                        form_reply_self_embed.embed.fields[0].value = resJson.answers['6b892e64'].textAnswers.answers[0].value;

                        await thread.send({ embeds: [form_reply_self_embed.embed] });

                        const pollData = require('./poll.json');
                        await thread.send({ poll: pollData.poll });

                        console.log(`Sent message with ID: ${sentMessage.id}`);
                        client.destroy();
                    } else if (resJson.answers['0d053d2d'].textAnswers.answers[0].value == '紅石') {
                        const thread = await channel.threads.create({
                            name: `${resJson.answers['08aa22bf'].textAnswers.answers[0].value} -- 職種'${resJson.answers['0d053d2d'].textAnswers.answers[0].value}'`
                        });

                        await thread.send('<@&847051639886315570>');

                        const form_reply_redstone = require('./embed/form_reply_redstone.json');

                        const fieldMap = [
                            { id: '0069af93', idx: 0 },   // Discord暱稱
                            { id: '08aa22bf', idx: 1 },   // minecraft id
                            { id: '42d58dd5', idx: 2 },   // 年紀
                            { id: '6d3716b7', idx: 3 },   // 性別
                            { id: '0d053d2d', idx: 4 },   // 組別
                            { id: '3b37a927', idx: 5 },   // 擅長的領域為何?
                            { id: '774ea87d', idx: 6 },   // 接觸紅石的經歷:
                            { id: '5469669b', idx: 7 },   // 作品連結或其它備註:
                            { id: '7a058994', idx: 8 },   // 作品介紹:
                        ];

                        form_reply_redstone.embed.color = 0x930000;

                        fieldMap.forEach(({ id, idx }) => {
                            const answer = resJson.answers[id]?.textAnswers?.answers[0];
                            if (!answer) return;

                            form_reply_redstone.embed.fields[idx].value = answer.value;
                        });

                        const sentMessage = await thread.send({ embeds: [form_reply_redstone.embed] });

                        const form_reply_self_embed = require('./embed/form_reply_self.json');
                        form_reply_self_embed.embed.color = 0xae6800;
                        form_reply_self_embed.embed.fields[0].value = resJson.answers['6b892e64'].textAnswers.answers[0].value;

                        await thread.send({ embeds: [form_reply_self_embed.embed] });

                        const file_embed = require('./embed/files.json');
                        file_embed.embed.color = 0xae6800;

                        const answerLength = resJson.answers['39520475'].fileUploadAnswers.answers.length;
                        let i = 0;
                        let fileName = '';
                        let fileUrl = '';
                        while (i < answerLength) {
                            fileName = `${fileName}${resJson.answers['39520475'].fileUploadAnswers.answers[i].fileName}\n`;
                            fileUrl = `${fileUrl}https://drive.google.com/file/d/${resJson.answers['39520475'].fileUploadAnswers.answers[i].fileId}/view\n`;
                            i += 1;
                        };
                        file_embed.embed.fields[0].value = fileName;
                        file_embed.embed.fields[1].value = fileUrl;

                        await thread.send({ embeds: [file_embed.embed] });

                        const pollData = require('./poll.json');
                        await thread.send({ poll: pollData.poll });

                        console.log(`Sent message with ID: ${sentMessage.id}`);
                        client.destroy();
                    };
                });

            };

            console.log('Found folder name:', dirName);
            //console.log('response.json 內容:', resJson);

            //

            const outputFile = path.join(__dirname, `./responses/${dirName}.tar.gz`);
            await tar.c(
                {
                    gzip: true,
                    file: outputFile,
                    cwd: baseDir
                },
                [dirName]
            );

            console.log(`Zip: ${outputFile}`);

            await fse.remove(`./responses/${dirName}`);

        } catch (error) {
            ;
        }

    } catch (err) {
        console.error(err);
    }

};

module.exports = { runDiscordBot: runDiscordBot };
