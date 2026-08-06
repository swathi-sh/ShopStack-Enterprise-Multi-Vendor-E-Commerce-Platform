package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.OrderItemDTO;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            CartItemRepository cartItemRepository,
                            CustomerRepository customerRepository,
                            VendorRepository vendorRepository,
                            ProductRepository productRepository,
                            InventoryHistoryRepository inventoryHistoryRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
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

        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress() != null && !request.getShippingAddress().isBlank()
                ? request.getShippingAddress()
                : (customer.getAddress() != null ? customer.getAddress() : "Default Address"));
        order.setStatus(OrderStatus.PROCESSING);

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

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = new OrderItem(order, product, product.getVendor(), cartItem.getQuantity(), product.getPrice());
            orderItems.add(orderItem);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

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
