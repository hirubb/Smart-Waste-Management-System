# Custom Report API Examples

## Example Usage Scenarios

### Scenario 1: Generate Report for Specific Region and Waste Type

**Use Case**: Authority wants to analyze recyclable waste in Colombo 03 area for January 2025

```javascript
// Step 1: Get available filter options
const response1 = await fetch('/api/reports/filters/options', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const filterOptions = await response1.json();
console.log('Available Options:', filterOptions.data);

// Step 2: Generate custom report with filters
const response2 = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    regions: ['Colombo 03'],
    wasteTypes: ['recyclable'],
    reportName: 'January 2025 - Recyclables in Colombo 03'
  })
});

const customReport = await response2.json();
console.log('Custom Report:', customReport.data);
```

### Scenario 2: Analyze Specific Collector Performance

**Use Case**: Track a specific collector's performance over a quarter

```javascript
const response = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    collectors: ['collector_id_123'],
    reportName: 'Q1 2025 - Collector Performance'
  })
});

const report = await response.json();
console.log('Collector Analysis:', report.data.collectorAnalysis);
```

### Scenario 3: Hazardous Waste Report

**Use Case**: Generate a comprehensive hazardous waste collection report

```javascript
const response = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    wasteTypes: ['hazardous'],
    status: 'completed',
    reportName: '2025 Annual Hazardous Waste Report'
  })
});

const hazardousReport = await response.json();
```

### Scenario 4: Compare Multiple Regions

**Use Case**: Compare waste generation across multiple areas

```javascript
const response = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    regions: ['Colombo 03', 'Colombo 07', 'Dehiwala'],
    reportName: 'October 2025 - Multi-Region Analysis'
  })
});

const multiRegionReport = await response.json();
console.log('High Waste Areas:', multiRegionReport.data.highWasteAreas);
```

### Scenario 5: Weekly Operations Report

**Use Case**: Generate weekly operational efficiency report

```javascript
const response = await fetch('/api/reports/custom', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2025-10-08',
    endDate: '2025-10-14',
    status: 'completed',
    reportName: 'Week 41 - Operations Report'
  })
});

const weeklyReport = await response.json();
console.log('Completion Rate:', weeklyReport.data.trends.completionRate);
console.log('Recommendations:', weeklyReport.data.recommendations);
```

## cURL Examples

### Get Filter Options
```bash
curl -X GET "http://localhost:5000/api/reports/filters/options" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Generate Custom Report - Full Example
```bash
curl -X POST "http://localhost:5000/api/reports/custom" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "regions": ["Colombo 03", "Colombo 07"],
    "wasteTypes": ["recyclable", "organic"],
    "collectors": ["67091234567890abcdef1234"],
    "status": "completed",
    "reportName": "January Multi-Filter Report"
  }'
```

### Generate Custom Report - Minimal (Date Range Only)
```bash
curl -X POST "http://localhost:5000/api/reports/custom" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'
```

## Postman Collection

### 1. Get Filter Options
```
Method: GET
URL: {{baseUrl}}/api/reports/filters/options
Headers:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
```

### 2. Generate Custom Report
```
Method: POST
URL: {{baseUrl}}/api/reports/custom
Headers:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
Body (raw JSON):
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "regions": ["Colombo 03"],
  "wasteTypes": ["recyclable"],
  "collectors": ["collector_id"],
  "status": "completed",
  "reportName": "Test Custom Report"
}
```

## Response Examples

### Successful Filter Options Response
```json
{
  "success": true,
  "message": "Filter options retrieved successfully",
  "data": {
    "regions": [
      "123 Main Street, Colombo 03",
      "456 Galle Road, Colombo 07",
      "789 Beach Avenue, Dehiwala"
    ],
    "wasteTypes": [
      "electronic",
      "general",
      "hazardous",
      "organic",
      "recyclable"
    ],
    "collectors": [
      {
        "id": "67091234567890abcdef1234",
        "name": "John Collector",
        "email": "john@example.com"
      },
      {
        "id": "67091234567890abcdef5678",
        "name": "Jane Collector",
        "email": "jane@example.com"
      }
    ],
    "statusOptions": [
      "pending",
      "in-progress",
      "completed",
      "cancelled"
    ]
  }
}
```

### Successful Custom Report Response
```json
{
  "success": true,
  "message": "Custom report generated successfully",
  "reportId": "67091234567890abcdef9999",
  "data": {
    "reportName": "January 2025 - Colombo 03 Analysis",
    "period": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.999Z",
      "duration": "31 days"
    },
    "filters": {
      "regions": ["Colombo 03"],
      "wasteTypes": "All waste types",
      "collectors": "All collectors",
      "status": "All statuses"
    },
    "summary": {
      "totalCollections": 250,
      "completedCollections": 235,
      "pendingCollections": 10,
      "inProgressCollections": 5,
      "cancelledCollections": 0,
      "totalBins": 75,
      "activeBins": 70,
      "binsNeedingCollection": 15,
      "totalWasteCollected": 3500,
      "revenueGenerated": 25000,
      "averageRevenuePerCollection": 106.38
    },
    "wasteByType": {
      "general": {
        "count": 100,
        "totalWeight": 1400,
        "percentage": "40.00"
      },
      "recyclable": {
        "count": 80,
        "totalWeight": 1200,
        "percentage": "32.00"
      },
      "organic": {
        "count": 70,
        "totalWeight": 900,
        "percentage": "28.00"
      }
    },
    "highWasteAreas": [
      {
        "area": "123 Main Street, Colombo 03",
        "totalCollections": 90,
        "totalWeight": 1500,
        "wasteVolume": 1500,
        "dominantWasteType": "general"
      }
    ],
    "trends": {
      "dailyAverage": "8.06",
      "completionRate": "94.00",
      "cancellationRate": "0.00",
      "averageCollectionTime": "28.50"
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "Route Optimization",
        "message": "Increase collection frequency in 123 Main Street, Colombo 03 - highest waste generation (90 collections)",
        "impact": "Reduce overflow and improve service quality"
      },
      {
        "priority": "low",
        "category": "Performance",
        "message": "Excellent completion rate - maintain current operational standards",
        "impact": "Continue monitoring for consistency"
      }
    ],
    "generatedAt": "2025-10-15T12:00:00.000Z",
    "generatedBy": "Admin User"
  }
}
```

### Error Response Examples

#### Missing Required Parameters
```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

#### Invalid Date Range
```json
{
  "success": false,
  "message": "Start date cannot be after end date"
}
```

#### Server Error
```json
{
  "success": false,
  "message": "Error generating custom report",
  "error": "Detailed error message"
}
```

## Integration Tips

1. **Always fetch filter options first** to show users what's available
2. **Validate dates on frontend** before sending request
3. **Show loading indicators** during report generation (can take a few seconds)
4. **Handle empty results gracefully** when no data matches filters
5. **Cache filter options** to reduce API calls
6. **Store reportId** for future reference and retrieval
7. **Implement error handling** for network issues and validation errors

## Performance Notes

- Report generation typically takes 2-5 seconds depending on data volume
- Filter options endpoint is fast (~200ms) and can be called frequently
- Consider implementing pagination for very large datasets
- Use date ranges wisely to avoid overwhelming queries

---

**Last Updated**: October 15, 2025
