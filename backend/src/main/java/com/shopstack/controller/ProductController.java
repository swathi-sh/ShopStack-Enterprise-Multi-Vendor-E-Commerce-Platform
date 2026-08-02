package com.shopstack.controller;

import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductReviewDTO;
import com.shopstack.dto.ProductReviewRequest;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.service.ProductReviewService;
import com.shopstack.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final ProductReviewService reviewService;

    public ProductController(ProductService productService, ProductReviewService reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(productService.filterProducts(categoryId, search, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ProductReviewDTO>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ProductReviewDTO> addProductReview(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ProductReviewRequest request) {
        String email = authentication.getName();
        ProductReviewDTO review = reviewService.addReview(id, email, request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ProductDTO> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.updateApprovalStatus(id, ApprovalStatus.APPROVED));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ProductDTO> rejectProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.updateApprovalStatus(id, ApprovalStatus.REJECTED));
    }
}
