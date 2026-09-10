import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BusinessProvider } from './context/BusinessContext'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { HomePage } from './pages/public/HomePage'
import { MenuPage } from './pages/public/MenuPage'
import { CakesPage } from './pages/public/CakesPage'
import { CustomCakePage } from './pages/public/CustomCakePage'
import { ProductDetailPage } from './pages/public/ProductDetailPage'
import { EnquirySuccessPage } from './pages/public/EnquirySuccessPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage'
import { AdminEnquiryDetailPage } from './pages/admin/AdminEnquiryDetailPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminMorePage } from './pages/admin/AdminMorePage'

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <HashRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="cakes" element={<CakesPage />} />
              <Route path="custom-cake" element={<CustomCakePage />} />
              <Route path="products/:productId" element={<ProductDetailPage />} />
              <Route path="enquiry/success" element={<EnquirySuccessPage />} />
            </Route>

            <Route path="admin/login" element={<AdminLoginPage />} />

            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
              <Route path="enquiries/:id" element={<AdminEnquiryDetailPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="more" element={<AdminMorePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </BusinessProvider>
    </AuthProvider>
  )
}
