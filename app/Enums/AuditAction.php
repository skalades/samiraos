<?php

namespace App\Enums;

enum AuditAction: string
{
    // Orders
    case CreateOrder = 'CREATE_ORDER';
    case ApproveOrder = 'APPROVE_ORDER';
    case RejectOrder = 'REJECT_ORDER';
    case ShipOrder = 'SHIP_ORDER';
    case CompleteOrder = 'COMPLETE_ORDER';
    case CancelOrder = 'CANCEL_ORDER';

    // Products
    case CreateProduct = 'CREATE_PRODUCT';
    case UpdateProduct = 'UPDATE_PRODUCT';
    case DeleteProduct = 'DELETE_PRODUCT';

    // Receivables & Payments
    case CreateReceivable = 'CREATE_RECEIVABLE';
    case SubmitPayment = 'SUBMIT_PAYMENT';
    case ApprovePayment = 'APPROVE_PAYMENT';
    case RejectPayment = 'REJECT_PAYMENT';
    case OverduePayment = 'OVERDUE_PAYMENT';
    case MarkAsOverdue = 'MARK_AS_OVERDUE';

    // Inventory
    case AllocateStock = 'ALLOCATE_STOCK';
    case FulfillStock = 'FULFILL_STOCK';
    case RevertStock = 'REVERT_STOCK';
    case ReturnStock = 'RETURN_STOCK';
    case AddStock = 'ADD_STOCK';
    case DeductStock = 'DEDUCT_STOCK';
    
    // Stock Opname
    case StockOpname = 'STOCK_OPNAME';

    // Bank Accounts
    case CreateBankAccount = 'CREATE_BANK_ACCOUNT';
    case UpdateBankAccount = 'UPDATE_BANK_ACCOUNT';
    case DeleteBankAccount = 'DELETE_BANK_ACCOUNT';

    // Announcements
    case CreateAnnouncement = 'CREATE_ANNOUNCEMENT';
    case UpdateAnnouncement = 'UPDATE_ANNOUNCEMENT';
    case DeleteAnnouncement = 'DELETE_ANNOUNCEMENT';

    // Territories
    case CreateTerritory = 'CREATE_TERRITORY';
    case UpdateTerritory = 'UPDATE_TERRITORY';
    case DeleteTerritory = 'DELETE_TERRITORY';
}
