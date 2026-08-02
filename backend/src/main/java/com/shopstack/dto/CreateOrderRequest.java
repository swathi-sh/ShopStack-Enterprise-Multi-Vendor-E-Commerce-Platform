package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateOrderRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    public CreateOrderRequest() {
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
