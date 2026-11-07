import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface ShortlistContextType {
  shortlist: Product[];
  addToShortlist: (product: Product) => void;
  removeFromShortlist: (productId: string) => void;
  isInShortlist: (productId: string) => boolean;
  toggleShortlist: (product: Product) => void;
  clearShortlist: () => void;
  enquiryModalProduct: Product | Product[] | null;
  openEnquiryModal: (product?: Product | Product[]) => void;
  closeEnquiryModal: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export const ShortlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortlist, setShortlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('af_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [enquiryModalProduct, setEnquiryModalProduct] = useState<Product | Product[] | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('af_shortlist', JSON.stringify(shortlist));
    } catch {
      // storage unavailable
    }
  }, [shortlist]);

  const addToShortlist = (product: Product) => {
    setShortlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromShortlist = (productId: string) => {
    setShortlist(prev => prev.filter(p => p.id !== productId));
  };

  const isInShortlist = (productId: string) => {
    return shortlist.some(p => p.id === productId);
  };

  const toggleShortlist = (product: Product) => {
    if (isInShortlist(product.id)) {
      removeFromShortlist(product.id);
    } else {
      addToShortlist(product);
    }
  };

  const clearShortlist = () => {
    setShortlist([]);
  };

  const openEnquiryModal = (product?: Product | Product[]) => {
    setEnquiryModalProduct(product || shortlist);
  };

  const closeEnquiryModal = () => {
    setEnquiryModalProduct(null);
  };

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        addToShortlist,
        removeFromShortlist,
        isInShortlist,
        toggleShortlist,
        clearShortlist,
        enquiryModalProduct,
        openEnquiryModal,
        closeEnquiryModal,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
};

export const useShortlist = () => {
  const context = useContext(ShortlistContext);
  if (!context) throw new Error('useShortlist must be used within ShortlistProvider');
  return context;
};
