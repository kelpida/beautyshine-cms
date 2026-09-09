# Package Import Guide

This guide explains how to import packages from `lab-agapiou` into the CMS (`cms_agapiou`).

## Methods

### Method 1: Command Line (Recommended for initial import)

1. **Convert packages.js to JSON format**

   In the `lab-agapiou` directory, run:
   ```bash
   node convert-packages-to-json.js
   ```

   This creates `packages-import.json` with all package data.

2. **Import into CMS**

   Copy the JSON file to your CMS project and run:
   ```bash
   cd cms_agapiou
   php artisan packages:import /path/to/packages-import.json
   ```

   **Options:**
   - `--update`: Update existing packages (matches by number or slug)
   
   Example:
   ```bash
   php artisan packages:import ../lab-agapiou/packages-import.json --update
   ```

### Method 2: CMS Web Interface

1. **Access the Packages page** in your CMS
2. **Click "Import Packages"** button
3. **Select import type:**
   - **File Upload**: Upload the `packages-import.json` file
   - **API**: Provide an API URL that returns package data
4. **Check "Update Existing"** if you want to overwrite existing packages
5. **Click Import**

## Data Mapping

The import process maps data as follows:

| Frontend (packages.js) | CMS Database Field | Notes |
|------------------------|-------------------|-------|
| `id` | - | Not imported (auto-generated) |
| `title` | `name` | Package name |
| `subtitle` | `subtitle` | Package subtitle |
| `number` | `number` | Package number (e.g., "01.") |
| `price` | `price` | Extracted from "€150" → 150.00 |
| - | `currency` | Always set to "EUR" |
| `category` | `category` | Package category |
| `ageGroup` | `age_group` | Age group (e.g., "18+") |
| `description` | `description` | Long description |
| `purpose` | `purpose` | Package purpose text |
| `preparation` | `preparation` | JSON array of instructions |
| `tests` | `tests` | JSON array of test objects |
| `faq` | `faq` | JSON array of FAQ objects |
| `title` (slugified) | `path` | URL-friendly slug |
| - | `public_status` | Always set to "public" |
| - | `is_featured` | Always set to false |

## JSON Format

The expected JSON structure:

```json
{
  "packages": [
    {
      "id": "adult-basic-screening-18",
      "number": "01.",
      "title": "Adult Basic Check-up",
      "subtitle": "(Screening) – 18+",
      "price": "€150",
      "category": "Screening",
      "ageGroup": "18+",
      "description": "This package is suitable for...",
      "purpose": "The tests in the package check...",
      "preparation": [
        "Fasting for 8-12 hours is recommended",
        "Water is allowed during fasting"
      ],
      "tests": [
        {
          "name": "Complete Blood Count (CBC)",
          "items": ["Hemoglobin", "RBCs, WBCs"]
        }
      ],
      "faq": [
        {
          "question": "How will I receive my results?",
          "answer": "Results are available through..."
        }
      ]
    }
  ]
}
```

## Notes

- **Duplicate Detection**: Packages are identified by `number` or `path` (slug)
- **Update Behavior**: Without `--update` flag, existing packages are skipped
- **Price Parsing**: Automatically extracts numeric values from strings like "€150", "150 EUR", "$150"
- **Slug Generation**: Creates URL-friendly slugs from package titles
- **JSON Fields**: Arrays and objects are automatically converted to JSON format

## Troubleshooting

**Error: "Invalid JSON format"**
- Ensure your JSON file has the correct structure with `"packages"` array
- Validate JSON at https://jsonlint.com

**Error: "File not found"**
- Use absolute path or relative path from CMS root directory
- Check file permissions

**Packages not appearing in CMS:**
- Check that `public_status` is set to "public"
- Verify packages were imported (check success message)
- Refresh the packages page

## Future Updates

To update packages from the frontend:

1. Make changes in `lab-agapiou/src/data/packages.js`
2. Run `node convert-packages-to-json.js`
3. Import with `--update` flag:
   ```bash
   php artisan packages:import ../lab-agapiou/packages-import.json --update
   ```

This will update all existing packages while adding any new ones.
