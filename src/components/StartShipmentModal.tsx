"use client";

import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Loader } from 'lucide-react';

interface StartShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (scannedPackageIds: string[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  totalPackages: number;
}

export default function StartShipmentModal({
  isOpen,
  onClose,
  onStart,
  isLoading,
  error,
  totalPackages,
}: StartShipmentModalProps) {
  const [scannedPackages, setScannedPackages] = useState<string[]>([]);
  const [currentScan, setCurrentScan] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    if (currentScan.trim()) {
      if (!scannedPackages.includes(currentScan.trim())) {
        setScannedPackages([...scannedPackages, currentScan.trim()]);
      }
      setCurrentScan('');
      scanInputRef.current?.focus();
    }
  };

  const handleRemovePackage = (index: number) => {
    setScannedPackages(scannedPackages.filter((_, i) => i !== index));
  };

  const handleStart = async () => {
    if (scannedPackages.length === 0) {
      alert('Please scan at least one package');
      return;
    }
    await onStart(scannedPackages);
    setScannedPackages([]);
    setCurrentScan('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  if (!isOpen) return null;

  const percentageScanned = totalPackages > 0 ? Math.round((scannedPackages.length / totalPackages) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Start Shipment</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              Scan the packages loaded in this shipment. Unscanned packages will be marked as pending and collected later.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Scanner Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Scan Package ID / Tracking Number
            </label>
            <div className="flex gap-2">
              <input
                ref={scanInputRef}
                type="text"
                value={currentScan}
                onChange={(e) => setCurrentScan(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan or type package ID..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                autoFocus
              />
              <button
                onClick={handleScan}
                disabled={isLoading || !currentScan.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Packages Scanned
              </span>
              <span className="text-sm font-bold text-blue-600">
                {scannedPackages.length} / {totalPackages}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentageScanned}%` }}
              ></div>
            </div>
          </div>

          {/* Scanned Packages List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Scanned Packages ({scannedPackages.length})
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
              {scannedPackages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No packages scanned yet</p>
              ) : (
                scannedPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                  >
                    <span className="text-sm font-mono text-gray-900 truncate">{pkg}</span>
                    <button
                      onClick={() => handleRemovePackage(idx)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isLoading || scannedPackages.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Starting...
              </>
            ) : (
              'Start Shipment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
