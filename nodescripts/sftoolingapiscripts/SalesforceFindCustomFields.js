const axios = require('axios');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    const chalk = await import('chalk');

    const argv = yargs(hideBin(process.argv))
        .option('objectnames', {
            alias: 'o',
            type: 'array',
            description: 'Salesforce object names',
            demandOption: true
        })
        .option('alias', {
            alias: 'a',
            type: 'string',
            description: 'Salesforce org alias',
            demandOption: true
        })
        .option('output', {
            alias: 'f',
            type: 'string',
            description: 'Output file name',
            default: `custom_fields_${Date.now()}.csv`
        })
        .option('directory', {
            alias: 'd',
            type: 'string',
            description: 'Output directory',
            default: __dirname
        })
        .argv;

    // Expected input format:
    // node findCustomFields.js -o Account Contact -a myOrgAlias -f output.csv -d /path/to/output

    async function getAccessToken(alias) {
        console.log(chalk.default.blue('Fetching access token...'));
        const result = execSync(`sf org display --target-org ${alias} --json`);
        const orgInfo = JSON.parse(result.toString());
        return orgInfo.result.accessToken;
    }

    async function getInstanceUrl(alias) {
        console.log(chalk.default.blue('Fetching instance URL...'));
        const result = execSync(`sf org display --target-org ${alias} --json`);
        const orgInfo = JSON.parse(result.toString());
        return orgInfo.result.instanceUrl;
    }

    async function getCustomFieldsDescribe(objectName, accessToken, instanceUrl) {
        console.log(chalk.default.blue(`Fetching custom fields from describe API for ${objectName}...`));
        const response = await axios.get(`${instanceUrl}/services/data/v52.0/sobjects/${objectName}/describe`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const customFields = response.data.fields.filter(field => field.custom);
        return customFields;
    }

    async function getCustomFieldsTooling(objectName, accessToken, instanceUrl) {
        console.log(chalk.default.blue(`Fetching custom fields from tooling API for ${objectName}...`));
        const response = await axios.get(`${instanceUrl}/services/data/v52.0/tooling/query/?q=SELECT+DeveloperName,Length,Description,InlineHelpText,NamespacePrefix,CreatedBy.Name,CreatedDate,LastModifiedBy.Name,LastModifiedDate+FROM+CustomField+WHERE+TableEnumOrId='${objectName}'`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data.records.map(record => ({
            DeveloperName: record.DeveloperName,
            Length: record.Length,
            Description: record.Description,
            InlineHelpText: record.InlineHelpText,
            NamespacePrefix: record.NamespacePrefix,
            CreatedByName: record.CreatedBy.Name,
            CreatedDate: record.CreatedDate,
            LastModifiedByName: record.LastModifiedBy.Name,
            LastModifiedDate: record.LastModifiedDate
        }));
    }

    (async () => {
        try {
            console.log(chalk.default.green('Script started...'));
            const accessToken = await getAccessToken(argv.alias);
            const instanceUrl = await getInstanceUrl(argv.alias);

            for (const objectName of argv.objectnames) {
                const customFieldsDescribe = await getCustomFieldsDescribe(objectName, accessToken, instanceUrl);
                const customFieldsTooling = await getCustomFieldsTooling(objectName, accessToken, instanceUrl);

                // Combine fields based on matching DeveloperName and name, ignoring the suffix "__c"
                const combinedFields = customFieldsDescribe.map(field => {
                    const toolingField = customFieldsTooling.find(tf => tf.DeveloperName.replace(/__c$/, '') === field.name.replace(/__c$/, ''));
                    if (toolingField) {
                        Object.keys(toolingField).forEach(key => {
                            if (field[key] === toolingField[key]) {
                                console.log(chalk.default.yellow(`Similar value found in field ${field.name}: ${key} = ${field[key]}`));
                            }
                        });
                    }
                    return {
                        ...field,
                        ...toolingField
                    };
                });

                // Ensure all properties from both describe and tooling results are included
                const allKeys = new Set([
                    'DeveloperName', 'name', 'type', 'description', 'InlineHelpText', 'Length', 'NamespacePrefix', 'CreatedByName', 'CreatedDate', 'LastModifiedByName', 'LastModifiedDate',
                    ...customFieldsDescribe.flatMap(Object.keys),
                    ...customFieldsTooling.flatMap(Object.keys)
                ]);
                const combinedFieldsWithAllKeys = combinedFields.map(field => {
                    const result = {};
                    allKeys.forEach(key => {
                        result[key] = field[key] || null;
                    });
                    return result;
                });

                // Sort combined fields by CreatedDate starting with the latest
                combinedFieldsWithAllKeys.sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate));

                // Create CSV for combined fields
                const combinedParser = new Parser({ fields: Array.from(allKeys) });
                const combinedCsv = combinedParser.parse(combinedFieldsWithAllKeys);
                const combinedOutputPath = path.join(argv.directory, `${objectName}_${argv.output}`);
                fs.writeFileSync(combinedOutputPath, combinedCsv);

            }

            console.log(chalk.default.green('Script completed successfully.'));
        } catch (error) {
            console.error(chalk.default.red('Error:', error));
        }
    })();
})();
