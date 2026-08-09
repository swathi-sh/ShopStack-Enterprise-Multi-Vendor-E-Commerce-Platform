package com.shopstack.controller;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:placeholder_secret}")
    private String razorpayKeySecret;

    private final OrderService orderService;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Returns Razorpay key and amount for frontend to open Razorpay modal.
     * In production, this would create a Razorpay Order via their API and return the Razorpay Order ID.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        response.put("key", razorpayKeyId);
        response.put("currency", "INR");
        // Amount from request (in paise = rupees * 100)
        Object amountObj = body.get("amount");
        long amountInPaise = amountObj != null ? (long)(Double.parseDouble(amountObj.toString()) * 100) : 0L;
        response.put("amount", amountInPaise);
        // In a real integration, generate razorpay_order_id via Razorpay API
        // For now, we return a placeholder that the frontend will use
        response.put("razorpay_order_id", "order_" + System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * After Razorpay payment success, verify the signature and place the order.
     */
    @PostMapping("/verify")
    public ResponseEntity<OrderDTO> verifyAndPlaceOrder(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        String razorpayPaymentId = (String) body.get("razorpay_payment_id");
        String razorpayOrderId = (String) body.get("razorpay_order_id");
        String razorpaySignature = (String) body.get("razorpay_signature");
        String shippingAddress = (String) body.get("shippingAddress");

        // Verify HMAC-SHA256 signature (skip for placeholder keys)
        boolean isValid = true;
        if (!razorpayKeySecret.startsWith("placeholder")) {
            isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        }

        if (!isValid) {
            return ResponseEntity.badRequest().build();
        }

        // Place the order — this deducts stock and clears cart
        String customerEmail = authentication.getName();
        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setShippingAddress(shippingAddress);

        OrderDTO order = orderService.checkout(customerEmail, orderRequest);
        return ResponseEntity.ok(order);
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
