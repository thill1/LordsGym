import React, { useState } from 'react';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';

interface ProductBulkOperationsProps {
  products: Product[];
  selectedProducts: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkUpdate: (ids: string[], updates: Partial<Product>) => Promise<void>;
}

const ProductBulkOperations: React.FC<ProductBulkOperationsProps> = ({
  products,
  selectedProducts,
  onSelectionChange,
  onBulkDelete,
  onBulkUpdate
}) => {
  const { showSuccess, showError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkFeatured, setBulkFeatured] = useState<boolean | null>(null);

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await onBulkDelete(Array.from(selectedProducts));
      onSelectionChange(new Set());
      setShowDeleteConfirm(false);
      showSuccess(`${selectedProducts.size} product(s) deleted successfully`);
    } catch (error) {
      showError('Failed to delete products');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const updates: Partial<Product> = {};
      if (bulkCategory) updates.category = bulkCategory;
      if (bulkFeatured !== null) {
        (updates as any).featured = bulkFeatured;
      }

      if (Object.keys(updates).length > 0) {
        await onBulkUpdate(Array.from(selectedProducts), updates);
        onSelectionChange(new Set());
        setShowBulkEdit(false);
        setBulkCategory('');
        setBulkFeatured(null);
        showSuccess(`${selectedProducts.size} product(s) updated successfully`);
      }
    } catch (error) {
      showError('Failed to update products');
    }
  };

  if (selectedProducts.size === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Select products to perform bulk operations
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSelectAll}
        >
          Select All
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold dark:text-white">
          {selectedProducts.size} product(s) selected
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBulkEdit(true)}
          >
            Bulk Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            Delete Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectionChange(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Bulk Edit Products</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                >
                  <option value="">Keep existing</option>
                  <option value="Men's Apparel">Men's Apparel</option>
                  <option value="Women's Apparel">Women's Apparel</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Featured</label>
                <select
                  value={bulkFeatured === null ? '' : bulkFeatured.toString()}
                  onChange={(e) => setBulkFeatured(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                >
                  <option value="">Keep existing</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkEdit(false);
                    setBulkCategory('');
                    setBulkFeatured(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  onClick={handleBulkUpdate}
                  className="flex-1"
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Products"
        message={`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  );
};

export default ProductBulkOperations;
