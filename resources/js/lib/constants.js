export const ORDER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_STEPS = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.APPROVED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED
];
