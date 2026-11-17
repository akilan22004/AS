import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Search, AlertCircle, Loader2, Layers } from 'lucide-react';
import { Category } from '../../types';

interface CategoryDropdownProps {
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
  onQuickAdd?: (name: string) => Promise<Category | void>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  selectedId,
  onSelect,
  onQuickAdd,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !onQuickAdd) return;
    setIsAdding(true);
    setAddError(null);
    try {
      const created = await onQuickAdd(newCatName.trim());
      setNewCatName('');
      if (created && created.id) {
        onSelect(created.id);
        setIsOpen(false);
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add category');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id="category-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Category"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#FAF7F2] hover:bg-[#F3EDE2] border transition-all text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs ${
          isOpen
            ? 'border-[#493326] ring-2 ring-[#493326]/10 shadow-sm'
            : 'border-[#DDD1C0]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers size={14} className="text-[#8A7569] flex-shrink-0" />
          {isLoading ? (
            <span className="text-[#8A7569] flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Loading categories...
            </span>
          ) : selectedCategory ? (
            <span className="font-semibold text-[#241B16] truncate">
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-[#8A7569] italic">
              {categories.length > 0 ? categories[0].name : 'Choose a category...'}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-[#7A675B] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#241B16]' : ''
          }`}
        />
      </button>

      {/* Floating Options Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available Categories"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#DDD1C0] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Search Box if more than 4 categories */}
          {categories.length > 4 && (
            <div className="p-2 border-b border-[#EFE9DF] bg-[#FAF7F2]">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A7569]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-full bg-white border border-[#DDD1C0] rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-[#241B16] focus:outline-none focus:border-[#493326]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-xs text-[#8A7569] flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading categories from database...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs flex items-center justify-between border-b border-red-100">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="underline font-semibold hover:text-red-900 ml-2"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Category List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-[#F4EEE3]">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((c) => {
                const isSelected = c.id === selectedId || (!selectedId && c.id === categories[0]?.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(c.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#FAF4EB] font-bold text-[#241B16]'
                        : 'text-[#493326] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B69764] flex-shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#241B16] flex-shrink-0 ml-2 font-bold" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#8A7569]">
                {search ? `No categories matching "${search}"` : 'No categories available.'}
              </div>
            )}
          </div>

          {/* Quick Add Category Section */}
          {onQuickAdd && (
            <div className="p-2 border-t border-[#EFE9DF] bg-[#FCFAF7]">
              {addError && (
                <p className="text-[10px] text-red-600 mb-1 px-1">{addError}</p>
              )}
              <form onSubmit={handleQuickAdd} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="+ New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-white border border-[#DDD1C0] rounded-lg px-2.5 py-1 text-[11px] text-[#241B16] focus:outline-none focus:border-[#493326]"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim() || isAdding}
                  className="px-2.5 py-1 bg-[#493326] hover:bg-[#34241A] disabled:opacity-40 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  {isAdding ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
