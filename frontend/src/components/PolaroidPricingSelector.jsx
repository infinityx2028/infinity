import React, { useState, useEffect } from 'react';
import { Plus, Minus, Package, IndianRupee } from 'lucide-react';

const PolaroidPricingSelector = ({ onPricingChange, productId }) => {
  // Determine which polaroid size based on product ID
  const getProductSize = (id) => {
    if (id === 'pol1') return 'mini';
    if (id === 'pol2') return 'medium';
    if (id === 'pol3' || id === 'pol_large') return 'large';
    return 'mini'; // default fallback
  };
  
  const selectedSize = getProductSize(productId);
  
  // Pricing configuration
  const pricingConfig = {
    mini: {
      name: 'Mini Polaroids',
      pricePerUnit: 5,
      minOrder: 12,
      incrementStep: 6,
      description: 'Compact size perfect for small spaces'
    },
    medium: {
      name: 'Medium Polaroids',
      pricePerUnit: 8,
      minOrder: 8,
      incrementStep: 4,
      description: 'Standard size ideal for most displays'
    },
    large: {
      name: 'Large Polaroids',
      pricePerUnit: 15,
      minOrder: 4,
      incrementStep: 2,
      description: 'Premium size for maximum impact'
    }
  };
  const formatPrice = (value) => (
    Number.isFinite(value) ? (Number.isInteger(value) ? value : value.toFixed(2)) : value
  );

  const [quantities, setQuantities] = useState({
    [selectedSize]: pricingConfig[selectedSize].minOrder
  });

  const [pricing, setPricing] = useState({
    [selectedSize]: { 
      quantity: pricingConfig[selectedSize].minOrder, 
      totalPrice: pricingConfig[selectedSize].minOrder * pricingConfig[selectedSize].pricePerUnit 
    }
  });

  // Calculate pricing whenever quantities change
  useEffect(() => {
    const config = pricingConfig[selectedSize];
    const quantity = quantities[selectedSize];
    const newPricing = {
      [selectedSize]: {
        quantity,
        totalPrice: quantity * config.pricePerUnit,
        unitPrice: config.pricePerUnit
      }
    };
    setPricing(newPricing);
    
    // Notify parent component of changes
    if (onPricingChange) {
      onPricingChange({
        selectedSize,
        quantities,
        pricing: newPricing,
        currentPricing: newPricing[selectedSize]
      });
    }
  }, [quantities, selectedSize, onPricingChange]);

  const handleQuantityChange = (size, change) => {
    const config = pricingConfig[size];
    const currentQty = quantities[size];
    const newQty = currentQty + change;
    
    // Don't allow below minimum order
    if (newQty < config.minOrder) return;
    
    setQuantities(prev => ({
      ...prev,
      [size]: newQty
    }));
  };

  const currentConfig = pricingConfig[selectedSize];
  const currentPricing = pricing[selectedSize];

  // Mini Polaroids - Compact Layout
  if (selectedSize === 'mini') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border-2 border-blue-300 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">Mini</span>
          <h3 className="text-lg font-bold text-blue-900">{currentConfig.name}</h3>
        </div>

        <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">{currentConfig.description}</p>
            <div className="text-sm font-bold text-blue-600">₹{formatPrice(currentConfig.pricePerUnit)}/piece</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Quantity</span>
            <span className="text-xs text-gray-500">Min: {currentConfig.minOrder}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(selectedSize, -currentConfig.incrementStep)}
              className="w-10 h-10 bg-blue-400 text-white rounded font-bold text-sm hover:bg-blue-500 transition-colors flex items-center justify-center"
              disabled={quantities[selectedSize] <= currentConfig.minOrder}
            >
              <Minus size={16} />
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-blue-900">{quantities[selectedSize]}</div>
              <div className="text-xs text-gray-500">pcs</div>
            </div>
            
            <button
              onClick={() => handleQuantityChange(selectedSize, currentConfig.incrementStep)}
              className="w-10 h-10 bg-blue-400 text-white rounded font-bold text-sm hover:bg-blue-500 transition-colors flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-xl font-bold text-blue-600">₹{formatPrice(currentPricing.totalPrice)}</div>
          </div>
        </div>
      </div>
    );
  }

  // Medium Polaroids - Standard Layout
  if (selectedSize === 'medium') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">Medium</span>
          <div>
            <h3 className="text-xl font-bold text-green-900">{currentConfig.name}</h3>
            <p className="text-xs text-green-700">{currentConfig.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 mb-1">Unit Price</div>
            <div className="text-lg font-bold text-green-600">₹{formatPrice(currentConfig.pricePerUnit)}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 mb-1">Min Order</div>
            <div className="text-lg font-bold text-green-600">{currentConfig.minOrder} pcs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-green-200 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-700">Select Quantity</label>
            <span className="text-xs text-green-600 font-semibold">+{currentConfig.incrementStep} per click</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleQuantityChange(selectedSize, -currentConfig.incrementStep)}
              className="w-12 h-12 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center"
              disabled={quantities[selectedSize] <= currentConfig.minOrder}
            >
              <Minus size={20} />
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-green-900">{quantities[selectedSize]}</div>
              <div className="text-sm text-gray-600">pieces</div>
            </div>
            
            <button
              onClick={() => handleQuantityChange(selectedSize, currentConfig.incrementStep)}
              className="w-12 h-12 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Per Piece:</span>
                <span className="font-semibold text-green-600">₹{formatPrice(currentConfig.pricePerUnit)}</span>
            </div>
            <div className="border-t border-green-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Price:</span>
                <span className="text-2xl font-bold text-green-600">₹{formatPrice(currentPricing.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Large Polaroids - Premium Layout
  if (selectedSize === 'large') {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">Large</span>
          <div>
            <h3 className="text-2xl font-bold text-amber-900">{currentConfig.name}</h3>
            <p className="text-sm text-amber-700 font-semibold">Premium Choice</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
          <p className="text-sm text-gray-700 mb-3">{currentConfig.description}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-50 p-2 rounded">
              <div className="text-xs text-gray-600">Price/Pc</div>
              <div className="text-xl font-bold text-amber-600">₹{formatPrice(currentConfig.pricePerUnit)}</div>
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <div className="text-xs text-gray-600">Min Order</div>
              <div className="text-xl font-bold text-amber-600">{currentConfig.minOrder}</div>
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <div className="text-xs text-gray-600">Increment</div>
              <div className="text-xl font-bold text-amber-600">+{currentConfig.incrementStep}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-amber-200 space-y-4">
          <label className="block text-base font-bold text-gray-700">Custom Quantity Selection</label>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleQuantityChange(selectedSize, -currentConfig.incrementStep)}
              className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center"
              disabled={quantities[selectedSize] <= currentConfig.minOrder}
            >
              <Minus size={22} />
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-5xl font-bold text-amber-900">{quantities[selectedSize]}</div>
              <div className="text-sm text-gray-600 mt-1">pieces selected</div>
            </div>
            
            <button
              onClick={() => handleQuantityChange(selectedSize, currentConfig.incrementStep)}
              className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center"
            >
              <Plus size={22} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg border-2 border-amber-200">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Unit Price</span>
                <span className="text-lg font-bold text-amber-600">₹{formatPrice(currentConfig.pricePerUnit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total Pieces</span>
                <span className="text-lg font-bold text-amber-600">{currentPricing.quantity}</span>
              </div>
            </div>
            <div className="border-t-2 border-amber-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-amber-900">Final Price</span>
                <span className="text-4xl font-bold text-amber-600">₹{formatPrice(currentPricing.totalPrice)}</span>
              </div>
              <div className="text-xs text-amber-700 mt-2 text-right">
                {currentPricing.quantity} × ₹{formatPrice(currentConfig.pricePerUnit)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
};

export default PolaroidPricingSelector;

