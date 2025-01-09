const fs = require('fs');
const { exec } = require('child_process');
const yargs = require('yargs');
const path = require('path');

let chalk;
(async () => {
    chalk = await import('chalk');
    chalk = chalk.default; // Ensure chalk is properly initialized

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
        .option('bulk', {
            alias: 'b',
            type: 'boolean',
            description: 'Use Bulk API for querying records',
            default: false
        })
        .help()
        .argv;

    const sObjectName = argv.sobject;
    const orgName = argv.org;
    let outputCsv = argv.outputCsv;
    const useBulk = argv.bulk;

    if (!outputCsv) {
        const baseName = sObjectName;
        outputCsv = generateTimestampedFilename(baseName);
    }

    console.log(chalk.green('Script started.\n'));

    // Fetch Salesforce object fields and query records from the specified org
    showLoadingMessage('Fetching Salesforce object fields...');
    try {
        const fields = await getSObjectFields(sObjectName, orgName);
        clearLoadingMessage();
        console.log(chalk.green('Salesforce object fields fetched successfully.\n'));
        showLoadingMessage('Querying records from Salesforce object...');
        if (useBulk) {
            await querySObjectRecordsBulk(sObjectName, fields, orgName, outputCsv);
        } else {
            await querySObjectRecords(sObjectName, fields, orgName, outputCsv);
        }
        
    } catch (error) {
        clearLoadingMessage();
        console.error(error);
    } finally {
        console.log(chalk.green('Script ended.\n'));
    }
})();

// Function to get fields of a custom object using a SOQL query
function getSObjectFields(sObjectName, orgName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT QualifiedApiName, DataType, IsCompound FROM EntityParticle WHERE EntityDefinition.QualifiedApiName = '${sObjectName}'`;
        exec(`sf data query --query "${query}" --target-org ${orgName} --json`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing Salesforce CLI command: ${stderr || error.message}`);
            } else {
                try {
                    const result = JSON.parse(stdout);
                    const fields = result.result.records
                        .filter(record => !record.IsCompound || record.DataType === 'Address' || record.DataType === 'Location')
                        .map(record => record.QualifiedApiName);
                    resolve(fields);
                } catch (parseError) {
                    reject(`Error parsing Salesforce CLI output: ${parseError.message}`);
                }
            }
        });
    });
}

// Function to query records from the Salesforce object using Bulk API
function querySObjectRecordsBulk(sObjectName, fields, orgName, outputPath) {
    return new Promise((resolve, reject) => {
        const fieldList = fields.join(', ');
        const query = `SELECT ${fieldList} FROM ${sObjectName}`;
        const formatOption = outputPath.endsWith('.csv') ? '--result-format csv' : '--json';
        exec(`sf data export bulk --query "${query}" --target-org ${orgName} --output-file ${outputPath} ${formatOption} --wait 30`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing Salesforce CLI command: ${stderr || error.message}`);
            }
            else {
                console.log(chalk.green('Salesforce records fetched successfully.\n'));
                console.log(chalk.green('Script Completed.\n'));
            }
        });
    });
}

// Function to query records from the Salesforce object using non-Bulk API
function querySObjectRecords(sObjectName, fields, orgName, outputPath) {
    return new Promise((resolve, reject) => {
        const fieldList = fields.join(', ');
        const query = `SELECT ${fieldList} FROM ${sObjectName}`;
        const formatOption = outputPath.endsWith('.csv') ? '--result-format csv' : '--json';
        exec(`sf data query --query "${query}" --target-org ${orgName} --output-file ${outputPath} ${formatOption}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing Salesforce CLI command: ${stderr || error.message}`);
            }
            else {
                console.log(chalk.green('Salesforce records fetched successfully.\n'));
                console.log(chalk.green('Script Completed.\n'));
            }
        });
    });
}

// Function to generate a timestamped filename
function generateTimestampedFilename(baseName) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const sanitizedBaseName = baseName.replace(/\W/g, '_'); // Remove non-whitespace characters
    return `${sanitizedBaseName}_${timestamp}.csv`;
}

// Function to display loading message
function showLoadingMessage(message) {
    if (chalk) {
        process.stdout.write(chalk.yellow(message + '\n'));
    } else {
        process.stdout.write(message + '\n');
    }
}

// Function to clear loading message
function clearLoadingMessage() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
}