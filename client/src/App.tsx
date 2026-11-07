import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ShortlistProvider } from './context/ShortlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnquiryModal } from './components/common/EnquiryModal';
import { api } from './services/api';

// Batch 1 Pages
import { HomePage } from './pages/customer/HomePage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { ProductListPage } from './pages/customer/ProductListPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { ShortlistPage } from './pages/customer/ShortlistPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Batch 2 Pages
import { BedsCollectionPage } from './pages/customer/BedsCollectionPage';
import { AboutUsPage } from './pages/customer/AboutUsPage';
import { ContactUsPage } from './pages/customer/ContactUsPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminMediaLibraryPage } from './pages/admin/AdminMediaLibraryPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';

// Batch 3 Pages
import { CraftsmanshipPage } from './pages/customer/CraftsmanshipPage';
import { ShowcasePage } from './pages/customer/ShowcasePage';
import { FeaturedCollectionsPage } from './pages/customer/FeaturedCollectionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
      refetchInterval: false, // Realtime sync handles changes; no aggressive polling loop needed
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] text-xs font-serif text-[#8A7569]">
        Verifying admin authorization...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const CatalogRealtimeSync: React.FC = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubscribe = api.subscribeToCatalogChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });
    return () => unsubscribe();
  }, [queryClient]);
  return null;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CatalogRealtimeSync />
      <AuthProvider>
        <ShortlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/collections" element={<FeaturedCollectionsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/collections/beds" element={<BedsCollectionPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/shortlist" element={<ShortlistPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/craftsmanship" element={<CraftsmanshipPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/testimonials" element={<ShowcasePage />} />
              <Route path="/featured-collections" element={<FeaturedCollectionsPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <ProtectedAdminRoute>
                    <AdminAddProductPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/products/:id/edit"
                element={
                  <ProtectedAdminRoute>
                    <AdminAddProductPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/add-product"
                element={
                  <ProtectedAdminRoute>
                    <AdminAddProductPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/media"
                element={
                  <ProtectedAdminRoute>
                    <AdminMediaLibraryPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedAdminRoute>
                    <AdminCategoriesPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global WhatsApp Enquiry Modal */}
            <EnquiryModal />
          </BrowserRouter>
        </ShortlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
