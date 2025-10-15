# Custom Report Generation - Documentation

## Overview
The Custom Report Generation feature allows waste management authorities to generate tailored reports by filtering data based on specific criteria such as regions, time periods, waste types, and collectors.

## Features

### 1. Filter Options Available
- **Time Period**: Custom date range (start date to end date)
- **Regions**: Specific geographical areas/addresses
- **Waste Types**: Filter by waste categories (general, recyclable, organic, hazardous, electronic)
- **Collectors**: Filter by specific waste collectors
- **Status**: Filter by collection status (pending, in-progress, completed, cancelled)

### 2. Report Contents
Custom reports include:
- **Summary Statistics**: Total collections, completion rates, waste volumes
- **Waste Analysis**: Breakdown by waste type
- **Area Analysis**: High waste generation areas
- **Collection Trends**: Frequency and patterns
- **Collector Performance**: Individual collector statistics (if filtered)
- **Revenue Analysis**: Financial metrics
- **Recommendations**: AI-generated optimization suggestions

## API Endpoints

### 1. Get Filter Options
**Endpoint**: `GET /api/reports/filters/options`

**Description**: Retrieves all available filter options for custom reports

**Authentication**: Required (Waste Manager, Admin)

**Response**:
```json
{
  "success": true,
  "message": "Filter options retrieved successfully",
  "data": {
    "regions": [
      "123 Main St, Colombo",
      "456 Galle Road, Colombo 03"
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
        "id": "collector_id_1",
        "name": "John Doe",
        "email": "john@example.com"
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

### 2. Generate Custom Report
**Endpoint**: `POST /api/reports/custom`

**Description**: Generates a customized report based on provided filters

**Authentication**: Required (Waste Manager, Admin)

**Request Body**:
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "regions": ["Colombo 03", "Colombo 07"],
  "wasteTypes": ["recyclable", "organic"],
  "collectors": ["collector_id_1", "collector_id_2"],
  "status": "completed",
  "reportName": "January Recyclables Report"
}
```

**Parameters**:
- `startDate` (required): Start date for report period (ISO format)
- `endDate` (required): End date for report period (ISO format)
- `regions` (optional): Array of region names/addresses to include
- `wasteTypes` (optional): Array of waste categories to analyze
- `collectors` (optional): Array of collector IDs to include
- `status` (optional): Collection status filter
- `reportName` (optional): Custom name for the report

**Response**:
```json
{
  "success": true,
  "message": "Custom report generated successfully",
  "reportId": "report_id_123",
  "data": {
    "reportName": "January Recyclables Report",
    "period": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.999Z",
      "duration": "31 days"
    },
    "filters": {
      "regions": ["Colombo 03", "Colombo 07"],
      "wasteTypes": ["recyclable", "organic"],
      "collectors": ["collector_id_1", "collector_id_2"],
      "status": "completed"
    },
    "summary": {
      "totalCollections": 150,
      "completedCollections": 145,
      "pendingCollections": 0,
      "inProgressCollections": 0,
      "cancelledCollections": 5,
      "totalBins": 50,
      "activeBins": 48,
      "binsNeedingCollection": 12,
      "totalWasteCollected": 2500,
      "revenueGenerated": 15000,
      "averageRevenuePerCollection": 103.45
    },
    "wasteByType": {
      "recyclable": {
        "count": 85,
        "totalWeight": 1400,
        "percentage": "56.67"
      },
      "organic": {
        "count": 65,
        "totalWeight": 1100,
        "percentage": "43.33"
      }
    },
    "highWasteAreas": [
      {
        "area": "Colombo 03",
        "totalCollections": 90,
        "totalWeight": 1500,
        "wasteVolume": 1500,
        "dominantWasteType": "recyclable"
      }
    ],
    "collectionFrequency": {
      "average": "4.84",
      "max": 8,
      "min": 2,
      "totalDays": 31
    },
    "trends": {
      "dailyAverage": "4.84",
      "completionRate": "96.67",
      "cancellationRate": "3.33",
      "averageCollectionTime": "24.50"
    },
    "collectorAnalysis": [
      {
        "collectorId": "collector_id_1",
        "name": "John Doe",
        "totalAssigned": 75,
        "completed": 72,
        "pending": 0,
        "completionRate": "96.00"
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "category": "Route Optimization",
        "message": "Increase collection frequency in Colombo 03...",
        "impact": "Reduce overflow and improve service quality"
      }
    ],
    "generatedAt": "2025-10-15T10:30:00.000Z",
    "generatedBy": "Admin User"
  }
}
```

## Use Cases

### Use Case 2A: Customizing the Report

#### 2A.1: Authority Chooses to Customize Report
The authority accesses the custom report generation interface and decides to focus on specific criteria.

#### 2A.2: System Provides Filter Options
1. Authority calls `GET /api/reports/filters/options`
2. System returns available regions, waste types, collectors, and status options
3. Authority selects desired filters from the available options

