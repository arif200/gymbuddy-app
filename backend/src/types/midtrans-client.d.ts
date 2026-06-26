declare module 'midtrans-client' {
    interface SnapConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface CoreApiConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    }

    interface ItemDetail {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }

    interface Callbacks {
        finish?: string;
        error?: string;
        pending?: string;
    }

    interface SnapParameter {
        transaction_details: TransactionDetails;
        customer_details?: CustomerDetails;
        item_details?: ItemDetail[];
        callbacks?: Callbacks;
        [key: string]: unknown;
    }

    interface TransactionResult {
        token: string;
        redirect_url: string;
    }

    interface TransactionStatusResponse {
        order_id: string;
        transaction_status: string;
        fraud_status?: string;
        payment_type?: string;
        transaction_time?: string;
        [key: string]: unknown;
    }

    export class Snap {
        constructor(config: SnapConfig);
        createTransaction(parameter: SnapParameter): Promise<TransactionResult>;
        transaction: {
            status(orderId: string): Promise<TransactionStatusResponse>;
            notification(notificationBody: unknown): Promise<TransactionStatusResponse>;
        };
    }

    export class CoreApi {
        constructor(config: CoreApiConfig);
        transaction: {
            status(orderId: string): Promise<TransactionStatusResponse>;
            notification(notificationBody: unknown): Promise<TransactionStatusResponse>;
        };
    }
}
