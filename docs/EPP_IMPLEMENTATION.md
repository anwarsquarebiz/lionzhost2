# EPP Implementation for CentralNic

This document outlines the EPP (Extensible Provisioning Protocol) implementation for CentralNic domain registrar integration.

## Architecture

### EPP Client Layer

**`app/Domain/Epp/Contracts/EppClient.php`**
- Interface defining EPP client operations
- Methods: connect, disconnect, hello, login, logout, request
- Transaction ID management

**`app/Domain/Epp/EppSocketClient.php`**
- Socket-based EPP client implementation
- RFC 5730 compliant
- TLS/SSL support with client certificate authentication
- Automatic greeting handling
- Transaction ID generation with custom prefixes

### EPP Command Builders

**`app/Domain/Epp/Commands/EppDomainCommands.php`**
- Domain operations: check, info, create, renew, transfer, update
- Nameserver management
- Auth code handling

**`app/Domain/Epp/Commands/EppContactCommands.php`**
- Contact operations: check, info, create, update, delete
- Postal information handling
- Multi-field address support

**`app/Domain/Epp/Commands/EppPollCommands.php`**
- Poll message request
- Poll message acknowledgement

### Provider Implementation

**`app/Domain/Registrars/Providers/CentralnicEppProvider.php`**
- Full EPP provider implementation
- Automatic session management (login/logout)
- Connection pooling and reuse
- Implements all RegistrarProvider interface methods

## Features Implemented

### Step 3.1 — EPP Client Strategy ✓
- Custom internal EPP client built on sockets + XML
- RFC 5730 compliant
- No GPL dependencies
- Full SSL/TLS support with client certificates
- Transaction ID tracking (clTRID/svTRID)

### Step 3.2 — CentralNicEppProvider ✓
**Domain Operations:**
- `checkAvailability()` - domain:check command
- `getDomainInfo()` - domain:info command
- `registerDomain()` - domain:create command
- `renew()` - domain:renew command
- `transferRequest()` - domain:transfer command
- `updateNameservers()` - domain:update command

**Contact Operations:**
- `createOrSyncContact()` - contact:create command
- Automatic contact ID generation
- Full postal info support

**Session Management:**
- Automatic login on first request
- Session reuse for multiple operations
- Automatic logout on destruction
- Hello command for connectivity testing

### Step 3.3 — EPP Poller & Backoff ✓
**`app/Jobs/EppPollMessagesJob.php`**
- Scheduled job for polling EPP messages
- Processes transfers, renewals, failures
- Stores messages in database for audit
- Automatic message acknowledgement
- Exponential backoff: 60s, 120s, 300s
- 3 retry attempts

**`app/Models/EppPollMessage.php`**
- Database model for EPP poll messages
- Tracking: provider, message_id, date, content
- Processed flag and timestamp
- Scopes for filtering

**Database Migration:**
- `epp_poll_messages` table
- Indexed for performance
- JSON storage for response data

## Configuration

### Required `.env` Variables

```env
# CentralNic EPP Configuration
CENTRALNIC_ENABLED=true
CENTRALNIC_MODE=test
CENTRALNIC_EPP_HOST=epp-ote.centralnic.com
CENTRALNIC_EPP_PORT=700
CENTRALNIC_EPP_USERNAME=your_username
CENTRALNIC_EPP_PASSWORD=your_password
CENTRALNIC_EPP_TIMEOUT=30
CENTRALNIC_EPP_SSL_ENABLED=true
CENTRALNIC_EPP_SSL_VERIFY_PEER=true
CENTRALNIC_EPP_SSL_VERIFY_PEER_NAME=true
CENTRALNIC_EPP_SSL_CLIENT_CERT=resources/client.pem
CENTRALNIC_EPP_SSL_CLIENT_KEY=resources/client.pem
```

### Certificate Setup

Place your CentralNic EPP client certificate at:
```
resources/client.pem
```

This file should contain both the certificate and private key.

## Usage Examples

### Check Domain Availability

```php
$provider = new CentralnicEppProvider();
$result = $provider->checkAvailability('example.com');

if ($result->isAvailable()) {
    echo "Domain is available!";
}
```

### Register Domain

```php
$provider = new CentralnicEppProvider();

// First create contacts
$registrant = $provider->createOrSyncContact($contact);
$admin = $provider->createOrSyncContact($adminContact);

// Create contact bundle
$contacts = new ProviderContactBundle(
    registrant: $registrant,
    admin: $admin,
    tech: $admin,
    billing: $admin
);

// Register domain
$domainRef = $provider->registerDomain($domainOrder, $contacts);
```

### Poll EPP Messages

```php
// Dispatch job manually
EppPollMessagesJob::dispatch('centralnic');

// Or schedule in app/Console/Kernel.php
$schedule->job(new EppPollMessagesJob('centralnic'))->hourly();
```

## EPP Protocol Details

### Connection Flow

1. Connect to EPP server via SSL/TLS on port 700
2. Read greeting message
3. Send login command with credentials
4. Perform operations (check, create, update, etc.)
5. Send logout command
6. Disconnect

### Transaction IDs

- Client Transaction ID (clTRID): Generated locally with format `LHOST-{timestamp}-{counter}`
- Server Transaction ID (svTRID): Returned by server
- Both tracked for audit purposes

### Response Codes

- 1000-1999: Success codes
- 2000-2999: Error codes
- Key codes:
  - 1000: Command completed successfully
  - 1301: Command completed successfully; ack to dequeue
  - 2002: Unknown command
  - 2201: Authorization error

## Testing

### OT&E Environment

CentralNic provides an OT&E (Operational Test & Evaluation) environment:
- Host: `epp-ote.centralnic.com`
- Port: 700
- Requires valid OT&E credentials

### Test Connectivity

```php
$provider = new CentralnicEppProvider();
$connected = $provider->testConnection(); // Sends hello command
```

## Security Considerations

- All communication over TLS 1.2+
- Client certificate authentication
- Credentials stored securely in database
- Support for encrypted credential storage
- Session management with automatic cleanup
- Timeout handling (30s default)

## Future Enhancements (Step 3.4)

### DNSSEC Support
- Add DS record management
- DNSKEY record handling
- Secure delegation

### Premium Domains
- Premium price extensions
- Special pricing tiers
- Premium domain flags

## Commit Messages

- ✓ `feat: EPP client wrapper interface`
- ✓ `feat: CentralNicEppProvider basic ops (check, contact:create, domain:create)`
- ✓ `feat: EPP poller job + storage`
- ⏳ `feat: EPP dnssec + premium extensions` (Step 3.4)

## Troubleshooting

### Connection Issues

1. Verify certificate file exists and is readable
2. Check EPP host and port configuration
3. Ensure firewall allows outbound connections on port 700
4. Verify credentials are correct for OT&E environment

### Authentication Failures

1. Check username and password in `.env`
2. Verify account is active in OT&E
3. Ensure certificate matches the account
4. Check for IP whitelist restrictions

### Poll Message Issues

1. Ensure job is scheduled or dispatched
2. Check queue worker is running: `php artisan queue:work`
3. Verify database connectivity
4. Check EPP provider availability

## References

- [RFC 5730 - EPP Protocol](https://tools.ietf.org/html/rfc5730)
- [RFC 5731 - EPP Domain Mapping](https://tools.ietf.org/html/rfc5731)
- [RFC 5732 - EPP Host Mapping](https://tools.ietf.org/html/rfc5732)
- [RFC 5733 - EPP Contact Mapping](https://tools.ietf.org/html/rfc5733)
- [CentralNic EPP Documentation](https://kb.centralnicreseller.com/)




