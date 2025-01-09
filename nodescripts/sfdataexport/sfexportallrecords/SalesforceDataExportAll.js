const fs = require('fs');
const { exec } = require('child_process');
const yargs = require('yargs');
const path = require('path');
const chalk = require('chalk');

// Function to get fields of a custom object using a SOQL query
function getSObjectFields(sObjectName, orgName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT QualifiedApiName FROM EntityParticle WHERE EntityDefinition.QualifiedApiName = '${sObjectName}'`;
        exec(`sf data query --query "${query}" --target-org ${orgName} --json`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing Salesforce CLI command: ${stderr || error.message}`);
            } else {
                try {
                    const result = JSON.parse(stdout);
                    const fields = result.result.records.map(record => record.QualifiedApiName);
                    resolve(fields);
                } catch (parseError) {
                    reject(`Error parsing Salesforce CLI output: ${parseError.message}`);
                }
            }
        });
    });
}

// Function to query records from the Salesforce object using Bulk API
function querySObjectRecordsBulk(sObjectName, fields, orgName) {
    return new Promise((resolve, reject) => {
        const fieldList = fields.join(', ');
        const query = `SELECT ${fieldList} FROM ${sObjectName}`;
        exec(`sf data query --query "${query}" --target-org ${orgName} --bulk --json`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing Salesforce CLI command: ${stderr || error.message}`);
            } else {
                try {
                    const result = JSON.parse(stdout);
                    const records = result.result.records.map(record => {
                        const { attributes, ...rest } = record;
                        return rest;
                    });
                    resolve(records);
                } catch (parseError) {
                    reject(`Error parsing Salesforce CLI output: ${parseError.message}`);
                }
            }
        });
    });
}

// Function to save records to a CSV file
function saveRecordsToCSV(records, outputPath) {
    const csvHeader = Object.keys(records[0]).join(',');
    const csvRows = records.map(record => 
        Object.values(record).map(value => {
            if (value) {
                const stringValue = value.toString().replace(/"/g, '""').replace(/\n/g, ' ');
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }
            return '';
        }).join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');

    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`Records saved to ${outputPath}`);
}

// Function to generate a timestamped filename
function generateTimestampedFilename(baseName) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}.csv`;
}

// Function to display loading message
function showLoadingMessage(message) {
    process.stdout.write(chalk.yellow(message));
}

// Function to clear loading message
function clearLoadingMessage() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
}

// Function to display summary
function displaySummary(records, fields) {
    console.log(chalk.white('\n----------------------------------------'));
    console.log(chalk.green('\nScript completed successfully.'));
    console.log(chalk.blue(`Number of Records: `) + chalk.green(`${records.length}`));
    console.log(chalk.blue(`Number of Fields: `) + chalk.green(`${fields.length}`));
    console.log(chalk.blue('Fields:'));
    
    const columns = 3;
    for (let i = 0; i < fields.length; i += columns) {
        console.log(chalk.blue(fields.slice(i, i + columns).join(', ')));
    }
    
    console.log(chalk.white('\n----------------------------------------'));
}

// Configure yargs for command-line arguments
const argv = yargs
    .option('sobject', {
        alias: 's',
        type: 'string',
        description: 'Salesforce object API name',
        demandOption: true
    })
    .option('org', {
        alias: 'o',
        type: 'string',
        description: 'Salesforce org alias or username',
        demandOption: true
    })
    .option('outputCsv', {
        alias: 'oCsv',
        type: 'string',
        description: 'Output CSV file path'
    })
    .help()
    .argv;

const sObjectName = argv.sobject;
const orgName = argv.org;
let outputCsv = argv.outputCsv;

if (!outputCsv) {
    const baseName = sObjectName;
    outputCsv = path.join(__dirname, generateTimestampedFilename(baseName));
}

// Fetch Salesforce object fields and query records from the specified org
showLoadingMessage('Fetching Salesforce object fields...');
getSObjectFields(sObjectName, orgName)
    .then(fields => {
        clearLoadingMessage();
        console.log('Salesforce object fields fetched successfully.');
        showLoadingMessage('Querying records from Salesforce object...');
        return querySObjectRecordsBulk(sObjectName, fields, orgName).then(records => ({ records, fields }));
    })
    .then(({ records, fields }) => {
        clearLoadingMessage();
        console.log('Records queried successfully.');
        showLoadingMessage('Saving records to CSV file...');
        saveRecordsToCSV(records, outputCsv);
        clearLoadingMessage();
        console.log('Records saved successfully.');
        displaySummary(records, fields);
    })
    .catch(error => {
        clearLoadingMessage();
        console.error(error);
    });
