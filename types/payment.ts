export interface PayUHashData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;

  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
}

export interface PayUVerifyData extends PayUHashData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  salt: string;
  hash: string;

  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
}

export interface PayUFormData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  service_provider: string;
}

export interface PayUResponse {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  hash: string;
  mihpayid?: string;
  mode?: string;
  bank_ref_num?: string;
  error_Message?: string;
  field9?: string;

  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
}

export interface PaymentInitiateRequest {
  courseId: string;
}

export interface PurchasedCourse {
  courseId: string;
  purchasedAt: string;
  paymentId: string;
  accessExpiryDate: string | null;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment: {
    transactionId: string;
    status: string;
    amount: number;
    course: any;
    paymentMode?: string;
    completedAt?: Date;
  };
}

export interface CourseAccessResponse {
  success: boolean;
  hasAccess: boolean;
  courseId: string;
}
