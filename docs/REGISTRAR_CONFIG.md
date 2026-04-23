# Registrar Provider Configuration

This document outlines the environment variables and configuration needed for the registrar provider system.

## Environment Variables

Add the following variables to your `.env` file:

### CentralNic EPP Configuration

```env
# CentralNic EPP Configuration
# CentralNic uses EPP (Extensible Provisioning Protocol) over TLS port 700
# OT&E (Operational Test & Evaluation) environment for testing
# Note: CentralNic does NOT have a REST API, only EPP protocol
CENTRALNIC_ENABLED=true
CENTRALNIC_MODE=test
CENTRALNIC_EPP_HOST=epp.otande.net
CENTRALNIC_EPP_PORT=700
CENTRALNIC_EPP_USERNAME=your_username
CENTRALNIC_EPP_PASSWORD=your_password
CENTRALNIC_EPP_TIMEOUT=30
CENTRALNIC_EPP_SSL_ENABLED=true
CENTRALNIC_EPP_SSL_VERIFY_PEER=true
CENTRALNIC_EPP_SSL_VERIFY_PEER_NAME=true
CENTRALNIC_EPP_SSL_CLIENT_CERT=resources/client.pem
CENTRALNIC_EPP_SSL_CLIENT_KEY=resources/client.pem
CENTRALNIC_EPP_SSL_CA_CERT=
```

### ResellerClub API Configuration

```env
# ResellerClub API Configuration
# ResellerClub requires IP whitelisting for production use
# Sandbox: https://test.httpapi.com/api
# Live: https://httpapi.com/api
RESELLERCLUB_ENABLED=true
RESELLERCLUB_MODE=test
RESELLERCLUB_API_BASE_URL=https://test.httpapi.com/api
RESELLERCLUB_AUTH_USERID=your_userid
RESELLERCLUB_API_KEY=your_api_key
RESELLERCLUB_API_TIMEOUT=30
```

### General Registrar Configuration

```env
# Registrar General Configuration
REGISTRAR_LOG_REQUESTS=true
REGISTRAR_LOG_RESPONSES=false
REGISTRAR_PREFER_CENTRALNIC=true
REGISTRAR_ENCRYPT_CREDENTIALS=true
REGISTRAR_RATE_LIMITING=true
REGISTRAR_MAX_REQUESTS_PER_MINUTE=60
REGISTRAR_IP_WHITELIST_ENABLED=false
REGISTRAR_ALLOWED_IPS=
REGISTRAR_LOG_LEVEL=info
REGISTRAR_LOG_CHANNEL=stack
REGISTRAR_METRICS_ENABLED=true
REGISTRAR_HEALTH_CHECK_INTERVAL=300
```

## Configuration Notes

### CentralNic EPP
- Uses EPP protocol over TLS port 700
- Requires SSL client certificates for authentication
- OT&E environment available for testing
- Supports both EPP and REST API interfaces

### ResellerClub
- Uses HTTP API with form-based authentication
- Requires IP whitelisting for production
- Has separate sandbox and live environments
- Uses auth_userid and api_key for authentication

### Security Considerations
- Store sensitive credentials securely
- Use environment variables for all secrets
- Enable SSL/TLS for all connections
- Implement IP whitelisting where required
- Use encrypted storage for credentials

## Payment Gateway Configuration

Add these variables to your `.env` file for payment processing:

### Razorpay Configuration

```env
RAZORPAY_KEY=rzp_test_your_key_here
RAZORPAY_SECRET=your_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Stripe Configuration

```env
STRIPE_KEY=pk_test_your_key_here
STRIPE_SECRET=sk_test_your_secret_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Configuration Files

The main configurations are stored in:

### `config/registrars.php`
- Provider-specific settings
- TLD mappings
- Security configurations
- Monitoring and logging settings
- Default values and fallbacks

### `config/services.php`
- Payment gateway credentials
- Third-party service integrations
