# AFS (Mastercard) Payment Gateway Integration

## ✅ **Complete Integration with AFS Gateway**

The Mastercard AFS payment gateway is now fully integrated into your system as the **primary payment method**.

**Documentation:** [AFS Hosted Checkout Integration Guide](https://afs.gateway.mastercard.com/api/documentation/integrationGuidelines/hostedCheckout/integrationModelHostedCheckout.html?locale=en_US)

---

## 🔧 **Configuration**

### **Environment Variables**

Add these to your `.env` file:

```env
# AFS (Mastercard) Payment Gateway
AFS_BASE_URL=https://afs.gateway.mastercard.com/api/rest
AFS_MERCHANT_ID=your_merchant_id
AFS_API_PASSWORD=your_api_password
AFS_API_VERSION=100
CURRENCY=USD
```

### **Get Credentials:**
1. Register at Mastercard AFS Gateway
2. Obtain your Merchant ID
3. Generate API Password
4. Use test credentials for development

---

## 🏗️ **Implementation Details**

### **1. Backend Service** (`AFSPaymentService.php`)

**Methods:**
- `initiateCheckout()` - Creates checkout session
- `retrieveOrder()` - Fetches order details
- `verifyPaymentResult()` - Verifies payment completion
- `getCheckoutScriptUrl()` - Returns script URL
- `getMerchantId()` - Returns merchant ID

**Session Initiation:**
```php
POST https://afs.gateway.mastercard.com/api/rest/version/100/merchant/{merchant_id}/session

Authorization: Basic merchant.{merchant_id}:{api_password} (base64)

Body: {
    "apiOperation": "INITIATE_CHECKOUT",
    "interaction": {
        "operation": "AUTHORIZE",
        "returnUrl": "https://your-site.com/payment/afs/callback",
        "merchant": {
            "name": "LionzHost"
        }
    },
    "order": {
        "currency": "USD",
        "amount": "100.00",
        "id": "ORD-12345",
        "description": "Order #ORD-12345"
    }
}

Response: {
    "session": {
        "id": "SESSION123456..."
    },
    "successIndicator": "INDICATOR123..."
}
```

---

### **2. Payment Controller** (`PaymentController.php`)

**New Methods:**
- `initiateAFS()` - Initiates AFS payment
- `afsCallback()` - Handles payment callback

**Flow:**
```
Checkout Form Submit
  ↓
POST /payment/initiate (payment_method=afs)
  ↓
Create Order & Payment Record
  ↓
Call AFSPaymentService::initiateCheckout()
  ↓
Return session_id & success_indicator
  ↓
Frontend opens AFS Checkout modal
  ↓
User completes payment
  ↓
AFS redirects to callback URL
  ↓
Verify resultIndicator === successIndicator
  ↓
Mark payment as completed
  ↓
Clear cart & redirect to success page
```

---

### **3. Frontend Integration** (`Checkout.tsx`)

**AFS Payment Flow:**
```tsx
// 1. Initiate payment
const response = await fetch('/payment/initiate', {
    method: 'POST',
    body: JSON.stringify({
        payment_method: 'afs',
        billing_address: {...},
        terms_accepted: true
    })
});

const result = await response.json();

// 2. Configure AFS Checkout
window.Checkout.configure({
    session: {
        id: result.session_id
    }
});

// 3. Show payment page
window.Checkout.showPaymentPage();

// 4. Handle callbacks (defined in app.blade.php)
// - afsCompleteCallback: Payment complete
// - afsErrorCallback: Payment error
// - afsCancelCallback: Payment cancelled
```

---

## 💳 **Payment Methods Available**

### **1. AFS (Mastercard) - PRIMARY**
- ✅ Credit/Debit Cards
- ✅ Mastercard
- ✅ Visa
- ✅ American Express
- ✅ Hosted Payment Page
- ✅ PCI-DSS Compliant
- **Default selection** on checkout

### **2. Razorpay**
- For India-specific payments
- UPI, Wallets, Net Banking

### **3. Stripe**
- International payments
- Apple Pay, Google Pay

---

## 🔄 **Payment Flow Diagram**

```
User fills checkout form
  ↓
Selects "Mastercard (AFS Gateway)"
  ↓
Clicks "Pay $XX.XX"
  ↓
Backend creates:
  ├─ Order (with order_number)
  ├─ Payment record
  └─ AFS session via API
  ↓
AFS returns:
  ├─ session.id
  └─ successIndicator
  ↓
Frontend configures Checkout.js
  ↓
Checkout.showPaymentPage() opens
  ↓
User enters card details
  ↓
AFS processes payment
  ↓
Success → afsCompleteCallback(resultIndicator)
  ↓
Redirect to /payment/afs/callback
  ↓
Backend verifies:
  resultIndicator === successIndicator
  ↓
If match:
  ├─ Mark payment as completed
  ├─ Update order status
  ├─ Clear cart
  └─ Redirect to success page
  ↓
Order complete! ✅
```

---

## 📋 **Callback Handling**

### **JavaScript Callbacks** (in `app.blade.php`):

```javascript
// Error Handler
function afsErrorCallback(error) {
    console.error('AFS Payment Error:', error);
    alert('Payment error: ' + error.explanation);
}

// Cancel Handler
function afsCancelCallback() {
    console.log('AFS Payment Cancelled');
    // User stays on checkout page
}

// Complete Handler
function afsCompleteCallback(resultIndicator, sessionVersion) {
    // Redirect to verification
    window.location.href = '/payment/afs/callback' +
        '?resultIndicator=' + resultIndicator +
        '&orderId=' + orderId;
}
```

### **Backend Callback** (`PaymentController::afsCallback`):

```php
GET /payment/afs/callback?resultIndicator=XXX&orderId=ORD-XXX

1. Find order by order_number
2. Get payment record
3. Compare resultIndicator with stored successIndicator
4. If match:
   - Retrieve order from AFS API
   - Mark payment as completed
   - Update order status
   - Clear cart
   - Redirect to success page
5. If no match:
   - Mark as failed
   - Redirect to checkout with error
```

---

## 🎯 **User Experience**

### **Checkout Page:**

**Payment Method Selection:**
```
┌─────────────┬─────────────┬─────────────┐
│ Mastercard  │  Razorpay   │   Stripe    │
│ AFS Gateway │    India    │International│
│     ✓       │             │             │
└─────────────┴─────────────┴─────────────┘
```

**When AFS Selected:**
- User fills billing form
- Clicks "Pay $XX.XX"
- AFS Payment Page opens (hosted by Mastercard)
- User enters card details
- Payment processed securely
- Redirected back to site
- Success page shown

---

## 🔒 **Security Features**

### **AFS Gateway Security:**
- ✅ PCI-DSS Level 1 Compliant
- ✅ Hosted payment page (card details never touch your server)
- ✅ SSL/TLS encryption
- ✅ 3D Secure support
- ✅ Fraud detection
- ✅ Tokenization support

### **Integration Security:**
- ✅ Basic Auth with credentials
- ✅ Result indicator verification
- ✅ Success indicator matching
- ✅ CSRF token protection
- ✅ Secure session handling

---

## 📝 **Testing**

### **Test Mode:**

1. **Get Test Credentials:**
   - Contact Mastercard for test merchant account
   - Or use sandbox environment if available

2. **Test Cards:**
   ```
   Success: 5123 4567 8901 2346
   CVV: 100
   Expiry: Any future date
   
   Decline: 5111 1111 1111 1118
   CVV: 100
   Expiry: Any future date
   ```

3. **Test Flow:**
   - Add items to cart
   - Proceed to checkout
   - Fill billing info
   - Select "Mastercard (AFS Gateway)"
   - Click Pay
   - Use test card
   - Verify order creation

---

## 📊 **Database Tables**

### **Payment Record:**
```php
payments:
  - gateway_order_id: AFS session ID
  - gateway_payment_id: AFS transaction ID
  - payment_gateway: 'afs'
  - payment_method: 'afs'
  - status: 'pending' → 'completed'
  - metadata: {
      session_id: 'SESSION123...',
      success_indicator: 'INDICATOR123...',
      billing_address: {...}
  }
```

### **Order Record:**
```php
orders:
  - order_number: 'ORD-XXX'
  - status: 'pending' → 'processing'
  - payment_status: 'pending' → 'paid'
  - total_amount: 100.00
  - currency: 'USD'
```

---

## 🌐 **API Endpoints Used**

### **Initiate Checkout:**
```
POST /version/{version}/merchant/{merchant_id}/session
Authorization: Basic merchant.{id}:{password}
```

### **Retrieve Order:**
```
GET /version/{version}/merchant/{merchant_id}/order/{order_id}
Authorization: Basic merchant.{id}:{password}
```

---

## 🎨 **UI Components**

### **Payment Method Card:**
- **Icon:** Credit card icon
- **Title:** "Mastercard"
- **Subtitle:** "AFS Gateway"
- **Selection:** Blue border when selected
- **Default:** Pre-selected as primary method

---

## ✨ **Features**

### **Hosted Payment Page:**
- ✅ Mastercard-hosted secure page
- ✅ Supports all major cards
- ✅ Mobile responsive
- ✅ Multiple languages
- ✅ 3D Secure enabled

### **Payment Experience:**
1. Click "Pay" on checkout
2. AFS payment modal/page opens
3. Enter card details on Mastercard's secure page
4. Payment processed instantly
5. Return to your site
6. Order confirmation shown

---

## 📂 **Files Created/Modified**

**Backend:**
- ✅ `app/Services/AFSPaymentService.php` (new)
- ✅ `app/Http/Controllers/PaymentController.php` (AFS methods added)
- ✅ `config/services.php` (AFS config added)
- ✅ `routes/web.php` (AFS callback route)

**Frontend:**
- ✅ `resources/js/pages/Checkout.tsx` (AFS integration)
- ✅ `resources/views/app.blade.php` (AFS script & callbacks)

---

## 🚀 **How to Use**

### **For Customers:**
1. Add items to cart
2. Go to checkout
3. Fill billing information
4. **Payment method automatically set to Mastercard**
5. Click "Pay $XX.XX"
6. Complete payment on secure Mastercard page
7. Automatically redirected back
8. Order confirmed!

### **For You (Admin):**
1. Add credentials to `.env`
2. Test with test cards
3. Verify order creation
4. Check payment records
5. Monitor order processing
6. Ready for production!

---

## 🎯 **Advantages of AFS Gateway**

### **Why AFS as Primary:**
1. **Global Acceptance** - Mastercard worldwide network
2. **Highest Security** - PCI-DSS Level 1
3. **Hosted Solution** - No PCI compliance burden
4. **Reliable** - Mastercard infrastructure
5. **Multiple Cards** - Visa, Mastercard, Amex, etc.

### **vs Other Gateways:**
- **Razorpay**: Regional (India), multiple payment methods
- **Stripe**: Global, developer-friendly, lower fees
- **AFS**: Enterprise-grade, highest security, Mastercard backed

---

## 📞 **Support & Resources**

**AFS Documentation:**
- Integration Guide: https://afs.gateway.mastercard.com/api/documentation/
- API Reference: Check your merchant portal
- Support: Contact your AFS account manager

**Your Implementation:**
- Service Class: `app/Services/AFSPaymentService.php`
- Controller: `app/Http/Controllers/PaymentController.php`
- Frontend: `resources/js/pages/Checkout.tsx`

---

## ✅ **System Status**

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend Integration** | ✅ Complete | AFSPaymentService ready |
| **Session Creation** | ✅ Complete | API call implemented |
| **Payment Processing** | ✅ Complete | Checkout.js integrated |
| **Callback Handling** | ✅ Complete | Result verification |
| **Order Creation** | ✅ Complete | From cart items |
| **Payment Verification** | ✅ Complete | Indicator matching |
| **Success Page** | ✅ Complete | Confirmation shown |

---

## 🎉 **You're Ready to Accept Payments!**

**All 3 Payment Gateways Integrated:**
1. ✅ **AFS (Mastercard)** - Primary, default selection
2. ✅ **Razorpay** - India-focused payments
3. ✅ **Stripe** - International alternative

**Complete Order Flow:**
```
Browse → Add to Cart → Checkout → Pay with AFS → Order Created → Success! 🎉
```

---

**Your e-commerce system now supports professional payment processing with Mastercard's AFS Gateway!** 💳✨

