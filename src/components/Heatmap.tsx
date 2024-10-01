// ./src/components/Heatmap.tsx

import React, { useEffect, useState, useContext } from 'react';
import { getBlogCountsByDate } from '../services/blogService';
import { AuthContext } from '../contexts/AuthContext';
import { Tooltip } from 'antd';

const Heatmap: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [counts, setCounts] = useState<{ [date: string]: number }>({});
  const [maxCount, setMaxCount] = useState<number>(0);
  const days = 84; // Last 84 days

  useEffect(() => {
    const fetchCounts = async () => {
      if (user) {
        try {
          const data = await getBlogCountsByDate(user.objectId, days);
          setCounts(data);
          const max = Math.max(...Object.values(data));
          setMaxCount(max);
        } catch (error) {
          console.error('Failed to fetch blog counts:', error);
        }
      }
    };
    fetchCounts();
  }, [user]);

  const generateHeatmap = () => {
    const cells = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // Oldest date
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const count = counts[dateString] || 0;

      // Calculate color intensity based on count
      const intensity = maxCount ? count / maxCount : 0;
      const color = getColor(intensity);

      // Create cell
      cells.push(
        <Tooltip key={dateString} title={`${count} post(s) on ${dateString}`}>
          <div
            style={{
              backgroundColor: color,
              width: '12px',
              height: '12px',
              margin: '2px',
              borderRadius: '2px',
            }}
          ></div>
        </Tooltip>
      );
    }
    return cells;
  };

  const getColor = (intensity: number) => {
    const startColor = [227, 242, 253]; // Light blue
    const endColor = [21, 101, 192]; // Dark blue

    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * intensity);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * intensity);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * intensity);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Arrange cells in 7 rows and 12 columns
  const cells = generateHeatmap();

  const rows = [];
  for (let i = 0; i < 7; i++) {
    const rowCells = cells.slice(i * 12, (i + 1) * 12);
    rows.push(
      <div key={i} style={{ display: 'flex' }}>
        {rowCells}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Blog Activity</h3>
      <div>{rows}</div>
    </div>
  );
};

export default Heatmap;