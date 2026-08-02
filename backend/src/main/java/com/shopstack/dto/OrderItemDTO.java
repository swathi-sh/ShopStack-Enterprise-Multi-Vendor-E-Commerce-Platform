package com.shopstack.dto;

import com.shopstack.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDTO {

    private Long id;
    private ProductDTO product;
    private VendorDTO vendor;
    private Integer quantity;
    private BigDecimal priceAtPurchase;

    public OrderItemDTO() {
    }

    public OrderItemDTO(OrderItem item) {
        this.id = item.getId();
        this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
        this.vendor = item.getVendor() != null ? new VendorDTO(item.getVendor()) : null;
        this.quantity = item.getQuantity();
        this.priceAtPurchase = item.getPriceAtPurchase();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public VendorDTO getVendor() {
        return vendor;
    }

    public void setVendor(VendorDTO vendor) {
        this.vendor = vendor;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }
}
