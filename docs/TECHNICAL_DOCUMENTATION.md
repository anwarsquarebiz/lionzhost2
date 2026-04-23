# LionzHost - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [API & Routes](#api--routes)
7. [Frontend Architecture](#frontend-architecture)
8. [Payment Integration](#payment-integration)
9. [Domain Management](#domain-management)
10. [Hosting Management](#hosting-management)
11. [Order Processing](#order-processing)
12. [Security](#security)
13. [Development Setup](#development-setup)
14. [Deployment](#deployment)
15. [Testing](#testing)

---

## Project Overview

**LionzHost** is a comprehensive domain registrar and web hosting platform built with Laravel and React. The platform enables customers to search, register, and manage domain names, as well as purchase and manage web hosting services including shared hosting, VPS, and dedicated servers.

### Key Features

- **Domain Registration & Management**: Search, register, renew, and manage domain names
- **Web Hosting Services**: Shared hosting, VPS, and dedicated server offerings
- **E-commerce Platform**: Shopping cart, checkout, and payment processing
- **Multi-Gateway Payments**: Support for AFS (Mastercard), Razorpay, and Stripe
- **EPP Integration**: Direct integration with domain registrars via EPP protocol
- **Admin Dashboard**: Comprehensive admin panel for managing TLDs, products, orders, and customers
- **Customer Portal**: Self-service portal for domain and hosting management
- **Audit Logging**: Complete audit trail for all system operations

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  React + TypeScript + Inertia.js + Tailwind CSS            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/Inertia Requests
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Laravel Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │   Services   │  │    Jobs      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │  Policies    │  │ Middleware   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│   Database   │ │   Queue    │ │  External  │
│   (SQLite/   │ │  (Jobs)    │ │   APIs    │
│   MySQL)     │ │            │ │           │
└──────────────┘ └────────────┘ └────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│   CentralNic │ │ ResellerClub│ │  Payment  │
│   (EPP)      │ │   (API)    │ │ Gateways  │
└──────────────┘ └────────────┘ └────────────┘
```

### Application Flow

1. **User Request** → Inertia.js handles routing
2. **Controller** → Processes request, validates data
3. **Service Layer** → Business logic execution
4. **Model** → Database operations
5. **Job Queue** → Async processing (domain registration, provisioning)
6. **Response** → Inertia response with React component

---

## Technology Stack

### Backend

- **Framework**: Laravel 12.x
- **PHP Version**: PHP 8.2+
- **Database**: SQLite (development) / MySQL (production)
- **Queue System**: Laravel Queue (database driver)
- **Authentication**: Laravel Fortify
- **API Integration**: 
  - EPP Protocol (RFC 5730) for domain registrars
  - REST APIs for ResellerClub
  - Payment gateway APIs (AFS, Razorpay, Stripe)

### Frontend

- **Framework**: React 19.x
- **Language**: TypeScript 5.7+
- **Routing**: Inertia.js 2.x + Laravel Wayfinder
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite 7.x
- **SSR Support**: Inertia SSR

### Development Tools

- **Testing**: Pest PHP
- **Code Quality**: Laravel Pint, ESLint, Prettier
- **Package Manager**: Composer (PHP), npm (Node.js)

---

## System Architecture

### Directory Structure

```
lionzhost-laravelv2/
├── app/
│   ├── Console/Commands/          # Artisan commands
│   ├── Domain/                    # Domain-related classes
│   │   ├── Epp/                   # EPP protocol implementation
│   │   ├── Registrars/            # Registrar providers
│   │   └── ResellerClub/          # ResellerClub integration
│   ├── Http/
│   │   ├── Controllers/           # Request handlers
│   │   │   ├── Admin/             # Admin controllers
│   │   │   ├── Customer/          # Customer portal controllers
│   │   │   └── ...                # Public controllers
│   │   ├── Middleware/            # HTTP middleware
│   │   └── Requests/              # Form request validation
│   ├── Jobs/                      # Queue jobs
│   ├── Models/                    # Eloquent models
│   ├── Policies/                  # Authorization policies
│   ├── Providers/                 # Service providers
│   └── Services/                  # Business logic services
├── config/                        # Configuration files
├── database/
│   ├── migrations/                # Database migrations
│   ├── factories/                 # Model factories
│   └── seeders/                   # Database seeders
├── docs/                          # Documentation
├── public/                        # Public assets
├── resources/
│   ├── js/                        # Frontend source
│   │   ├── actions/               # Inertia actions
│   │   ├── components/            # React components
│   │   ├── hooks/                 # React hooks
│   │   ├── layouts/               # Layout components
│   │   ├── pages/                 # Page components
│   │   ├── routes/                # Route definitions
│   │   └── types/                 # TypeScript types
│   └── views/                     # Blade templates
├── routes/                        # Route definitions
├── storage/                       # Storage directory
└── tests/                         # Test files
```

### Core Components

#### 1. Domain Management System

**EPP Client** (`app/Domain/Epp/`)
- Custom EPP client implementation (RFC 5730 compliant)
- Socket-based communication with TLS/SSL
- Client certificate authentication
- Transaction ID management

**Registrar Providers** (`app/Domain/Registrars/`)
- `CentralnicEppProvider`: EPP-based integration
- `ResellerClubProvider`: REST API integration
- Abstract `RegistrarProvider` interface

**Domain Operations**:
- Domain availability checking
- Domain registration
- Domain renewal
- Domain transfer
- Nameserver management
- Contact management
- Auth code retrieval

#### 2. Payment System

**Payment Gateways**:
- **AFS (Mastercard)**: Primary payment gateway, hosted checkout
- **Razorpay**: India-focused payments (UPI, wallets, net banking)
- **Stripe**: International payments (cards, Apple Pay, Google Pay)

**Payment Flow**:
1. Customer adds items to cart
2. Proceeds to checkout
3. Selects payment method
4. Payment initiated via gateway
5. Webhook processes payment
6. Order created and provisioned

#### 3. Order Management

**Order Types**:
- **Domain Orders**: Domain registration/renewal orders
- **Hosting Orders**: Shared hosting, VPS, dedicated server orders

**Order Lifecycle**:
```
Pending → Processing → Completed → Active
                              ↓
                         Cancelled/Suspended
```

#### 4. Queue System

**Background Jobs**:
- `ProvisionDomainOrderJob`: Registers domains via registrar
- `ProvisionHostingOrderJob`: Provisions hosting accounts
- `ProvisionOrderJob`: General order provisioning
- `EppPollMessagesJob`: Polls EPP messages from registrar
- `SyncResellerClubDomainsJob`: Syncs domains from ResellerClub
- `SyncResellerClubOrdersJob`: Syncs orders from ResellerClub

---

## Database Schema

### Core Tables

#### Users & Authentication
- **users**: User accounts (admin, staff, customer)
- **customers**: Customer profiles linked to users
- **contacts**: Domain contact information (registrant, admin, tech, billing)
- **contact_ids**: Contact IDs from registrars

#### Products & Pricing
- **tlds**: Top-level domains (e.g., .com, .net)
- **domain_prices**: Pricing for TLDs by years
- **products**: Hosting products (shared, VPS, dedicated)
- **plans**: Product plans/packages
- **features**: Product features

#### Shopping & Orders
- **carts**: Shopping carts (user or session-based)
- **cart_items**: Cart line items
- **orders**: Main order records
- **order_items**: Order line items
- **domain_orders**: Domain-specific orders
- **hosting_orders**: Hosting-specific orders

#### Payments
- **payments**: Payment records
  - `gateway`: Payment gateway used (afs, razorpay, stripe)
  - `status`: Payment status (pending, completed, failed)
  - `metadata`: Gateway-specific data

#### Domain Management
- **registry_accounts**: Registrar account configurations
- **epp_poll_messages**: EPP poll messages from registrars

#### Audit & Logging
- **audit_logs**: System audit trail
  - Polymorphic relationship to auditable models
  - PII masking for sensitive data
  - Request/response logging

### Key Relationships

```
User
  ├── Customer (1:1)
  │     ├── Orders (1:many)
  │     │     ├── OrderItems (1:many)
  │     │     ├── DomainOrders (polymorphic)
  │     │     └── HostingOrders (polymorphic)
  │     └── Payments (1:many)
  └── Cart (1:1)
        └── CartItems (1:many)

Order
  ├── Customer (belongsTo)
  ├── OrderItems (hasMany)
  ├── DomainOrders (morphMany)
  ├── HostingOrders (morphMany)
  └── Payment (hasOne)

DomainOrder
  ├── Order (morphTo)
  └── Tld (belongsTo)

HostingOrder
  ├── Order (morphTo)
  ├── Product (belongsTo)
  └── Customer (belongsTo)
```

---

## API & Routes

### Public Routes

```php
GET  /                          # Homepage
GET  /domains/results           # Domain search results
GET  /hosting                   # Shared hosting page
GET  /vps                       # VPS page
GET  /dedicated                 # Dedicated servers page
GET  /ssl                       # SSL certificates page
POST /domains/search            # Domain search API
POST /cart/add                  # Add to cart
GET  /cart                      # View cart
GET  /api/cart/count            # Get cart count
DELETE /cart/items/{id}         # Remove cart item
DELETE /cart/clear              # Clear cart
POST /cart/coupon                # Apply coupon
```

### Authenticated Routes

```php
GET  /dashboard                 # Dashboard (redirects based on role)
GET  /checkout                  # Checkout page
POST /payment/initiate          # Initiate payment
GET  /payment/success           # Payment success page
GET  /payment/afs/callback      # AFS payment callback
```

### Customer Portal Routes

```php
GET  /my/domains                # My domains list
GET  /my/domains/{id}           # Domain details
PUT  /my/domains/{id}/nameservers  # Update nameservers
PUT  /my/domains/{id}/privacy   # Toggle privacy protection
PUT  /my/domains/{id}/lock      # Lock domain
PUT  /my/domains/{id}/unlock    # Unlock domain
GET  /my/domains/{id}/epp       # Get EPP code
POST /my/domains/{id}/renew     # Renew domain
GET  /my/hosting                # My hosting list
GET  /my/hosting/{id}           # Hosting details
PUT  /my/hosting/{id}/auto-renewal  # Toggle auto-renewal
```

### Admin Routes

```php
# TLD Management
GET    /admin/tlds              # List TLDs
POST   /admin/tlds              # Create TLD
PUT    /admin/tlds/{id}         # Update TLD
DELETE /admin/tlds/{id}         # Delete TLD
POST   /admin/tlds/{id}/prices  # Add price
PUT    /admin/tlds/{id}/prices/{priceId}  # Update price
DELETE /admin/tlds/{id}/prices/{priceId}   # Delete price

# Products Management
GET    /admin/products          # List products
POST   /admin/products          # Create product
PUT    /admin/products/{id}     # Update product
DELETE /admin/products/{id}     # Delete product
POST   /admin/products/{id}/plans      # Add plan
PUT    /admin/products/{id}/plans/{planId}  # Update plan
DELETE /admin/products/{id}/plans/{planId}  # Delete plan

# Orders Management
GET    /admin/orders            # List orders
GET    /admin/orders/{id}       # Order details
PUT    /admin/orders/{id}/status  # Update order status

# Domain Orders
GET    /admin/domain-orders     # List domain orders
GET    /admin/domain-orders/{id}  # Domain order details
PUT    /admin/domain-orders/{id}  # Update domain order
PUT    /admin/domain-orders/{id}/status  # Update status
PUT    /admin/domain-orders/{id}/auto-renewal  # Toggle renewal

# Hosting Orders
GET    /admin/hosting-orders    # List hosting orders
GET    /admin/hosting-orders/{id}  # Hosting order details
PUT    /admin/hosting-orders/{id}/activate  # Activate hosting
PUT    /admin/hosting-orders/{id}/suspend   # Suspend hosting
PUT    /admin/hosting-orders/{id}/cancel    # Cancel hosting

# System Management
GET    /admin/registry-accounts # Registry accounts
GET    /admin/epp-poll          # EPP poll inbox
GET    /admin/audit-logs        # Audit logs
```

### Webhook Routes

```php
POST /webhooks/razorpay         # Razorpay webhook
POST /webhooks/stripe           # Stripe webhook
```

---

## Frontend Architecture

### Technology Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Inertia.js**: Server-driven routing
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Vite**: Build tool and dev server

### Project Structure

```
resources/js/
├── app.tsx                     # Application entry point
├── ssr.tsx                     # SSR entry point
├── routes/                     # Route definitions (Wayfinder)
├── pages/                      # Page components
│   ├── Checkout.tsx
│   ├── Cart.tsx
│   ├── DomainSearchResults.tsx
│   └── ...
├── components/                 # Reusable components
│   ├── ui/                     # UI primitives (buttons, inputs, etc.)
│   ├── app-sidebar.tsx
│   └── ...
├── layouts/                    # Layout components
│   ├── public-layout.tsx
│   ├── authenticated-layout.tsx
│   └── ...
├── hooks/                      # Custom React hooks
├── actions/                    # Inertia form actions
└── types/                      # TypeScript type definitions
```

### Key Frontend Features

#### 1. Shopping Cart
- Real-time cart count updates
- Session-based cart for guests
- User-based cart for authenticated users
- Cart persistence across sessions

#### 2. Checkout Flow
- Multi-step checkout process
- Billing information form
- Payment method selection
- Payment gateway integration (AFS, Razorpay, Stripe)
- Form validation
- Loading states

#### 3. Domain Search
- Public domain search interface
- Real-time availability checking
- Price display
- Add to cart functionality
- Search results pagination

#### 4. Customer Portal
- Domain management interface
- Nameserver configuration
- Privacy protection toggle
- Domain renewal
- Hosting management

### State Management

- **Inertia.js**: Server-side state via props
- **React Context**: Cart count, user authentication
- **Local State**: Component-level state with React hooks

### Routing

Routes are defined using Laravel Wayfinder:

```typescript
// resources/js/routes/*.ts
import { route } from '@/wayfinder';

export const home = () => route('home');
export const checkout = () => route('checkout');
```

---

## Payment Integration

### Supported Gateways

#### 1. AFS (Mastercard) - Primary Gateway

**Configuration**:
```env
AFS_BASE_URL=https://afs.gateway.mastercard.com/api/rest
AFS_MERCHANT_ID=your_merchant_id
AFS_API_PASSWORD=your_api_password
AFS_API_VERSION=100
CURRENCY=USD
```

**Features**:
- Hosted payment page (PCI-DSS compliant)
- Credit/Debit cards (Visa, Mastercard, Amex)
- 3D Secure support
- Session-based checkout

**Flow**:
1. Create checkout session via API
2. Configure Checkout.js with session ID
3. Show hosted payment page
4. Process payment callback
5. Verify payment result

#### 2. Razorpay

**Configuration**:
```env
RAZORPAY_KEY=your_key_id
RAZORPAY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Features**:
- Modal checkout
- Cards, UPI, Net Banking, Wallets
- Webhook processing

#### 3. Stripe

**Configuration**:
```env
STRIPE_KEY=your_publishable_key
STRIPE_SECRET=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

**Features**:
- Hosted checkout page
- Cards, Apple Pay, Google Pay
- Webhook processing

### Payment Processing Flow

```
1. Customer submits checkout form
   ↓
2. PaymentController::initiatePayment()
   ├─ Create Order
   ├─ Create Payment record
   └─ Initiate gateway payment
   ↓
3. Gateway returns payment data
   ↓
4. Frontend opens payment interface
   ↓
5. Customer completes payment
   ↓
6. Webhook received (or callback)
   ↓
7. PaymentWebhookController processes payment
   ├─ Verify payment signature
   ├─ Update payment status
   ├─ Update order status
   ├─ Clear cart
   └─ Dispatch provisioning jobs
   ↓
8. Redirect to success page
```

### Payment Service Classes

- `AFSPaymentService`: AFS gateway integration
- `PaymentController`: Payment initiation and callbacks
- `PaymentWebhookController`: Webhook processing

---

## Domain Management

### EPP Integration

**EPP Client** (`app/Domain/Epp/EppSocketClient.php`):
- RFC 5730 compliant
- TLS/SSL with client certificates
- Transaction ID management
- Automatic session management

**EPP Commands**:
- `EppDomainCommands`: Domain operations
- `EppContactCommands`: Contact operations
- `EppPollCommands`: Poll message handling

**Provider Implementation** (`CentralnicEppProvider`):
- Domain registration
- Domain renewal
- Domain transfer
- Nameserver updates
- Contact management
- Auth code retrieval

### Domain Operations

#### Domain Registration
```php
$provider->registerDomain([
    'domain' => 'example.com',
    'years' => 1,
    'nameservers' => ['ns1.example.com', 'ns2.example.com'],
    'contacts' => [
        'registrant' => $contactId,
        'admin' => $contactId,
        'tech' => $contactId,
        'billing' => $contactId,
    ],
]);
```

#### Domain Renewal
```php
$provider->renew([
    'domain' => 'example.com',
    'years' => 1,
]);
```

#### Nameserver Update
```php
$provider->updateNameservers([
    'domain' => 'example.com',
    'nameservers' => ['ns1.example.com', 'ns2.example.com'],
]);
```

### Domain Pricing

Pricing is determined by:
1. **Real-time from Provider**: Fetched during availability check
2. **Database Fallback**: Stored pricing in `domain_prices` table
3. **Mock Mode**: Development pricing when `use_mock = true`

### Domain Order Lifecycle

```
Cart Item → Order → Domain Order → Provisioning Job → Registered Domain
```

---

## Hosting Management

### Hosting Products

- **Shared Hosting**: Web hosting packages
- **VPS**: Virtual Private Servers
- **Dedicated Servers**: Dedicated server offerings

### Hosting Order Lifecycle

```
Pending → Processing → Active → Suspended/Cancelled
```

### Hosting Operations

- **Activation**: Provision hosting account
- **Suspension**: Suspend hosting account
- **Cancellation**: Cancel hosting account
- **Auto-Renewal**: Toggle automatic renewal

---

## Order Processing

### Order Creation Flow

```
1. Customer adds items to cart
   ↓
2. Customer proceeds to checkout
   ↓
3. Payment initiated
   ↓
4. Order created from cart items
   ├─ Order record
   ├─ OrderItems (line items)
   ├─ DomainOrders (for domains)
   └─ HostingOrders (for hosting)
   ↓
5. Payment completed
   ↓
6. Provisioning jobs dispatched
   ├─ ProvisionDomainOrderJob
   └─ ProvisionHostingOrderJob
   ↓
7. Order status updated to "processing"
   ↓
8. Services provisioned
   ↓
9. Order status updated to "completed"
```

### Provisioning Jobs

#### ProvisionDomainOrderJob
- Registers domain via registrar provider
- Creates contact records
- Sets nameservers
- Enables privacy protection (if selected)
- Updates domain order status

#### ProvisionHostingOrderJob
- Creates hosting account
- Configures hosting package
- Sets up domain
- Activates hosting
- Updates hosting order status

---

## Security

### Authentication & Authorization

- **Laravel Fortify**: Authentication system
- **Role-Based Access**: Admin, Staff, Customer roles
- **Policies**: Authorization policies for resources
- **Middleware**: Route protection

### Payment Security

- **PCI-DSS Compliance**: Hosted payment pages
- **Webhook Verification**: Signature verification
- **CSRF Protection**: Laravel CSRF tokens
- **SSL/TLS**: Encrypted connections

### Data Protection

- **PII Masking**: Sensitive data masked in audit logs
- **Encryption**: Sensitive data encrypted at rest
- **Input Validation**: Request validation
- **SQL Injection Prevention**: Eloquent ORM

### Audit Logging

- **Comprehensive Logging**: All operations logged
- **PII Masking**: Passwords, API keys masked
- **Request/Response Logging**: API calls logged
- **Transaction Tracking**: Transaction IDs tracked

---

## Development Setup

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (development) or MySQL (production)
- Git

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd lionzhost-laravelv2
```

2. **Install PHP Dependencies**
```bash
composer install
```

3. **Install Node Dependencies**
```bash
npm install
```

4. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure Environment Variables**
Edit `.env` file with:
- Database credentials
- Payment gateway credentials
- Registrar API credentials

6. **Run Migrations**
```bash
php artisan migrate
```

7. **Seed Database (Optional)**
```bash
php artisan db:seed
```

8. **Build Frontend Assets**
```bash
npm run build
# or for development
npm run dev
```

9. **Start Development Server**
```bash
# Using Laravel's dev script (includes queue worker)
composer dev

# Or separately:
php artisan serve
php artisan queue:listen
npm run dev
```

### Development Scripts

```bash
# Start all services (server, queue, vite)
composer dev

# Start with SSR
composer dev:ssr

# Run tests
composer test
# or
php artisan test

# Code formatting
./vendor/bin/pint
npm run format

# Type checking
npm run types
```

---

## Deployment

### Production Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure database (MySQL recommended)
- [ ] Set up queue worker (Supervisor recommended)
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up SSL certificate
- [ ] Configure payment gateway webhooks
- [ ] Set up backup system
- [ ] Configure logging
- [ ] Set up monitoring

### Environment Variables

**Required**:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=lionzhost
DB_USERNAME=username
DB_PASSWORD=password
```

**Payment Gateways**:
```env
AFS_MERCHANT_ID=your_merchant_id
AFS_API_PASSWORD=your_api_password
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret
STRIPE_KEY=your_key
STRIPE_SECRET=your_secret
```

**Registrar APIs**:
```env
CENTRALNIC_EPP_HOST=epp.example.com
CENTRALNIC_EPP_PORT=700
CENTRALNIC_CLIENT_CERT=/path/to/cert.pem
RESELLERCLUB_API_KEY=your_api_key
```

### Queue Worker Setup

**Supervisor Configuration** (`/etc/supervisor/conf.d/lionzhost-worker.conf`):
```ini
[program:lionzhost-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
stopwaitsecs=3600
```

### Web Server Configuration

**Nginx Example**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter DomainRegistrationTest

# Run with coverage
php artisan test --coverage
```

### Test Structure

```
tests/
├── Feature/              # Feature tests
│   ├── DomainRegistrationTest.php
│   ├── PaymentTest.php
│   └── ...
└── Unit/                # Unit tests
    └── ...
```

### Test Examples

**Domain Registration Test**:
```php
test('can register domain', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $response = $this->post('/domains/register', [
        'domain' => 'example.com',
        'years' => 1,
    ]);
    
    $response->assertStatus(200);
    $this->assertDatabaseHas('domain_orders', [
        'domain' => 'example',
        'status' => 'pending',
    ]);
});
```

---

## Additional Resources

### Documentation Files

- `docs/PAYMENT_SYSTEM_SUMMARY.md`: Payment system overview
- `docs/AFS_PAYMENT_INTEGRATION.md`: AFS gateway integration
- `docs/EPP_IMPLEMENTATION.md`: EPP protocol implementation
- `docs/ORDER_MANAGEMENT_IMPLEMENTATION.md`: Order management details
- `docs/PUBLIC_DOMAIN_SEARCH.md`: Public domain search feature
- `docs/REGISTRAR_CONFIG.md`: Registrar configuration guide

### External Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [EPP RFC 5730](https://tools.ietf.org/html/rfc5730)
- [AFS Gateway Documentation](https://afs.gateway.mastercard.com/api/documentation/)

---

## Support & Maintenance

### Logging

Logs are stored in `storage/logs/laravel.log`. Key events logged:
- Payment processing
- Domain operations
- Order provisioning
- API calls
- Errors and exceptions

### Monitoring

Recommended monitoring:
- Queue worker status
- Payment webhook delivery
- Domain registration success rate
- Order processing time
- API response times

### Backup Strategy

- Database backups (daily)
- Configuration backups
- Certificate backups
- Log retention (30 days)

---

## Version History

- **v2.0**: Complete rewrite with Laravel 12 + React + Inertia.js
- Multi-gateway payment integration
- EPP protocol implementation
- Admin and customer portals
- Comprehensive audit logging

---

**Last Updated**: 2024
**Maintained by**: LionzHost Development Team

