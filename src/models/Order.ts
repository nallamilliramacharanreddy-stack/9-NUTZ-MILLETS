import mongoose, { Schema, model, models } from 'mongoose';

export interface IDirectOrder {
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    altPhone?: string;
    address: string;
    pincode: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  payment: {
    method: 'phonepe' | 'cod';
    status: 'pending' | 'completed' | 'failed';
    surcharge: number;
    totalAmount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

const directOrderSchema = new Schema<IDirectOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      altPhone: { type: String },
      address: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      }
    ],
    payment: {
      method: { type: String, required: true, enum: ['phonepe', 'cod'] },
      status: { type: String, required: true, default: 'pending', enum: ['pending', 'completed', 'failed'] },
      surcharge: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
  },
  { timestamps: true }
);

const DirectOrder = models.DirectOrder || model<IDirectOrder>('DirectOrder', directOrderSchema);
export default DirectOrder;
