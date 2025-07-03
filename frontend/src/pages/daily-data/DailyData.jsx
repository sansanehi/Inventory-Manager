import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSort, FaSortUp, FaSortDown, FaFileExport, FaFilter, FaUndo, FaRedo, FaPlusCircle, FaPalette, FaArrowsAltH, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaAlignLeft, FaAlignCenter, FaAlignRight, FaTable, FaFont, FaCalculator, FaChartBar, FaSave, FaFileImport, FaCut, FaCopy, FaPaste, FaLink, FaUnlink, FaListUl, FaListOl, FaIndent, FaOutdent, FaHighlighter, FaEraser, FaBorderAll, FaBorderNone, FaBorderStyle, FaFill, FaTextHeight, FaTextWidth, FaTh, FaObjectGroup, FaChartLine, FaChartPie, FaPrint, FaCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ordersStore } from '../../store/localStore';
import * as XLSX from 'xlsx';

const DailyData = () => {
  // Grid state
  const [gridData, setGridData] = useState({});
  const [selectedRange, setSelectedRange] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [formulas, setFormulas] = useState({});
  const [cellStyles, setCellStyles] = useState({});
  const [mergedCells, setMergedCells] = useState({});
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState(null);
  const [showFormulaBar, setShowFormulaBar] = useState(false);
  const [formulaInput, setFormulaInput] = useState('');
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [showQATSettings, setShowQATSettings] = useState(false);
  const [qatCommands, setQATCommands] = useState([
    { id: 'save', icon: FaSave, label: 'Save' },
    { id: 'undo', icon: FaUndo, label: 'Undo' },
    { id: 'redo', icon: FaRedo, label: 'Redo' },
    { id: 'print', icon: FaPrint, label: 'Print' },
    { id: 'chart', icon: FaChartBar, label: 'Chart' }
  ]);

  // Grid dimensions
  const ROWS = 100;
  const COLS = 26;
  const gridRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize grid
  useEffect(() => {
    const initialGrid = {};
    for (let row = 1; row <= ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row}`;
        initialGrid[cellId] = '';
      }
    }
    setGridData(initialGrid);
  }, []);

  // Formula evaluation
  const evaluateFormula = (formula, data) => {
    try {
      if (!formula.startsWith('=')) return formula;

      // Remove the = sign
      formula = formula.substring(1);

      // Handle basic arithmetic
      if (formula.includes('+') || formula.includes('-') || formula.includes('*') || formula.includes('/')) {
        // Replace cell references with their values
        const cellRefs = formula.match(/[A-Z]+\d+/g) || [];
        cellRefs.forEach(ref => {
          const value = data[ref] || 0;
          formula = formula.replace(ref, value);
        });
        return eval(formula);
      }

      // Handle functions
      if (formula.toUpperCase().startsWith('SUM(')) {
        const range = formula.match(/SUM\((.*?)\)/)[1];
        const [start, end] = range.split(':');
        const values = Object.entries(data)
          .filter(([key]) => key >= start && key <= end)
          .map(([_, value]) => parseFloat(value) || 0);
        return values.reduce((a, b) => a + b, 0);
      }

      if (formula.toUpperCase().startsWith('AVERAGE(')) {
        const range = formula.match(/AVERAGE\((.*?)\)/)[1];
        const [start, end] = range.split(':');
        const values = Object.entries(data)
          .filter(([key]) => key >= start && key <= end)
          .map(([_, value]) => parseFloat(value) || 0);
        return values.reduce((a, b) => a + b, 0) / values.length;
      }

      if (formula.toUpperCase().startsWith('IF(')) {
        const match = formula.match(/IF\((.*?),(.*?),(.*?)\)/);
        if (match) {
          const [_, condition, trueValue, falseValue] = match;
          return eval(condition) ? trueValue : falseValue;
        }
      }

      return formula;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR';
    }
  };

  // Cell operations
  const handleCellClick = (cellId) => {
    setActiveCell(cellId);
    setShowFormulaBar(true);
    setFormulaInput(formulas[cellId] || gridData[cellId] || '');
  };

  const handleCellDoubleClick = (cellId) => {
    setEditingCell(cellId);
    setEditingValue(gridData[cellId] || '');
    setActiveCell(cellId);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleCellEdit = (e, cellId) => {
    const value = e.target.value;
    setEditingValue(value);
  };

  const handleCellEditComplete = (cellId) => {
    if (editingCell) {
      const newValue = editingValue;
      const oldValue = gridData[cellId];
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        type: 'edit',
        cellId,
        oldValue,
        newValue
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Update grid data
      setGridData(prev => ({
        ...prev,
        [cellId]: newValue
      }));

      setEditingCell(null);
      setEditingValue('');
    }
  };

  // Selection handling
  const handleCellMouseDown = (e, cellId) => {
    if (e.button === 0) {
      setSelectedRange({ start: cellId, end: cellId });
      setActiveCell(cellId);
    }
  };

  const handleCellMouseEnter = (cellId) => {
    if (selectedRange) {
      setSelectedRange(prev => ({ ...prev, end: cellId }));
    }
  };

  const handleCellMouseUp = () => {
    // Selection complete
  };

  // Clipboard operations
  const handleCopy = () => {
    if (selectedRange) {
      const { start, end } = selectedRange;
      const [startCol, startRow] = [start.match(/[A-Z]+/)[0], parseInt(start.match(/\d+/)[0])];
      const [endCol, endRow] = [end.match(/[A-Z]+/)[0], parseInt(end.match(/\d+/)[0])];
      
      const copiedData = {};
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
          const cellId = `${String.fromCharCode(col)}${row}`;
          copiedData[cellId] = gridData[cellId];
        }
      }
      setClipboard(copiedData);
      toast.success('Copied to clipboard');
    }
  };

  const handlePaste = () => {
    if (clipboard && activeCell) {
      const [startCol, startRow] = [activeCell.match(/[A-Z]+/)[0], parseInt(activeCell.match(/\d+/)[0])];
      
      const newData = { ...gridData };
      Object.entries(clipboard).forEach(([cellId, value]) => {
        const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
        const newCol = String.fromCharCode(startCol.charCodeAt(0) + (col.charCodeAt(0) - clipboard.startCol.charCodeAt(0)));
        const newRow = startRow + (row - clipboard.startRow);
        const newCellId = `${newCol}${newRow}`;
        newData[newCellId] = value;
      });

      setGridData(newData);
      toast.success('Pasted successfully');
    }
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const action = history[historyIndex - 1];
      if (action.type === 'edit') {
        setGridData(prev => ({
          ...prev,
          [action.cellId]: action.oldValue
        }));
      }
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      if (action.type === 'edit') {
        setGridData(prev => ({
          ...prev,
          [action.cellId]: action.newValue
        }));
      }
      setHistoryIndex(historyIndex + 1);
    }
  };

  // File operations
  const handleSave = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(
      Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          return gridData[cellId] || '';
        })
      )
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'epsi_sheet.xlsx');
    toast.success('File saved successfully');
  };

  const handleLoad = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const newGridData = { ...gridData };
      jsonData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
          newGridData[cellId] = cell;
        });
      });
      
      setGridData(newGridData);
      toast.success('File loaded successfully');
    };
    reader.readAsArrayBuffer(file);
  };

  // Chart operations
  const handleCreateChart = () => {
    if (selectedRange) {
      const { start, end } = selectedRange;
      const [startCol, startRow] = [start.match(/[A-Z]+/)[0], parseInt(start.match(/\d+/)[0])];
      const [endCol, endRow] = [end.match(/[A-Z]+/)[0], parseInt(end.match(/\d+/)[0])];
      
      const chartData = {
        labels: [],
        datasets: []
      };

      // Extract data for chart
      for (let row = startRow; row <= endRow; row++) {
        const rowData = [];
        for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
          const cellId = `${String.fromCharCode(col)}${row}`;
          rowData.push(gridData[cellId]);
        }
        chartData.datasets.push({
          label: `Row ${row}`,
          data: rowData
        });
      }

      setChartData(chartData);
      setShowChartModal(true);
    }
  };

  return (
    <div className="container mx-auto">
      {/* Quick Access Toolbar */}
      <div className="bg-white shadow mb-4">
        <div className="p-2 border-b flex items-center space-x-2 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary">Epsi Sheet</span>
            <div className="border-l mx-2 h-6"></div>
          </div>
          {qatCommands.map(cmd => (
            <button
              key={cmd.id}
              className="p-2 hover:bg-gray-100 rounded"
              title={cmd.label}
              onClick={() => {
                switch (cmd.id) {
                  case 'save':
                    handleSave();
                    break;
                  case 'undo':
                    handleUndo();
                    break;
                  case 'redo':
                    handleRedo();
                    break;
                  case 'print':
                    window.print();
                    break;
                  case 'chart':
                    handleCreateChart();
                    break;
                }
              }}
            >
              <cmd.icon />
            </button>
          ))}
          <button
            className="p-2 hover:bg-gray-100 rounded"
            title="Customize Quick Access Toolbar"
            onClick={() => setShowQATSettings(true)}
          >
            <FaCog />
          </button>
        </div>

        {/* Formula Bar */}
        {showFormulaBar && (
          <div className="p-2 border-b flex items-center space-x-2">
            <span className="text-gray-600">{activeCell}</span>
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFormulas(prev => ({
                    ...prev,
                    [activeCell]: formulaInput
                  }));
                  setGridData(prev => ({
                    ...prev,
                    [activeCell]: evaluateFormula(formulaInput, prev)
                  }));
                }
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter formula"
            />
          </div>
        )}

        {/* Main Toolbar */}
        <div className="p-2 border-b">
          <div className="flex flex-wrap gap-2">
            {/* File Operations */}
            <div className="flex items-center space-x-2 border-r pr-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="New">
                <FaPlus />
              </button>
              <label className="p-2 hover:bg-gray-100 rounded cursor-pointer" title="Open">
                <FaFileImport />
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleLoad(e.target.files[0])}
                />
              </label>
              <button className="p-2 hover:bg-gray-100 rounded" title="Save" onClick={handleSave}>
                <FaSave />
              </button>
            </div>

            {/* Clipboard Operations */}
            <div className="flex items-center space-x-2 border-r pr-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="Cut" onClick={handleCopy}>
                <FaCut />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Copy" onClick={handleCopy}>
                <FaCopy />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Paste" onClick={handlePaste}>
                <FaPaste />
              </button>
            </div>

            {/* Formatting */}
            <div className="flex items-center space-x-2 border-r pr-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="Bold">
                <FaBold />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Italic">
                <FaItalic />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Underline">
                <FaUnderline />
              </button>
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded" title="Font Color">
                  <FaFont />
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg p-2 rounded mt-1 z-50">
                  <input type="color" />
                </div>
              </div>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-2 border-r pr-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="Align Left">
                <FaAlignLeft />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Align Center">
                <FaAlignCenter />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Align Right">
                <FaAlignRight />
              </button>
            </div>

            {/* Data Tools */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded" title="Sort">
                <FaSort />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Filter">
                <FaFilter />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Chart" onClick={handleCreateChart}>
                <FaChartBar />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 bg-gray-100 sticky top-0 z-10 w-12"></th>
                {Array.from({ length: COLS }, (_, i) => (
                  <th
                    key={i}
                    className="border border-gray-300 bg-gray-100 sticky top-0 z-10 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: ROWS }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-500">
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: COLS }, (_, colIndex) => {
                    const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                    const isActive = activeCell === cellId;
                    const isSelected = selectedRange && 
                      cellId >= selectedRange.start && 
                      cellId <= selectedRange.end;
                    const cellValue = gridData[cellId] || '';
                    const formula = formulas[cellId];
                    const displayValue = formula ? evaluateFormula(formula, gridData) : cellValue;

                    return (
                      <td
                        key={cellId}
                        className={`border border-gray-300 px-2 py-1 relative ${
                          isActive ? 'bg-blue-100' : isSelected ? 'bg-blue-50' : ''
                        }`}
                        style={{
                          ...cellStyles[cellId],
                          height: '32px',
                          minWidth: '100px'
                        }}
                        onDoubleClick={() => handleCellDoubleClick(cellId)}
                        onMouseDown={(e) => handleCellMouseDown(e, cellId)}
                        onMouseEnter={() => handleCellMouseEnter(cellId)}
                        onMouseUp={handleCellMouseUp}
                        onClick={() => handleCellClick(cellId)}
                      >
                        {editingCell === cellId ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editingValue}
                            onChange={(e) => handleCellEdit(e, cellId)}
                            onBlur={() => handleCellEditComplete(cellId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCellEditComplete(cellId);
                              }
                            }}
                            className="w-full h-full absolute inset-0 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        ) : (
                          <div className="min-h-[24px] overflow-hidden text-ellipsis whitespace-pre-wrap">
                            {displayValue}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Modal */}
      {showChartModal && chartData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Chart</h2>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {/* Create bar chart */}}
                >
                  <FaChartBar />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {/* Create line chart */}}
                >
                  <FaChartLine />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {/* Create pie chart */}}
                >
                  <FaChartPie />
                </button>
              </div>
              {/* Chart preview will go here */}
            </div>
          </div>
        </div>
      )}

      {/* QAT Settings Modal */}
      {showQATSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Customize Quick Access Toolbar</h2>
              <button
                onClick={() => setShowQATSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {qatCommands.map(cmd => (
                  <button
                    key={cmd.id}
                    className="p-2 hover:bg-gray-100 rounded flex items-center space-x-2"
                    onClick={() => {
                      setQATCommands(prev =>
                        prev.filter(c => c.id !== cmd.id)
                      );
                    }}
                  >
                    <cmd.icon />
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowQATSettings(false)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyData;