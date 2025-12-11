import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

dotenv.config();

const url = 'https://x.com/i/api/graphql/zs_jFPFT78rBpXv9Z3U2YQ/AboutAccountQuery';
const bearerToken = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getHeaders = () => ({
    'authorization': bearerToken,
    'x-csrf-token': process.env.CT0,
    'cookie': `auth_token=${process.env.AUTH_TOKEN}; ct0=${process.env.CT0}`,
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'x-twitter-active-user': 'yes',
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-client-language': 'en'
});

async function getAccountRegion(username) {
    try {
        const variables = { screenName: username };
        const fullUrl = `${url}?variables=${encodeURIComponent(JSON.stringify(variables))}`;

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            console.error(chalk.red(`[${username}] HTTP Error: ${response.status}`));
            return { success: false, status: response.status };
        }

        const data = await response.json();
        const region = data?.data?.user_result_by_screen_name?.result?.about_profile?.account_based_in;

        if (region) {
            console.log(chalk.green(`[${username}] Account based in: ${region}`));
        } else {
            console.log(chalk.yellow(`[${username}] Region not found`));
        }
        return { success: true, region: region || null };
    } catch (error) {
        console.error(chalk.red(`[${username}] Error: ${error.message}`));
        return { success: false, error: error.message };
    }
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function processCSV() {
    const csvPath = path.join(process.cwd(), 'data', 'accounts.csv');
    const resultsPath = path.join(process.cwd(), 'data', 'results.json');
    const csvResultsPath = path.join(process.cwd(), 'data', 'results.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(chalk.red('File data/accounts.csv not found!'));
        rl.close();
        return;
    }

    let results = [];
    const processedUsernames = new Set();

    if (fs.existsSync(resultsPath)) {
        try {
            const content = fs.readFileSync(resultsPath, 'utf-8');
            results = JSON.parse(content);
            results.forEach(item => {
                if (item.username) processedUsernames.add(item.username);
            });
            console.log(chalk.blue(`Loaded ${results.length} existing results.`));
        } catch (error) {
            console.error(chalk.red('Error reading results.json:', error.message));
        }
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');

    console.log(chalk.cyan(`Found ${lines.length - 1} accounts in CSV. Processing...`));

    (async () => {
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(',');
            if (columns.length > 2) {
                const username = columns[2].trim();
                if (username) {
                    if (processedUsernames.has(username)) {
                        continue;
                    }

                    const result = await getAccountRegion(username);

                    if (result.success) {
                        const newResult = { username, region: result.region, timestamp: new Date().toISOString() };
                        results.push(newResult);
                        processedUsernames.add(username);

                        try {
                            fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
                        } catch (error) {
                            console.error(chalk.red('Error saving to data/results.json:', error.message));
                        }

                        try {
                            const csvHeader = 'username,region,timestamp\n';
                            const csvRows = results.map(r => `${r.username},${r.region || ''},${r.timestamp}`).join('\n');
                            fs.writeFileSync(csvResultsPath, csvHeader + csvRows);
                        } catch (error) {
                            console.error(chalk.red('Error saving to data/results.csv:', error.message));
                        }
                    } else {
                        console.log(chalk.yellow(`Skipping save for ${username} due to error.`));
                    }

                    const delay = getRandomDelay(15000, 20000);
                    console.log(chalk.gray(`Waiting ${delay}ms...`));
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        console.log(chalk.blue('Processing complete.'));
        rl.close();
    })();
}

function showMenu() {
    console.log(chalk.cyan('\nSelect an option:'));
    console.log('1. Manual Username Input');
    console.log('2. Import from data/accounts.csv');

    rl.question('Enter choice (1/2): ', (choice) => {
        if (choice === '1') {
            rl.question('Enter username: ', async (username) => {
                await getAccountRegion(username);
                rl.close();
            });
        } else if (choice === '2') {
            processCSV();
        } else {
            console.log(chalk.red('Invalid choice'));
            showMenu();
        }
    });
}

showMenu();
