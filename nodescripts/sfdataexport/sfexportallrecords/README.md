# Salesforce Data Export All Records

This script exports all records from a specified Salesforce object to a CSV file using the Salesforce CLI.

## Prerequisites

- Node.js
- Salesforce CLI
- Chalk
- Yargs

## Installation

1. Clone the repository.
2. Install the required dependencies:
    ```sh
    npm install chalk yargs
    ```

## Usage

Run the script with the following command:

```sh
node SalesforceDataExportAll.js --sobject <SObjectName> --org <OrgAliasOrUsername> [--outputCsv <OutputCsvFilePath>] [--bulk]
```

### Options

- `--sobject` or `-s`: Salesforce object API name (required).
- `--org` or `-o`: Salesforce org alias or username (required).
- `--outputCsv` or `-oCsv`: Output CSV file path (optional). If not provided, a timestamped filename will be generated.
- `--bulk` or `-b`: Use Bulk API for querying records (optional). Default is `false`.

### Example

```sh
node SalesforceDataExportAll.js --sobject Account --org myOrgAlias --outputCsv accounts.csv --bulk
```

## Script Workflow

1. The script starts and initializes the required modules.
2. It fetches the fields of the specified Salesforce object.
3. It queries the records from the Salesforce object using either the Bulk API or the standard API based on the provided options.
4. The records are saved to the specified CSV file.
5. The script logs the progress and completion status to the console.


## Error Handling

- The script handles errors during Salesforce CLI command execution and JSON parsing.
- Errors are logged to the console.

## Author

- rborje

## Disclaimer

This project is provided "as is" without warranty of any kind, express or implied. Use at your own risk.

