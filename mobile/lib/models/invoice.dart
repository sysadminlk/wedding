class PaymentInvoice {
  final String id;
  final String tenantId;
  final String plan;
  final double amount;
  final String currency;
  final String gateway;
  final String status;
  final DateTime? paidAt;

  const PaymentInvoice({
    required this.id,
    required this.tenantId,
    required this.plan,
    required this.amount,
    required this.currency,
    required this.gateway,
    required this.status,
    this.paidAt,
  });

  factory PaymentInvoice.fromJson(Map<String, dynamic> json) {
    return PaymentInvoice(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      plan: json['plan'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      gateway: json['gateway'] as String,
      status: json['status'] as String,
      paidAt: json['paidAt'] != null
          ? DateTime.parse(json['paidAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'plan': plan,
      'amount': amount,
      'currency': currency,
      'gateway': gateway,
      'status': status,
      'paidAt': paidAt?.toIso8601String(),
    };
  }

  static List<PaymentInvoice> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => PaymentInvoice.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
