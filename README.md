# sfpetprojects

## Table of Contents
- [Salesforce Data Export All Records](#salesforce-data-export-all-records)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Options](#options)
  - [Example](#example)
  - [Script Workflow](#script-workflow)
  - [Error Handling](#error-handling)
- [Salesforce Find Custom Fields](#salesforce-find-custom-fields)
  - [Prerequisites](#prerequisites-1)
  - [Installation](#installation-1)
  - [Usage](#usage-1)
  - [Options](#options-1)
  - [Example](#example-1)
  - [How It Works](#how-it-works)
  - [Notes](#notes)
  - [Disclaimer](#disclaimer)

## Salesforce Data Export All Records

This script exports all records from a specified Salesforce object to a CSV file using the Salesforce CLI.

### Prerequisites

- Node.js
- Salesforce CLI
- Chalk
- Yargs

### Installation

1. Clone the repository.
2. Install the required dependencies:
    ```sh
    npm install chalk yargs
    ```

### Usage

Run the script with the following command:

```sh
node SalesforceDataExportAll.js --sobject <SObjectName> --org <OrgAliasOrUsername> [--outputCsv <OutputCsvFilePath>] [--bulk]
```

#### Options

- `--sobject` or `-s`: Salesforce object API name (required).
- `--org` or `-o`: Salesforce org alias or username (required).
- `--outputCsv` or `-oCsv`: Output CSV file path (optional). If not provided, a timestamped filename will be generated.
- `--bulk` or `-b`: Use Bulk API for querying records (optional). Default is `false`.

#### Example

```sh
node SalesforceDataExportAll.js --sobject Account --org myOrgAlias --outputCsv accounts.csv --bulk
```

### Script Workflow

1. The script starts and initializes the required modules.
2. It fetches the fields of the specified Salesforce object.
3. It queries the records from the Salesforce object using either the Bulk API or the standard API based on the provided options.
4. The records are saved to the specified CSV file.
5. The script logs the progress and completion status to the console.

### Error Handling

- The script handles errors during Salesforce CLI command execution and JSON parsing.
- Errors are logged to the console.

## Salesforce Find Custom Fields

This script fetches custom fields from Salesforce objects using both the Describe and Tooling APIs, combines the results, and outputs them to CSV files.

### Prerequisites

- Node.js
- Salesforce CLI

### Installation

1. Clone the repository or download the script.
2. Install the required Node.js packages:
    ```sh
    npm install axios yargs json2csv chalk
    ```

### Usage

Run the script with the following command:

```sh
node SalesforceFindCustomFields.js -o <objectnames> -a <alias> -f <output> -d <directory>
```

#### Options

- `-o, --objectnames`: Salesforce object names (required, multiple values allowed).
- `-a, --alias`: Salesforce org alias (required).
- `-f, --output`: Output file name (default: `custom_fields_<timestamp>.csv`).
- `-d, --directory`: Output directory (default: current directory).

#### Example

```sh
node SalesforceFindCustomFields.js -o Account Contact -a myOrgAlias -f output.csv -d /path/to/output
```

### How It Works

1. The script fetches the access token and instance URL for the specified Salesforce org alias.
2. For each object name provided, it fetches custom fields using both the Describe and Tooling APIs.
3. It combines the fields based on matching `DeveloperName` and `name`, ignoring the suffix `__c`.
4. It ensures all properties from both Describe and Tooling results are included.
5. It sorts the combined fields by `CreatedDate`, starting with the latest.
6. It creates a CSV file for the combined fields and saves it to the specified directory.

### Notes

- The script uses `chalk` for colored console logs.
- The script handles multiple object names and creates separate CSV files for each object.

### Disclaimer

This project is provided "as is" without warranty of any kind, express or implied. Use at your own risk.
