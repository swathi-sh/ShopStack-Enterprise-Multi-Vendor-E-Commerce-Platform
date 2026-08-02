package com.shopstack.dto;

import com.shopstack.entity.Order;
import com.shopstack.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {

    private Long id;
    private CustomerDTO customer;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;

    public OrderDTO() {
    }

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.customer = order.getCustomer() != null ? new CustomerDTO(order.getCustomer()) : null;
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.shippingAddress = order.getShippingAddress();
        this.items = order.getItems() != null ? order.getItems().stream().map(OrderItemDTO::new).collect(Collectors.toList()) : null;
        this.createdAt = order.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
