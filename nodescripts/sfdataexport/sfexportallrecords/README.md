# Salesforce Data Export Script

This script exports all records from a specified Salesforce object to a CSV file. It uses the Salesforce CLI to query the data and saves the results in a CSV format.

## Prerequisites

- Node.js installed on your machine
- Salesforce CLI installed and authenticated with your Salesforce org

## Installation

1. Clone the repository or download the script.
2. Navigate to the script directory.
3. Install the required dependencies:

    ```bash
    npm install yargs chalk
    ```

## Usage

Run the script with the following command:

```bash
node SalesforceDataExportAll.js --sobject <SObjectName> --org <OrgAliasOrUsername> [--outputCsv <OutputCsvFilePath>]
```

### Options

- `--sobject, -s`: The API name of the Salesforce object to export (required).
- `--org, -o`: The alias or username of the Salesforce org (required).
- `--outputCsv, -oCsv`: The path to the output CSV file (optional). If not provided, the file will be created in the same directory with a timestamped filename.

### Example

```bash
node SalesforceDataExportAll.js --sobject Account --org myOrgAlias --outputCsv accounts.csv
```

## Features

- Fetches all fields of the specified Salesforce object.
- Queries all records from the Salesforce object.
- Saves the records to a CSV file.
- Displays status messages and a summary report with colors.

## Author

- rborje

## Disclaimer

This script is provided "as is", without warranty of any kind. The author is not liable for any damages or issues that may arise from using this script. Use it at your own risk.

