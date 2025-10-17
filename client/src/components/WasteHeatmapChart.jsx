/**
 * WasteHeatmapChart Component
 * 
 * Purpose: Display waste collection intensity heatmap for high-waste zones
 * Features:
 * - Matrix-style heatmap visualization
 * - Color-coded waste intensity levels
 * - Interactive tooltips with detailed data
 * - Responsive design for all screen sizes
 * - Customizable color gradients
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-17
 */

import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Colors from '../constants/colors';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

/**
 * WasteHeatmapChart Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Heatmap data array with x, y, and value properties
 * @param {string} props.title - Chart title
 * @param {Object} props.options - Additional chart options
 * @param {string} props.colorScheme - Color scheme ('red', 'green', 'blue', 'orange')
 */
const WasteHeatmapChart = ({ 
  data = [], 
  title = "Waste Collection Heatmap", 
  options = {},
  colorScheme = 'red'
}) => {
  const chartRef = useRef(null);

  // Color schemes for different intensity levels
  const colorSchemes = {
    red: [
      'rgba(255, 245, 245, 0.8)',  // Very low
      'rgba(255, 235, 235, 0.8)',  // Low
      'rgba(255, 205, 205, 0.8)',  // Medium-low
      'rgba(255, 175, 175, 0.8)',  // Medium
      'rgba(255, 135, 135, 0.8)',  // Medium-high
      'rgba(255, 95, 95, 0.8)',    // High
      'rgba(255, 55, 55, 0.8)',    // Very high
      'rgba(220, 20, 20, 0.9)',    // Extreme
    ],
    green: [
      'rgba(245, 255, 245, 0.8)',
      'rgba(235, 255, 235, 0.8)',
      'rgba(205, 255, 205, 0.8)',
      'rgba(175, 255, 175, 0.8)',
      'rgba(135, 255, 135, 0.8)',
      'rgba(95, 255, 95, 0.8)',
      'rgba(55, 255, 55, 0.8)',
      'rgba(20, 220, 20, 0.9)',
    ],
    blue: [
      'rgba(245, 245, 255, 0.8)',
      'rgba(235, 235, 255, 0.8)',
      'rgba(205, 205, 255, 0.8)',
      'rgba(175, 175, 255, 0.8)',
      'rgba(135, 135, 255, 0.8)',
      'rgba(95, 95, 255, 0.8)',
      'rgba(55, 55, 255, 0.8)',
      'rgba(20, 20, 220, 0.9)',
    ],
    orange: [
      'rgba(255, 250, 245, 0.8)',
      'rgba(255, 240, 235, 0.8)',
      'rgba(255, 220, 205, 0.8)',
      'rgba(255, 200, 175, 0.8)',
      'rgba(255, 180, 135, 0.8)',
      'rgba(255, 160, 95, 0.8)',
      'rgba(255, 140, 55, 0.8)',
      'rgba(240, 120, 20, 0.9)',
    ]
  };

  // Get color based on intensity value
  const getColorByIntensity = (value, maxValue) => {
    if (maxValue === 0) return colorSchemes[colorScheme][0];
    
    const normalizedValue = value / maxValue;
    const colorIndex = Math.min(
      Math.floor(normalizedValue * colorSchemes[colorScheme].length),
      colorSchemes[colorScheme].length - 1
    );
    
    return colorSchemes[colorScheme][colorIndex];
  };

  // Process data for Chart.js scatter plot (heatmap simulation)
  const processHeatmapData = () => {
    if (!data || data.length === 0) {
      return {
        datasets: [{
          label: 'No Data Available',
          data: [],
          backgroundColor: colorSchemes[colorScheme][0],
        }]
      };
    }

    // Find maximum value for normalization
    const maxValue = Math.max(...data.map(item => item.value || 0));
    
    // Group data by area and create points
    const processedData = data.map((item, index) => ({
      x: item.x || index % 10, // Grid position
      y: item.y || Math.floor(index / 10), // Grid position
      value: item.value || 0,
      area: item.area || `Area ${index + 1}`,
      wasteType: item.wasteType || 'Mixed',
      collections: item.collections || 0,
      weight: item.weight || '0kg'
    }));

    return {
      datasets: [{
        label: 'Waste Intensity',
        data: processedData.map(item => ({
          x: item.x,
          y: item.y,
          r: Math.max(8, (item.value / maxValue) * 25), // Point size based on intensity
          value: item.value,
          area: item.area,
          wasteType: item.wasteType,
          collections: item.collections,
          weight: item.weight
        })),
        backgroundColor: processedData.map(item => 
          getColorByIntensity(item.value, maxValue)
        ),
        borderColor: processedData.map(item => 
          getColorByIntensity(item.value, maxValue).replace('0.8)', '1)')
        ),
        borderWidth: 2,
        pointRadius: processedData.map(item => 
          Math.max(8, (item.value / maxValue) * 25)
        ),
      }]
    };
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: Colors.darkGray,
        padding: 20
      },
      legend: {
        display: false // Hide legend for cleaner look
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: Colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(context) {
            const point = context[0];
            return `📍 ${point.raw.area}`;
          },
          label: function(context) {
            const point = context.raw;
            return [
              `🗑️ Waste Volume: ${point.value} units`,
              `📊 Collections: ${point.collections}`,
              `⚖️ Total Weight: ${point.weight}`,
              `🏷️ Primary Type: ${point.wasteType}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Geographic Zone (East-West)',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: Colors.darkGray
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: Colors.darkGray,
          callback: function(value) {
            return `Zone ${Math.floor(value)}`;
          }
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Geographic Zone (North-South)',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: Colors.darkGray
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: Colors.darkGray,
          callback: function(value) {
            return `Zone ${Math.floor(value)}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'point'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    ...options
  };

  // Create intensity legend
  const IntensityLegend = () => {
    const maxValue = data.length > 0 ? Math.max(...data.map(item => item.value || 0)) : 100;
    const legendItems = [
      { label: 'Very Low', value: 0 },
      { label: 'Low', value: maxValue * 0.2 },
      { label: 'Medium', value: maxValue * 0.4 },
      { label: 'High', value: maxValue * 0.6 },
      { label: 'Very High', value: maxValue * 0.8 },
      { label: 'Extreme', value: maxValue }
    ];

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          color: Colors.darkGray,
          marginRight: '10px'
        }}>
          Intensity Scale:
        </span>
        {legendItems.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '0 5px' 
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: getColorByIntensity(item.value, maxValue),
              border: `1px solid ${getColorByIntensity(item.value, maxValue).replace('0.8)', '1)')}`,
              borderRadius: '50%',
              marginRight: '5px'
            }}></div>
            <span style={{ 
              fontSize: '11px', 
              color: Colors.darkGray 
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${Colors.lightGray}`
    }}>
      <div style={{ height: '400px', position: 'relative' }}>
        <Chart
          ref={chartRef}
          type="scatter"
          data={processHeatmapData()}
          options={chartOptions}
        />
      </div>
      
      {/* Intensity Legend */}
      <IntensityLegend />
      
      {/* Summary Statistics */}
      {data && data.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: Colors.lightGray,
          borderRadius: '8px',
          border: `1px solid ${Colors.border}`
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: Colors.darkGray,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📊 Heatmap Summary
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            fontSize: '12px',
            color: Colors.darkGray
          }}>
            <div>
              <strong>Total Zones:</strong> {data.length}
            </div>
            <div>
              <strong>Max Intensity:</strong> {Math.max(...data.map(item => item.value || 0))} units
            </div>
            <div>
              <strong>Avg Intensity:</strong> {Math.round(data.reduce((acc, item) => acc + (item.value || 0), 0) / data.length)} units
            </div>
            <div>
              <strong>High-Risk Zones:</strong> {data.filter(item => (item.value || 0) > Math.max(...data.map(i => i.value || 0)) * 0.7).length}
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!data || data.length === 0) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: Colors.darkGray,
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <div><strong>No heatmap data available</strong></div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Generate a report to view waste intensity visualization
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteHeatmapChart;