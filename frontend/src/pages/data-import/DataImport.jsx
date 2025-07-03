import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FaFileExcel,
  FaDownload,
  FaUpload,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import {
  productsStore,
  categoriesStore,
  customersStore,
  transactionsStore,
} from "../../store/localStore";

const DataImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadError(null);
    const file = acceptedFiles[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        // Ensure all rows have at least 6 elements
        const paddedData = jsonData.map((row) => {
          const paddedRow = {
            Brand: row.Brand || "No Brand",
            Category: row.Category || "Uncategorized",
            Model: row.Model || "No Model",
            Quantity: row.Quantity || 0,
            "Cost Price": row["Cost Price"] || 0,
            "Selling Price": row["Selling Price"] || 0,
            ...row, // Keep any additional fields
          };
          return paddedRow;
        });

        setPreview(paddedData.slice(0, 5));
      } catch (error) {
        console.error("Error reading file:", error);
        setUploadError(
          "Error reading file. Please make sure it's a valid Excel file."
        );
        setFile(null);
        setPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const processData = async (data) => {
    setLoading(true);
    try {
      // Process categories first
      const categories = new Set();
      data.forEach((row) => {
        if (row.Category) {
          categories.add(row.Category);
        }
      });

      // Create categories
      for (const categoryName of categories) {
        try {
          const existingCategory = categoriesStore
            .getAll()
            .find((c) => c.name === categoryName);
          if (!existingCategory) {
            categoriesStore.add({
              name: categoryName,
              description: `Category for ${categoryName} products`,
            });
          }
        } catch (error) {
          console.error(`Error creating category ${categoryName}:`, error);
        }
      }

      // Process products
      for (const row of data) {
        try {
          const productData = {
            brand: row.Brand || "No Brand",
            category: row.Category || "Uncategorized",
            model: row.Model || "No Model",
            quantity: Number(row.Quantity) || 0,
            costPrice: Number(row["Cost Price"]) || 0,
            sellingPrice: Number(row["Selling Price"]) || 0,
            rackLocation: row["Rack Location"] || "",
            description: row.Description || "",
            // Add any additional fields from the import
            ...Object.fromEntries(
              Object.entries(row).filter(
                ([key]) =>
                  ![
                    "Brand",
                    "Category",
                    "Model",
                    "Quantity",
                    "Cost Price",
                    "Selling Price",
                    "Rack Location",
                    "Description",
                  ].includes(key)
              )
            ),
          };

          // Check if product already exists
          const existingProducts = productsStore.getAll();
          const existingProduct = existingProducts.find(
            (p) =>
              p.brand === productData.brand && p.model === productData.model
          );

          if (existingProduct) {
            // Update existing product
            productsStore.update(existingProduct.id, {
              ...existingProduct,
              ...productData,
              quantity: existingProduct.quantity + productData.quantity, // Add to existing quantity
            });
          } else {
            // Add new product
            productsStore.add(productData);
          }

          // Create transaction record for the import
          if (productData.quantity > 0) {
            transactionsStore.add({
              type: "import",
              productId: existingProduct?.id || "new",
              quantity: productData.quantity,
              price: productData.costPrice,
              total: productData.quantity * productData.costPrice,
              notes: `Imported via data import - ${productData.brand} ${productData.model}`,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error processing row:", error);
        }
      }

      toast.success("Data imported successfully");
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error("Error processing data:", error);
      toast.error("Error processing data. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
        await processData(jsonData);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error(
          "Error reading file. Please make sure it's a valid Excel file."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        Brand: "Example Brand",
        Category: "Example Category",
        Model: "Example Model",
        Quantity: 10,
        "Cost Price": 100,
        "Selling Price": 150,
        "Rack Location": "A-1",
        Description: "Example description",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "inventory_import_template.xlsx");
  };

  const handleRemoveData = () => {
    if (window.confirm("Are you sure you want to remove the uploaded data?")) {
      setFile(null);
      setPreview([]);
      setUploadError(null);
      toast.success("Uploaded data removed successfully");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">How to Import Data</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Download the template file using the button below</li>
            <li>Fill in your data following the template format</li>
            <li>Upload your filled file using the upload area</li>
            <li>Review the preview of your data</li>
            <li>Click Import to process your data</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Download Template</h2>
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <FaDownload className="mr-2" />
            Download Template
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload File</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary"
              }
              ${uploadError ? "border-red-500" : ""}`}
          >
            <input {...getInputProps()} />
            <FaFileExcel className="mx-auto text-4xl text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-primary">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop your Excel file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            )}
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Data Preview</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Showing first 5 rows of {file ? "your data" : "template"}
            </div>
          </div>
        )}

        {/* Import and Remove Buttons */}
        {file && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleRemoveData}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FaTrash className="mr-2" />
              Remove Data
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Import Data
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImport;
