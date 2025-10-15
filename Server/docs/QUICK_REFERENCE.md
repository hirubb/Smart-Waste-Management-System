# Quick Reference - Custom Report Generation

## 🚀 Quick Start

### 1. Get Available Filters
```javascript
GET /api/reports/filters/options
Headers: Authorization: Bearer {token}
```

### 2. Generate Custom Report
```javascript
POST /api/reports/custom
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
Body:
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "regions": ["Colombo 03"],           // Optional
  "wasteTypes": ["recyclable"],        // Optional
  "collectors": ["collector_id"],      // Optional
  "status": "completed",               // Optional
  "reportName": "My Custom Report"     // Optional
}
```

## 📋 Filter Options

| Filter | Type | Required | Example |
|--------|------|----------|---------|
| startDate | Date | ✅ Yes | "2025-01-01" |
| endDate | Date | ✅ Yes | "2025-01-31" |
| regions | Array | ❌ No | ["Colombo 03", "Dehiwala"] |
| wasteTypes | Array | ❌ No | ["recyclable", "organic"] |
| collectors | Array | ❌ No | ["collector_id_1"] |
| status | String | ❌ No | "completed" |
| reportName | String | ❌ No | "Monthly Report" |

## 🎯 Common Use Cases

### Case 1: Specific Area Analysis
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "regions": ["Colombo 03"]
}
```

### Case 2: Waste Type Focus
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "wasteTypes": ["hazardous"]
}
```

### Case 3: Collector Performance
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "collectors": ["collector_id_123"]
}
```

### Case 4: Completed Collections Only
```json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "status": "completed"
}
```

## 📊 Report Data Structure

```javascript
{
  success: true,
  message: "Custom report generated successfully",
  reportId: "...",
  data: {
    reportName: "...",
    period: { startDate, endDate, duration },
    filters: { regions, wasteTypes, collectors, status },
    summary: { totalCollections, completedCollections, ... },
    wasteByType: { recyclable: {count, totalWeight, percentage}, ... },
    highWasteAreas: [...],
    collectionFrequency: { average, max, min, totalDays },
    trends: { dailyAverage, completionRate, ... },
    collectorAnalysis: [...],  // If collectors filtered
    recommendations: [...],
    generatedAt: Date,
    generatedBy: "..."
  }
}
```

## ⚡ Quick Testing

### Using cURL
```bash
# Get filters
curl -X GET http://localhost:5000/api/reports/filters/options \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate report
curl -X POST http://localhost:5000/api/reports/custom \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-01-01","endDate":"2025-01-31"}'
```

### Using JavaScript/Fetch
```javascript
// Get filters
const filters = await fetch('/api/reports/filters/options', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Generate report
const report = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  })
}).then(r => r.json());
```

## ⚠️ Important Notes

1. **Date Format**: Use ISO 8601 format (YYYY-MM-DD)
2. **Required Fields**: startDate and endDate are mandatory
3. **Optional Filters**: All other fields are optional
4. **Authentication**: JWT token required
5. **Role Access**: Waste Manager or Admin only
6. **Response Time**: 2-5 seconds typical

## 🔗 Documentation Links

- Full Documentation: `Server/docs/CUSTOM_REPORTS.md`
- API Examples: `Server/docs/API_EXAMPLES.md`
- Implementation Summary: `Server/IMPLEMENTATION_SUMMARY.md`

## 📝 Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/reports/filters/options` | Get available filters |
| POST | `/api/reports/custom` | Generate custom report |
| GET | `/api/reports/:id` | Retrieve saved report |
| GET | `/api/reports` | List all reports |

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025
