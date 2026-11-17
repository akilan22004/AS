import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ShortlistProvider } from './context/ShortlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnquiryModal } from './components/common/EnquiryModal';
import { api } from './services/api';

// Critical Homepage loaded eagerly for instant First Contentful Paint
import { HomePage } from './pages/customer/HomePage';

// Secondary Customer Pages lazy-loaded for smaller initial JS bundle
const CategoriesPage = lazy(() => import('./pages/customer/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const ProductListPage = lazy(() => import('./pages/customer/ProductListPage').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ShortlistPage = lazy(() => import('./pages/customer/ShortlistPage').then(m => ({ default: m.ShortlistPage })));
const BedsCollectionPage = lazy(() => import('./pages/customer/BedsCollectionPage').then(m => ({ default: m.BedsCollectionPage })));
const AboutUsPage = lazy(() => import('./pages/customer/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('./pages/customer/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const CraftsmanshipPage = lazy(() => import('./pages/customer/CraftsmanshipPage').then(m => ({ default: m.CraftsmanshipPage })));
const ShowcasePage = lazy(() => import('./pages/customer/ShowcasePage').then(m => ({ default: m.ShowcasePage })));
const FeaturedCollectionsPage = lazy(() => import('./pages/customer/FeaturedCollectionsPage').then(m => ({ default: m.FeaturedCollectionsPage })));

// Admin Pages lazy-loaded (only downloaded when admin logs in)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminAddProductPage = lazy(() => import('./pages/admin/AdminAddProductPage').then(m => ({ default: m.AdminAddProductPage })));
const AdminMediaLibraryPage = lazy(() => import('./pages/admin/AdminMediaLibraryPage').then(m => ({ default: m.AdminMediaLibraryPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true, // Always verify fresh data when entering a page
      refetchOnWindowFocus: true, // Auto-update when returning to tab
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
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });
    return () => unsubscribe();
  }, [queryClient]);
  return null;
};

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#F7F3EC] text-xs font-serif text-[#8A7569] animate-pulse">
    Loading Annamalai Furniture...
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CatalogRealtimeSync />
      <AuthProvider>
        <ShortlistProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>

            {/* Global WhatsApp Enquiry Modal */}
            <EnquiryModal />
          </BrowserRouter>
        </ShortlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
