# OCR Document Processing Stack

A comprehensive three-workflow system for automated document classification, extraction, and processing using n8n, Google Drive, OCR, and Google Sheets.

## 🏗️ Architecture Overview

This system is built using proven patterns from the [Zie619/n8n-workflows repository](https://github.com/Zie619/n8n-workflows.git) - a collection of 2,053+ workflows with 365+ integrations.

### Workflow Stack

1. **A. Classifier (bins-classify)** - Document classification with OCR
2. **B. Processor (bins-process)** - Document routing and processing
3. **Extractor Workflows** - Document-specific data extraction

## 📋 Workflow Details

### A. Classifier (bins-classify)

**Purpose**: Receives documents, performs OCR, and classifies them into document types.

**Flow**:
1. **Webhook Trigger** - Receives binary file uploads
2. **Google Drive Upload** - Stores document in intake folder
3. **Google Drive Download** - Retrieves file for OCR processing
4. **Tesseract OCR** - Converts document to text
5. **Classification Logic** - Heuristic classification with confidence scoring
6. **Response Builder** - Returns classification with file URL

**Document Types Supported**:
- CONTRACT (loan agreements, governing law)
- BANKING (void cheques, bank statements)
- CARFAX (vehicle history reports)
- DEALER BOS (bill of sale documents)
- INSURANCE (policies, binders)
- PPSA (financing statements)
- UCC (filing documents)
- OWNERSHIP (title certificates)

### B. Processor (bins-process)

**Purpose**: Routes classified documents to appropriate extractors and processes results.

**Flow**:
1. **Webhook Trigger** - Receives classification results
2. **Switch Node** - Routes by document type
3. **Execute Workflow** - Calls appropriate extractor
4. **Merge Results** - Consolidates extraction output
5. **Data Transformation** - Converts to Google Sheets format
6. **Google Sheets Update** - Stores extracted data
7. **Response** - Returns processing status

### Extractor Workflows

**Purpose**: Document-specific data extraction using OCR and pattern matching.

**Template**: `Extractor – CONTRACT.json`

**Flow**:
1. **Webhook Trigger** - Receives file URL and ID
2. **HTTP Download** - Retrieves document from Google Drive
3. **Tesseract OCR** - Converts to text
4. **Pattern Extraction** - Extracts specific fields using regex patterns
5. **Structured Output** - Returns extracted data in standardized format

## 🔧 Setup Instructions

### Prerequisites

1. **n8n Instance** - Running n8n with API access
2. **Google Drive Credentials** - OAuth2 credentials for file storage
3. **Google Sheets Credentials** - OAuth2 credentials for data storage
4. **Tesseract OCR** - OCR processing capability

### Environment Variables

```bash
# Google Drive Configuration
GOOGLE_DRIVE_INTAKE_FOLDER_ID="your-folder-id"
GOOGLE_DRIVE_CRED_ID="your-credential-id"

# Google Sheets Configuration
GOOGLE_SHEET_ID="your-sheet-id"
GOOGLE_SHEETS_CRED_ID="your-credential-id"
```

### Installation Steps

1. **Import Workflows**:
   ```bash
   # Import the three main workflows
   n8n import --input "A. Classifier (bins-classify).json"
   n8n import --input "B. Processor (bins-process).json"
   n8n import --input "Extractor – CONTRACT.json"
   ```

2. **Configure Credentials**:
   - Set up Google Drive OAuth2 credentials
   - Set up Google Sheets OAuth2 credentials
   - Update credential IDs in workflow nodes

3. **Update Configuration**:
   - Set Google Drive folder ID for intake
   - Set Google Sheets ID for data storage
   - Configure webhook URLs

4. **Activate Workflows**:
   - Activate all three workflows
   - Test with sample documents

## 🚀 Usage

### Document Processing Flow

1. **Upload Document**:
   ```bash
   curl -X POST https://your-n8n-instance/webhook/bins-classify \
     -F "file=@document.pdf"
   ```

2. **Classification Response**:
   ```json
   {
     "job_id": "jb_1234567890",
     "bin": "CONTRACT",
     "confidence": 0.85,
     "id_number": "CONTRACT-2024-001",
     "file_url": "https://drive.google.com/uc?id=..."
   }
   ```

3. **Process Document**:
   ```bash
   curl -X POST https://your-n8n-instance/webhook/bins-process \
     -H "Content-Type: application/json" \
     -d '{
       "job_id": "jb_1234567890",
       "bin": "CONTRACT",
       "file_url": "https://drive.google.com/uc?id=...",
       "id_number": "CONTRACT-2024-001"
     }'
   ```

4. **Processing Response**:
   ```json
   {
     "job_id": "jb_1234567890",
     "status": "processed",
     "attributes_written": 6
   }
   ```

## 📊 Data Output

### Google Sheets Structure

The system stores extracted data in Google Sheets with the following structure:

| Attribute | output |
|-----------|--------|
| borrower_name | John Smith |
| lender_name | ABC Bank |
| loan_amount | 250000.00 |
| interest_rate | 4.5 |
| term_months | 360 |
| start_date | 01/15/2024 |

## 🔍 Pattern Matching

### Contract Extraction Patterns

The system uses sophisticated regex patterns for field extraction:

```javascript
const patterns = {
  borrower_name: /borrower[\s\-]*name[\s\-]*:?[\s\-]*([^\n]+)/i,
  lender_name: /lender[\s\-]*name[\s\-]*:?[\s\-]*([^\n]+)/i,
  loan_amount: /(?:loan|principal)[\s\-]*amount[\s\-]*:?[\s\-]*\$?([0-9,]+(?:\.\d{2})?)/i,
  interest_rate: /(?:interest|rate)[\s\-]*:?[\s\-]*([0-9]+(?:\.\d+)?)[\s\-]*%/i,
  term_months: /(?:term|duration)[\s\-]*:?[\s\-]*([0-9]+)[\s\-]*(?:months?|years?)/i
};
```

## 🛠️ Customization

### Adding New Document Types

1. **Update Classifier**:
   - Add new keywords to classification logic
   - Update confidence scoring

2. **Update Processor**:
   - Add new switch case
   - Create new extractor workflow

3. **Create Extractor**:
   - Copy template workflow
   - Customize extraction patterns
   - Update field mapping

### Adding New Fields

1. **Update Extraction Patterns**:
   - Add new regex patterns
   - Test with sample documents

2. **Update Google Sheets**:
   - Add new columns
   - Update mapping logic

## 📈 Performance Optimization

### Best Practices

1. **OCR Optimization**:
   - Use high-quality document scans
   - Optimize Tesseract settings
   - Implement retry logic for failed OCR

2. **Error Handling**:
   - Implement graceful degradation
   - Log extraction failures
   - Provide fallback processing

3. **Scalability**:
   - Use queue-based processing
   - Implement rate limiting
   - Monitor resource usage

## 🔒 Security Considerations

1. **File Storage**:
   - Secure Google Drive access
   - Implement file retention policies
   - Encrypt sensitive documents

2. **Data Processing**:
   - Sanitize extracted data
   - Implement access controls
   - Audit processing logs

3. **API Security**:
   - Use webhook authentication
   - Implement rate limiting
   - Monitor for abuse

## 📚 References

- [n8n Documentation](https://docs.n8n.io/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Zie619/n8n-workflows](https://github.com/Zie619/n8n-workflows.git)

## 🤝 Contributing

This system is built on proven patterns from the n8n community. To contribute:

1. Test with your document types
2. Share extraction patterns
3. Report issues and improvements
4. Contribute to the base workflow collection

---

**Built with ❤️ using patterns from the n8n community**
