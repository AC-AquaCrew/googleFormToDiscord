async function fetchGoogleFrom() {
    const fse = require('fs-extra');
    const path = require('path');
    const { google } = require('googleapis');

    const config = require('./config.json');

    try {
        const keyFilePath = config.formConfig.keyFilePath;
        const scopes = ['https://www.googleapis.com/auth/forms.responses.readonly'];

        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: scopes,
        });

        const forms = google.forms({ version: 'v1', auth });

        const formId = config.formConfig.formId;

        const res = await forms.forms.responses.list({
            formId: formId,
        });

        fse.writeFileSync('result.json', JSON.stringify(res.data, null, 2));
        console.log('update result.json');

        const jsonFile = path.join(__dirname, 'result.json');
        const responsesDir = path.join(__dirname, 'responses');

        if (!fse.existsSync(responsesDir)) {
            fse.mkdirSync(responsesDir);
        }

        const data = JSON.parse(fse.readFileSync(jsonFile, 'utf8'));

        if (Array.isArray(data.responses)) {
            data.responses.forEach((item) => {
                const id = item.responseId;
                const targetDir = path.join(responsesDir, id);

                if (fse.existsSync(targetDir) || fse.existsSync(`./responses/${id}.tar.gz`)) {
                    console.log(`Folder or file exist. Skip.: ${id}`);
                } else {
                    fse.mkdirSync(targetDir);
                    console.log(`Create folder: ${id}`);

                    const responseFile = path.join(targetDir, 'response.json');
                    fse.writeFileSync(responseFile, JSON.stringify(item, null, 2), 'utf8');
                    console.log(`Write file: ${responseFile}`);
                }
            });
        } else {
            console.error('JSON file can\'t find responses array');
        }

    } catch (err) {
        console.error('error:', err);
    };
};

module.exports = { fetchGoogleFrom: fetchGoogleFrom };