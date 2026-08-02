package com.shopstack.service;

import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductRequestDTO;
import com.shopstack.entity.ApprovalStatus;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductDTO createProduct(String vendorEmail, ProductRequestDTO request);
    ProductDTO updateProduct(Long productId, String vendorEmail, ProductRequestDTO request);
    ProductDTO updatePrice(Long productId, String vendorEmail, BigDecimal newPrice);
    ProductDTO updateStock(Long productId, String vendorEmail, Integer newStock);
    void deleteProduct(Long productId, String vendorEmail);
    ProductDTO getProductById(Long id);
    List<ProductDTO> filterProducts(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice);
    List<ProductDTO> getProductsByVendor(String vendorEmail);
    List<ProductDTO> getPendingProducts();
    ProductDTO updateApprovalStatus(Long productId, ApprovalStatus status);
}
