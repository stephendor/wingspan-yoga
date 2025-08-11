"use client";
import React, { useState } from 'react';

interface Instructor {
  id: string;
  name: string;
}

interface Class {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
  difficulty: string;
  category: string;
  location: string;
  status: string;
  instructor: Instructor;
}

interface Props {
  classes: Class[];
}

const columns = [
  { key: 'title', label: 'Name' },
  { key: 'instructor', label: 'Instructor' },
  { key: 'startTime', label: 'Date' },
  { key: 'capacity', label: 'Slots' },
  { key: 'status', label: 'Status' },
];

export default function ClassTable({ classes }: Props) {
  const [sortKey, setSortKey] = useState('startTime');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...classes].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';
    switch (sortKey) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'instructor':
        aValue = a.instructor?.name || '';
        bValue = b.instructor?.name || '';
        break;
      case 'startTime':
        aValue = a.startTime;
        bValue = b.startTime;
        break;
      case 'capacity':
        aValue = a.capacity;
        bValue = b.capacity;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = '';
        bValue = '';
    }
    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Class List</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-2 cursor-pointer"
                onClick={() => {
                  if (sortKey === col.key) setSortAsc(!sortAsc);
                  else {
                    setSortKey(col.key);
                    setSortAsc(true);
                  }
                }}
              >
                {col.label}
                {sortKey === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(cls => (
            <tr key={cls.id} className="border-t">
              <td className="px-4 py-2">{cls.title}</td>
              <td className="px-4 py-2">{cls.instructor?.name}</td>
              <td className="px-4 py-2">{new Date(cls.startTime).toLocaleString()}</td>
              <td className="px-4 py-2">{cls.capacity}</td>
              <td className="px-4 py-2">{cls.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
