'use client';

import { useUser } from '@/contexts/UserContext';
import { Package, Calendar, DollarSign, Eye } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useUser();

  // Extract orders from the GraphQL edges structure
  const orders = user?.orders?.edges?.map(edge => edge.node) || [];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-montserrat-bold text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm font-montserrat-regular text-gray-700">
            Start shopping to see your orders here.
          </p>
          <div className="mt-6">
            <a
              href="/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h3 className="text-lg leading-6 font-awaken text-gray-900">Order History</h3>
          <p className="mt-1 text-sm font-montserrat-regular text-gray-700">
            View and track your past orders.
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-400 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-montserrat-bold text-gray-900">
                    {order.name}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat-bold ${getStatusColor(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-montserrat-regular text-gray-700">
                    Ordered: {new Date(order.processedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-montserrat-regular text-gray-700">
                    Total: EGP {order.totalPrice?.amount || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-montserrat-regular text-gray-700">
                    {order.lineItems?.edges?.length || 0} item{(order.lineItems?.edges?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-400 pt-4">
                <h4 className="text-sm font-awaken text-gray-900 mb-3">Items</h4>
                <div className="space-y-2">
                  {order.lineItems?.edges?.map((edge, index) => {
                    const item = edge.node;
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900 font-montserrat-regular">{item.title}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-700 font-montserrat-regular">Qty: {item.quantity}</span>
                          <span className="text-gray-900 font-montserrat-bold">
                            {item.variant?.price?.amount ? `EGP ${item.variant.price.amount}` : 
                             item.price?.amount ? `EGP ${item.price.amount}` :
                             item.originalUnitPrice?.amount ? `EGP ${item.originalUnitPrice.amount}` :
                             <span className="text-gray-500 italic">Variant deleted</span>}
                          </span>
                        </div>
                      </div>
                    );
                  }) || []}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
