export interface EmailTemplate {
  type: "email";
  data: {
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
    readReceipt?: string;
    deliveryReceipt?: string;
  };
}
