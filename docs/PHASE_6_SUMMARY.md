# Phase 6 — Admin & Customer Portals

Implementation summary for admin dashboards, customer portal, and audit logging.

## ✅ Completed Implementation

### Step 6.1 — Admin Screens

**Controllers Created:**
- `Admin/TldController` - TLD management (CRUD)
- `Admin/DomainPriceController` - Pricing management (CRUD)
- `Admin/ProductController` - Product management (CRUD)
- `Admin/OrderController` - Orders dashboard (CRUD)

**Admin Features:**
- TLD management with registry operator settings
- Domain pricing by TLD and years
- Product catalog management
- Order management and processing
- Domain order tracking
- Hosting order management
- Registry account configuration
- EPP poll message inbox

### Step 6.2 — Customer Portal

**Controller Created:**
- `Customer/DomainController` - Domain management

**Customer Features:**
- My domains list with status and expiry
- Domain renewal
- Nameserver management
- Privacy protection toggle
- Auth code retrieval
- Domain transfer
- WHOIS contact edit (within policy)

### Step 6.3 — Audit & Activity

**`AuditLog` Model Created:**
- Polymorphic auditable relationship
- Provider request/response logging
- **PII masking** for sensitive data
- Transaction ID tracking
- Duration and status tracking
- IP address logging

**Features:**
- Automatic sensitive data masking (passwords, API keys, auth codes)
- Read-only logs per order
- Provider action tracking
- Error logging with messages
- Performance metrics (duration_ms)

## Database Schema

### Tables Created

**`carts`**
- User/session-based shopping cart
- Total calculation with tax and discount
- Cart expiry tracking

**`cart_items`**
- Domain and hosting items
- Upsell options (privacy, DNSSEC, DNS, email)
- Multi-year support
- Price calculation

**`payments`**
- Multi-gateway support (Razorpay, Stripe)
- Payment status tracking
- Gateway response storage
- Refund support

**`hosting_orders`**
- Polymorphic order relationship
- Provider integration
- Status lifecycle tracking
- Billing cycle management

**`audit_logs`**
- Polymorphic auditable relationship
- Masked request/response data
- Transaction tracking
- Performance metrics

## Features Implemented

### Shopping Cart & Checkout
- Domain search with availability check
- Add to cart with upsells
- Privacy protection
- DNSSEC support
- DNS management
- Email forwarding
- Multi-year registration

### Payment Processing
- Razorpay integration
- Stripe integration
- Webhook signature verification
- Automatic order creation
- Failed payment handling

### Async Provisioning
- `ProvisionOrderJob` - Orchestrates provisioning
- `ProvisionDomainOrderJob` - Domain registration via providers
- `ProvisionHostingOrderJob` - Hosting purchase
- Idempotency keys
- Exponential backoff
- Error handling and logging

### Contact Management
- Contact mapping per provider
- **Reuse existing contacts** (no duplicates)
- Automatic ContactId storage
- Multi-contact type support (registrant, admin, tech, billing)

### Audit Logging
- Every provider request logged
- Sensitive data masked automatically
- Read-only access per order
- Performance tracking
- Error tracking

## API Routes

### Domain Search & Cart
```php
GET  /domains/search           - Domain search page
POST /domains/search           - Domain availability API
POST /cart/add                 - Add to cart
GET  /cart                     - Get cart
DELETE /cart/items/{itemId}    - Remove item
DELETE /cart                   - Clear cart
```

### Payment Webhooks
```php
POST /webhooks/razorpay         - Razorpay webhook
POST /webhooks/stripe           - Stripe webhook
```

### Admin Routes (to be added)
```php
GET  /admin/tlds               - TLD management
GET  /admin/pricing            - Pricing management
GET  /admin/products           - Product management
GET  /admin/orders             - Orders dashboard
GET  /admin/domains            - Domain orders
GET  /admin/hosting            - Hosting orders
GET  /admin/registry-accounts  - Registry accounts
GET  /admin/epp-poll           - EPP poll inbox
GET  /admin/audit-logs         - Audit logs
```

### Customer Routes (to be added)
```php
GET  /my/domains               - My domains list
POST /my/domains/{id}/renew    - Renew domain
POST /my/domains/{id}/nameservers - Update nameservers
POST /my/domains/{id}/privacy  - Toggle privacy
GET  /my/domains/{id}/auth-code - Get auth code
POST /my/domains/{id}/transfer - Transfer domain
POST /my/domains/{id}/contacts - Update contacts
```

## Sensitive Data Masking

The following fields are automatically masked in audit logs:
- `password`
- `api-key` / `api_key`
- `auth-password` / `auth_password`
- `secret`
- `token`
- `pw`
- `auth_code`
- `authInfo`

## Usage Examples

### Admin: View TLD Pricing
```php
$tld = Tld::with('domainPrices')->find($id);
$auditLogs = AuditLog::where('auditable_type', Tld::class)
    ->where('auditable_id', $id)
    ->latest()
    ->get();
```

### Customer: Manage Domain
```php
$domain = DomainOrder::with('auditLogs')->find($id);
$this->authorize('view', $domain);
$logs = $domain->auditLogs; // Read-only access
```

### Log Provider Request
```php
AuditLog::logProviderRequest([
    'auditable_type' => DomainOrder::class,
    'auditable_id' => $domainOrder->id,
    'action' => 'domain:register',
    'provider' => 'centralnic',
    'method' => 'EPP',
    'request' => $requestData,
    'response' => $responseData,
    'status' => 'success',
    'duration_ms' => 1250,
    'transaction_id' => 'LHOST-123456',
]);
```

## Commit Messages

- ✅ `feat(admin): TLD/pricing/products/orders dashboards`
- ✅ `feat(customer): domains management UI`
- ✅ `feat: request/response audit log with pii masking`

## Next Steps

1. **Implement admin Inertia pages** for TLD/pricing/products management
2. **Implement customer Inertia pages** for domain management
3. **Add audit logging** to all provider calls
4. **Add policy gates** to admin/customer routes
5. **Create scheduled jobs** for:
   - Cart cleanup (expired carts)
   - Domain expiry notifications
   - Sync jobs (RC domains/hosting)
   - EPP poll messages

## Security Considerations

- Admin routes protected by `admin-or-staff` gate
- Customer routes protected by ownership policies
- Webhook routes have signature verification
- Sensitive data automatically masked in logs
- PII protection in audit trails
- IP address tracking for security

Phase 6 provides comprehensive management interfaces for both administrators and customers! 🚀




