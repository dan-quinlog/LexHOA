const PaymentCard = ({ payment, onEdit }) => {
  return (
    <div className="payment-card">
      <h3>Payment Details</h3>
      <p><strong>Payment ID: {payment.id}</strong></p>
      <p>Owner ID: {payment.ownerPaymentsId}</p>
      <p>Check Date: {payment.checkDate}</p>
      <p>Check Number: {payment.checkNumber}</p>
      <p>Check Amount: ${payment.checkAmount}</p>
      <p>Invoice Number: {payment.invoiceNumber}</p>
      <p>Invoice Amount: ${payment.invoiceAmount}</p>
      <button onClick={() => onEdit(payment)}>Edit</button>
    </div>
  );
};

export default PaymentCard;
