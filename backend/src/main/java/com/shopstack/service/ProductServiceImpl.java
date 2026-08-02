package com.shopstack.service;

import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductRequestDTO;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.entity.Category;
import com.shopstack.entity.Product;
import com.shopstack.entity.Vendor;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CategoryRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
    }

    @Override
    @Transactional
    public ProductDTO createProduct(String vendorEmail, ProductRequestDTO request) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setImages(request.getImages() != null ? request.getImages() : new ArrayList<>());
        product.setApprovalStatus(ApprovalStatus.APPROVED);

        Product savedProduct = productRepository.save(product);
        return new ProductDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long productId, String vendorEmail, ProductRequestDTO request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized: Product does not belong to vendor");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }

        Product updatedProduct = productRepository.save(product);
        return new ProductDTO(updatedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updatePrice(Long productId, String vendorEmail, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to modify product price");
        }

        product.setPrice(newPrice);
        return new ProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO updateStock(Long productId, String vendorEmail, Integer newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to modify product inventory stock");
        }

        product.setStockQuantity(newStock);
        return new ProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, String vendorEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getVendor().getEmail().equalsIgnoreCase(vendorEmail)) {
            throw new RuntimeException("Unauthorized to delete product");
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return new ProductDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> filterProducts(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.filterProducts(ApprovalStatus.APPROVED, categoryId, search, minPrice, maxPrice);
        return products.stream().map(ProductDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByVendor(String vendorEmail) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        return productRepository.findByVendorId(vendor.getId()).stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findByApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDTO updateApprovalStatus(Long productId, ApprovalStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        product.setApprovalStatus(status);
        return new ProductDTO(productRepository.save(product));
    }
}
