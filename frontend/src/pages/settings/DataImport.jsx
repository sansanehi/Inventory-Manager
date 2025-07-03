import React, { useState } from 'react';
import { FaFileExcel, FaUpload, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { productsStore, categoriesStore } from '../../store/localStore';

const DataImport = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet (Products Info)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        setPreview(jsonData);
      } catch (error) {
        console.error('Error previewing file:', error);
        toast.error('Error previewing file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = (data) => {
    const processedData = {
      products: [],
      categories: new Set()
    };

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length >= 6) {
        const brand = row[0]?.trim();
        const category = row[1]?.trim();
        const model = row[2]?.trim();
        const quantity = parseInt(row[3]) || 0;
        const costPrice = parseFloat(row[4]) || 0;
        const sellingPrice = parseFloat(row[5]) || 0;

        if (brand && category && model) {
          // Add category if it doesn't exist
          if (category) {
            processedData.categories.add(category);
          }

          // Add product
          processedData.products.push({
            brand,
            category,
            model,
            quantity,
            costPrice,
            sellingPrice,
            rackLocation: category.includes('RACK') ? category : null
          });
        }
      }
    }

    return processedData;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Process Products Info sheet
          const productsSheet = workbook.Sheets[workbook.SheetNames[0]];
          const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 });
          const processedData = processData(productsData);

          // Import categories
          for (const category of processedData.categories) {
            await categoriesStore.add({
              name: category,
              description: `Imported category: ${category}`
            });
          }

          // Import products
          for (const product of processedData.products) {
            await productsStore.add(product);
          }

          toast.success('Data imported successfully');
          setFile(null);
          setPreview(null);
        } catch (error) {
          console.error('Error importing data:', error);
          toast.error('Error importing data');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Error reading file');
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Brand', 'Category', 'Model', 'Quantity', 'Cost Price', 'Selling Price'],
      ['D-Link', 'Switch RACK 19', '1024D', '10', '1000', '1200'],
      ['Tenda', 'Router RACK 20', 'Archer6', '5', '2000', '2500'],
      ['Lapcare', 'Keyboard', 'KB-101', '15', '500', '750'],
      ['TP-Link', 'Switch', 'TL-SG1024', '8', '1500', '1800']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products Info');
    XLSX.writeFile(wb, 'inventory_template.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Data Import</h2>

          {/* File Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaFileExcel className="text-4xl text-primary mb-2" />
                <span className="text-lg font-medium">
                  {file ? file.name : 'Click to upload Excel/CSV file'}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  Supported formats: .xlsx, .xls, .csv
                </span>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview[0]?.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(1, 6).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
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
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white flex items-center"
            >
              <FaDownload className="mr-2" />
              Download Template
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center disabled:opacity-50"
            >
              <FaUpload className="mr-2" />
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImport; 