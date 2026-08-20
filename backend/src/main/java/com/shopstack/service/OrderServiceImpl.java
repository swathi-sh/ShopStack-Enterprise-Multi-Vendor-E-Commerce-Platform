package com.shopstack.service;

import com.shopstack.dto.ApplyCouponResponse;
import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.OrderItemDTO;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            CartItemRepository cartItemRepository,
                            CustomerRepository customerRepository,
                            VendorRepository vendorRepository,
                            ProductRepository productRepository,
                            InventoryHistoryRepository inventoryHistoryRepository,
                            CouponService couponService,
                            CouponRepository couponRepository,
                            CouponUsageRepository couponUsageRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
        this.couponService = couponService;
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    @Override
    @Transactional
    public OrderDTO checkout(String customerEmail, CreateOrderRequest request) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customer.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty shopping cart.");
        }

        BigDecimal grossTotal = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress() != null && !request.getShippingAddress().isBlank()
                ? request.getShippingAddress()
                : (customer.getAddress() != null ? customer.getAddress() : "Default Address"));
        order.setStatus(OrderStatus.CONFIRMED);

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity
            int newStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Record inventory history
            InventoryHistory history = new InventoryHistory(
                    product,
                    -cartItem.getQuantity(),
                    newStock,
                    "ORDER_CHECKOUT"
            );
            inventoryHistoryRepository.save(history);

            // Use finalPrice if available, otherwise price
            BigDecimal effectivePrice = product.getFinalPrice() != null ? product.getFinalPrice() : product.getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            grossTotal = grossTotal.add(itemTotal);

            // Calculate Vendor Commission
            Vendor vendor = product.getVendor();
            BigDecimal commRate = (vendor != null && vendor.getCommissionRate() != null)
                    ? vendor.getCommissionRate()
                    : new BigDecimal("10.00");

            BigDecimal commAmount = itemTotal.multiply(commRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal vendorEarn = itemTotal.subtract(commAmount);

            OrderItem orderItem = new OrderItem(order, product, vendor, cartItem.getQuantity(), effectivePrice, commRate, commAmount, vendorEarn);
            orderItems.add(orderItem);
        }

        order.setGrossAmount(grossTotal);

        // Apply Coupon logic if requested
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            ApplyCouponResponse couponRes = couponService.validateAndCalculateDiscount(request.getCouponCode(), grossTotal, customerEmail);
            if (couponRes.isValid()) {
                discountAmount = couponRes.getDiscountAmount();
                order.setCouponCode(couponRes.getCode());
                order.setDiscountAmount(discountAmount);
            }
        }

        BigDecimal netTotal = grossTotal.subtract(discountAmount);
        if (netTotal.compareTo(BigDecimal.ZERO) < 0) netTotal = BigDecimal.ZERO;

        order.setTotalAmount(netTotal);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Record Coupon Usage if coupon was applied
        if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);

                CouponUsage usage = new CouponUsage(coupon, customer, savedOrder, order.getDiscountAmount());
                couponUsageRepository.save(usage);
            });
        }

        // Clear cart
        cartItemRepository.deleteByCustomerId(customer.getId());

        return new OrderDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrderHistory(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemDTO> getVendorSalesOrders(String vendorEmail) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        return orderItemRepository.findByVendorIdOrderByOrderCreatedAtDesc(vendor.getId()).stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        order.setStatus(status);
        return new OrderDTO(orderRepository.save(order));
    }
}
