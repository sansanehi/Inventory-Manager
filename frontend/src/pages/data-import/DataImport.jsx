import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const DataImport = () => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Validate data structure
          const requiredFields = ['brand', 'category', 'model', 'quantity', 'costPrice', 'sellingPrice', 'rackLocation'];
          const isValid = jsonData.every(row => 
            requiredFields.every(field => row[field] !== undefined)
          );

          if (!isValid) {
            toast.error('Invalid data structure. Please check the Excel file format.');
            return;
          }

          setPreviewData(jsonData);
        } catch (error) {
          console.error('Error reading file:', error);
          toast.error('Error reading file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!previewData) return;
    
    setLoading(true);
    try {
      const productsCollection = collection(db, 'products');
      const batch = [];
      
      // Add each product to the batch
      for (const product of previewData) {
        const productData = {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.push(addDoc(productsCollection, productData));
      }

      // Execute batch
      await Promise.all(batch);
      
      toast.success('Data imported successfully!');
      setPreviewData(null);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Import Inventory Data</h1>
        
        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag and drop an Excel file here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: .xlsx, .xls, .csv
          </p>
        </div>

        {/* Preview Section */}
        {previewData && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview Data</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes className="inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? (
                    'Importing...'
                  ) : (
                    <>
                      <FaCheck className="inline mr-2" />
                      Import Data
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(previewData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing first 5 rows of {previewData.length} total rows
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImport; 