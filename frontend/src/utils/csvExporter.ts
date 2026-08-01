import { Order } from "@/types";
import { isUserObject } from "@/features/order/orderSlice";

export function exportOrdersToCSV(orders: Order[]) {
  if (!orders || orders.length === 0) return;

  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Date",
    "Item Count",
    "Items Price (INR)",
    "Tax Price (INR)",
    "Shipping Price (INR)",
    "Total Price (INR)",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Courier Partner",
    "Tracking Number"
  ];

  const escapeCSV = (field: any) => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((order) => {
    const customerName = isUserObject(order.user)
      ? order.user.name
      : order.guestName || (order.guestEmail ? "Guest Customer" : String(order.user || "Customer"));

    const customerEmail = isUserObject(order.user)
      ? order.user.email
      : order.guestEmail || "N/A";

    const itemCount = order.orderItems ? order.orderItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";

    return [
      escapeCSV(order._id),
      escapeCSV(customerName),
      escapeCSV(customerEmail),
      escapeCSV(formattedDate),
      escapeCSV(itemCount),
      escapeCSV(order.itemsPrice || 0),
      escapeCSV(order.taxPrice || 0),
      escapeCSV(order.shippingPrice || 0),
      escapeCSV(order.totalPrice || 0),
      escapeCSV("Stripe Terminal"),
      escapeCSV(order.paymentInfo?.status === "succeeded" ? "PAID" : "UNPAID"),
      escapeCSV(order.orderStatus),
      escapeCSV(order.trackingInfo?.courierName || "Standard Local"),
      escapeCSV(order.trackingInfo?.trackingNumber || "N/A")
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Sales_Ledger_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
