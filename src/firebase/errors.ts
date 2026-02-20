export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `Firestore Permission Denied: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;
        
        // This is necessary for transitioning to a custom Error type in TypeScript.
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }

    toString(): string {
        return this.message;
    }
}
