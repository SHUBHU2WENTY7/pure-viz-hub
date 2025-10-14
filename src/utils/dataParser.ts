import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedData {
  headers: string[];
  rows: any[];
  types: Record<string, 'number' | 'string' | 'date' | 'boolean'>;
  fileName: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export const detectDataType = (values: any[]): 'number' | 'string' | 'date' | 'boolean' => {
  const sample = values.filter(v => v != null && v !== '').slice(0, 100);
  
  if (sample.length === 0) return 'string';
  
  const numCount = sample.filter(v => !isNaN(Number(v))).length;
  const dateCount = sample.filter(v => !isNaN(Date.parse(v))).length;
  const boolCount = sample.filter(v => 
    typeof v === 'boolean' || v === 'true' || v === 'false'
  ).length;
  
  const total = sample.length;
  
  if (numCount / total > 0.8) return 'number';
  if (dateCount / total > 0.8) return 'date';
  if (boolCount / total > 0.8) return 'boolean';
  
  return 'string';
};

export const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data;
        
        const types: Record<string, 'number' | 'string' | 'date' | 'boolean'> = {};
        headers.forEach(header => {
          const values = rows.map((row: any) => row[header]);
          types[header] = detectDataType(values);
        });
        
        resolve({
          headers,
          rows,
          types,
          fileName: file.name
        });
      },
      error: reject
    });
  });
};

export const parseExcel = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Empty file'));
          return;
        }
        
        const headers = jsonData[0].map(String);
        const rows = jsonData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
        
        const types: Record<string, 'number' | 'string' | 'date' | 'boolean'> = {};
        headers.forEach(header => {
          const values = rows.map(row => row[header]);
          types[header] = detectDataType(values);
        });
        
        resolve({
          headers,
          rows,
          types,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const parseJSON = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let rows = Array.isArray(data) ? data : [data];
        
        if (rows.length === 0) {
          reject(new Error('Empty JSON'));
          return;
        }
        
        const headers = Object.keys(rows[0]);
        
        const types: Record<string, 'number' | 'string' | 'date' | 'boolean'> = {};
        headers.forEach(header => {
          const values = rows.map(row => row[header]);
          types[header] = detectDataType(values);
        });
        
        resolve({
          headers,
          rows,
          types,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const parseFile = async (file: File): Promise<ParsedData> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
    case 'tsv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};
