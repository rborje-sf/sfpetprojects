# Salesforce Find Custom Fields

This script fetches custom fields from Salesforce objects using both the Describe and Tooling APIs, combines the results, and outputs them to CSV files.

## Prerequisites

- Node.js
- Salesforce CLI

## Installation

1. Clone the repository or download the script.
2. Install the required Node.js packages:
    ```sh
    npm install axios yargs json2csv chalk
    ```

## Usage

Run the script with the following command:

```sh
node SalesforceFindCustomFields.js -o <objectnames> -a <alias> -f <output> -d <directory>
```

### Options

- `-o, --objectnames`: Salesforce object names (required, multiple values allowed).
- `-a, --alias`: Salesforce org alias (required).
- `-f, --output`: Output file name (default: `custom_fields_<timestamp>.csv`).
- `-d, --directory`: Output directory (default: current directory).

### Example

```sh
node SalesforceFindCustomFields.js -o Account Contact -a myOrgAlias -f output.csv -d /path/to/output
```

### Expected Input Format

```sh
node findCustomFields.js -o Account Contact -a myOrgAlias -f output.csv -d /path/to/output
```

## How It Works

1. The script fetches the access token and instance URL for the specified Salesforce org alias.
2. For each object name provided, it fetches custom fields using both the Describe and Tooling APIs.
3. It combines the fields based on matching `DeveloperName` and `name`, ignoring the suffix `__c`.
4. It ensures all properties from both Describe and Tooling results are included.
5. It sorts the combined fields by `CreatedDate`, starting with the latest.
6. It creates a CSV file for the combined fields and saves it to the specified directory.

## Notes

- The script uses `chalk` for colored console logs.
- The script handles multiple object names and creates separate CSV files for each object.

## Disclaimer

The author is not liable for any damage caused by the use of this script. Use at your own risk.

