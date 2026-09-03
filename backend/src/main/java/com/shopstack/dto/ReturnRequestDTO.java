package com.shopstack.dto;

import com.shopstack.entity.ReturnRequest;
import com.shopstack.entity.ReturnStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReturnRequestDTO {

    private Long id;
    private Long orderId;
    private Long orderItemId;

    // Customer info
    private Long customerId;
    private String customerName;
    private String customerEmail;

    // Product info
    private Long productId;
    private String productName;
    private String vendorName;
    private BigDecimal priceAtPurchase;

    // Order item quantity (original) vs return quantity
    private Integer orderedQuantity;
    private Integer returnQuantity;

    // Return details
    private String reason;
    private ReturnStatus returnStatus;
    private String adminNotes;

    // Inventory decision (post-receive)
    private Boolean isUsable;
    private Long restockWarehouseId;
    private String restockWarehouseName;

    // Refund info
    private BigDecimal refundAmount;
    private String razorpayRefundId;
    private String refundFailureReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReturnRequestDTO() {}

    public ReturnRequestDTO(ReturnRequest r) {
        this.id = r.getId();
        this.orderId = r.getOrder() != null ? r.getOrder().getId() : null;
        this.orderItemId = r.getOrderItem() != null ? r.getOrderItem().getId() : null;

        if (r.getCustomer() != null) {
            this.customerId = r.getCustomer().getId();
            this.customerName = r.getCustomer().getName();
            this.customerEmail = r.getCustomer().getEmail();
        }

        if (r.getOrderItem() != null) {
            if (r.getOrderItem().getProduct() != null) {
                this.productId = r.getOrderItem().getProduct().getId();
                this.productName = r.getOrderItem().getProduct().getName();
            }
            if (r.getOrderItem().getVendor() != null) {
                this.vendorName = r.getOrderItem().getVendor().getBusinessName();
            }
            this.priceAtPurchase = r.getOrderItem().getPriceAtPurchase();
            this.orderedQuantity = r.getOrderItem().getQuantity();
        }

        this.returnQuantity = r.getQuantity();
        this.reason = r.getReason();
        this.returnStatus = r.getReturnStatus();
        this.adminNotes = r.getAdminNotes();
        this.isUsable = r.getIsUsable();

        if (r.getRestockWarehouse() != null) {
            this.restockWarehouseId = r.getRestockWarehouse().getId();
            this.restockWarehouseName = r.getRestockWarehouse().getName();
        }

        this.refundAmount = r.getRefundAmount();
        this.razorpayRefundId = r.getRazorpayRefundId();
        this.refundFailureReason = r.getRefundFailureReason();
        this.createdAt = r.getCreatedAt();
        this.updatedAt = r.getUpdatedAt();
    }

    // ─── Getters & Setters ────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public void setPriceAtPurchase(BigDecimal priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; }

    public Integer getOrderedQuantity() { return orderedQuantity; }
    public void setOrderedQuantity(Integer orderedQuantity) { this.orderedQuantity = orderedQuantity; }

    public Integer getReturnQuantity() { return returnQuantity; }
    public void setReturnQuantity(Integer returnQuantity) { this.returnQuantity = returnQuantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public ReturnStatus getReturnStatus() { return returnStatus; }
    public void setReturnStatus(ReturnStatus returnStatus) { this.returnStatus = returnStatus; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Boolean getIsUsable() { return isUsable; }
    public void setIsUsable(Boolean isUsable) { this.isUsable = isUsable; }

    public Long getRestockWarehouseId() { return restockWarehouseId; }
    public void setRestockWarehouseId(Long restockWarehouseId) { this.restockWarehouseId = restockWarehouseId; }

    public String getRestockWarehouseName() { return restockWarehouseName; }
    public void setRestockWarehouseName(String restockWarehouseName) { this.restockWarehouseName = restockWarehouseName; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getRazorpayRefundId() { return razorpayRefundId; }
    public void setRazorpayRefundId(String razorpayRefundId) { this.razorpayRefundId = razorpayRefundId; }

    public String getRefundFailureReason() { return refundFailureReason; }
    public void setRefundFailureReason(String refundFailureReason) { this.refundFailureReason = refundFailureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
