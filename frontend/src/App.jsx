import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { HomePage } from './pages/Home.jsx'
import { LoginPage } from './pages/Login.jsx'
import { RegisterPage } from './pages/Register.jsx'
import { VerifyCodePage } from './pages/VerifyCode.jsx'
import { MePage } from './pages/Me.jsx'
import { ProductDetailPage } from './pages/ProductDetail.jsx'
import { CreateProductPage } from './pages/CreateProduct.jsx'
import { CartPage } from './pages/Cart.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify" element={<VerifyCodePage />} />
        <Route path="me" element={<MePage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