#### 2A.3: System Generates Customized Report
1. Authority submits filter selections via `POST /api/reports/custom`
2. System validates input parameters
3. System fetches filtered data from database
4. System analyzes data and generates comprehensive report
5. System saves report to database
6. System returns customized report to authority

## Implementation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Get Filter Options                     │
│                                                              │
│  Frontend                    Backend                         │
│     │                          │                             │
│     │─────GET /filters/options─>│                            │
│     │                          │                             │
│     │                          │─Query Database              │
│     │                          │  (Collections, Bins, Users) │
│     │                          │                             │
│     │<──────Filter Options─────│                             │
│     │   (Regions, Types, etc)  │                             │
│     │                          │                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  2. Generate Custom Report                   │
│                                                              │
│  Frontend                    Backend                         │
│     │                          │                             │
│     │──POST /custom (filters)──>│                            │
│     │                          │                             │
│     │                          │─Validate Input              │
│     │                          │─Build Query Filters         │
│     │                          │─Fetch Filtered Data         │
│     │                          │─Analyze & Calculate Stats   │
│     │                          │─Generate Recommendations    │
│     │                          │─Save Report to DB           │
│     │                          │                             │
│     │<───────Custom Report─────│                             │
│     │                          │                             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Integration Example

### Step 1: Fetch Filter Options
```javascript
const getFilterOptions = async () => {
  try {
    const response = await fetch('/api/reports/filters/options', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      setRegions(result.data.regions);
      setWasteTypes(result.data.wasteTypes);
      setCollectors(result.data.collectors);
      setStatusOptions(result.data.statusOptions);
    }
  } catch (error) {
    console.error('Error fetching filter options:', error);
  }
};
```

### Step 2: Generate Custom Report
```javascript
const generateCustomReport = async (filters) => {
  try {
    const response = await fetch('/api/reports/custom', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: filters.startDate,
        endDate: filters.endDate,
        regions: filters.selectedRegions,
        wasteTypes: filters.selectedWasteTypes,
        collectors: filters.selectedCollectors,
        status: filters.selectedStatus,
        reportName: filters.reportName
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Report generated:', result.data);
      setReport(result.data);
      setReportId(result.reportId);
    }
  } catch (error) {
    console.error('Error generating report:', error);
  }
};
```

## Database Schema

The custom reports are saved using the existing Report model with `reportType: 'custom'`:

```javascript
{
  reportType: 'custom',
  generatedBy: ObjectId,
  period: {
    startDate: Date,
    endDate: Date
  },
  data: {
    totalCollections: Number,
    completedCollections: Number,
    wasteByType: Map,
    collectorPerformance: Array,
    // ... other metrics
  },
  highWasteAreas: Array,
  recommendations: Array,
  status: 'completed',
  timestamps: { createdAt, updatedAt }
}
```

## Error Handling

### Validation Errors
- Missing required parameters (startDate, endDate)
- Invalid date range (start date after end date)

### Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Performance Considerations

1. **Parallel Data Fetching**: Uses `Promise.all()` to fetch collections, bins, and payments simultaneously
2. **Efficient Filtering**: Applies database-level filters before fetching data
3. **Client-side Region Filtering**: Regions are filtered after data fetch for flexible matching
4. **Indexed Queries**: Utilizes MongoDB indexes on dates and status fields

## Security

- **Authentication Required**: All endpoints require valid JWT token
- **Role-Based Access**: Limited to Waste Manager and Admin roles
- **Input Validation**: Server-side validation of all parameters
- **Data Sanitization**: Filters are validated and sanitized before database queries

## Testing

### Test Case 1: Get Filter Options
```bash
curl -X GET http://localhost:5000/api/reports/filters/options \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 2: Generate Custom Report (All Filters)
```bash
curl -X POST http://localhost:5000/api/reports/custom \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "regions": ["Colombo 03"],
    "wasteTypes": ["recyclable"],
    "collectors": ["collector_id"],
    "status": "completed",
    "reportName": "Test Report"
  }'
```

### Test Case 3: Generate Custom Report (Minimal Filters)
```bash
curl -X POST http://localhost:5000/api/reports/custom \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'
```

## Future Enhancements

1. **Export Functionality**: Add PDF, Excel, CSV export options
2. **Scheduled Reports**: Allow scheduling of custom reports
3. **Report Templates**: Save filter combinations as reusable templates
4. **Advanced Visualizations**: Add charts and graphs
5. **Email Delivery**: Automatic email delivery of generated reports
6. **Comparison Reports**: Compare multiple time periods
7. **Real-time Updates**: WebSocket integration for live report updates

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify authentication token is valid
- Ensure date formats are ISO 8601 compliant
- Confirm filter values exist in the database

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Module**: reportController.js
