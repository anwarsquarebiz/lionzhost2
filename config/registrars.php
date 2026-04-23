<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Domain Registrar Providers Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for various domain registrar
    | providers including CentralNic (EPP) and ResellerClub (API).
    |
    */

    'centralnic' => [
        'enabled' => env('CENTRALNIC_ENABLED', true),
        'mode' => env('CENTRALNIC_MODE', 'test'), // test, live, mock
        'use_mock' => env('CENTRALNIC_USE_MOCK', false), // Use mock responses in development
        'epp' => [
            'host' => env('CENTRALNIC_EPP_HOST', 'epp.otande.net'),
            'port' => env('CENTRALNIC_EPP_PORT', 700),
            'username' => env('CENTRALNIC_EPP_USERNAME'),
            'password' => env('CENTRALNIC_EPP_PASSWORD'),
            'timeout' => env('CENTRALNIC_EPP_TIMEOUT', 30),
            'ssl' => [
                'enabled' => env('CENTRALNIC_EPP_SSL_ENABLED', true),
                'verify_peer' => env('CENTRALNIC_EPP_SSL_VERIFY_PEER', true),
                'verify_peer_name' => env('CENTRALNIC_EPP_SSL_VERIFY_PEER_NAME', true),
                'client_cert' => env('CENTRALNIC_EPP_SSL_CLIENT_CERT', resource_path('client.pem')),
                'client_key' => env('CENTRALNIC_EPP_SSL_CLIENT_KEY', resource_path('client.pem')),
                'ca_cert' => env('CENTRALNIC_EPP_SSL_CA_CERT'),
            ],
        ],
        'domains' => [
            'supported_tlds' => [
                '.com', '.net', '.org', '.info', '.biz', '.co', '.in', '.uk', '.de', '.fr'
            ],
            'default_nameservers' => [
                'ns1.centralnic.com',
                'ns2.centralnic.com',
            ],
        ],
    ],

    'resellerclub' => [
        'enabled' => env('RESELLERCLUB_ENABLED', true),
        'mode' => env('RESELLERCLUB_MODE', 'test'), // test, live, mock
        'use_mock' => env('RESELLERCLUB_USE_MOCK', false), // Use mock responses in development
        'api' => [
            'base_url' => env('RESELLERCLUB_API_BASE_URL', 'https://test.httpapi.com/api'),
            'auth_userid' => env('RESELLERCLUB_AUTH_USERID'),
            'api_key' => env('RESELLERCLUB_API_KEY'),
            'timeout' => env('RESELLERCLUB_API_TIMEOUT', 30),
            'ip_whitelist_note' => 'IP whitelisting required for production use',
        ],
        'domains' => [
            'supported_tlds' => [
                '.com', '.net', '.org', '.info', '.biz', '.co', '.in', '.uk', '.de', '.fr'
            ],
            'default_nameservers' => [
                'ns1.resellerclub.com',
                'ns2.resellerclub.com',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Configuration
    |--------------------------------------------------------------------------
    |
    | Default settings that apply to all providers unless overridden.
    |
    */

    'defaults' => [
        'timeout' => 30,
        'retry_attempts' => 3,
        'retry_delay' => 1, // seconds
        'log_requests' => env('REGISTRAR_LOG_REQUESTS', true),
        'log_responses' => env('REGISTRAR_LOG_RESPONSES', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider Selection
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic provider selection based on TLD.
    |
    */

    'provider_selection' => [
        'tld_mappings' => [
            'centralnic' => ['.com', '.net', '.org', '.info', '.biz'],
            'resellerclub' => ['.in', '.co', '.uk', '.de', '.fr'],
        ],
        'fallback_provider' => 'centralnic',
        'prefer_centralnic' => env('REGISTRAR_PREFER_CENTRALNIC', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Security settings for registrar operations.
    |
    */

    'security' => [
        'encrypt_credentials' => env('REGISTRAR_ENCRYPT_CREDENTIALS', true),
        'rate_limiting' => [
            'enabled' => env('REGISTRAR_RATE_LIMITING', true),
            'max_requests_per_minute' => env('REGISTRAR_MAX_REQUESTS_PER_MINUTE', 60),
        ],
        'ip_whitelist' => [
            'enabled' => env('REGISTRAR_IP_WHITELIST_ENABLED', false),
            'allowed_ips' => explode(',', env('REGISTRAR_ALLOWED_IPS', '')),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitoring & Logging
    |--------------------------------------------------------------------------
    |
    | Configuration for monitoring registrar operations.
    |
    */

    'monitoring' => [
        'log_level' => env('REGISTRAR_LOG_LEVEL', 'info'),
        'log_channel' => env('REGISTRAR_LOG_CHANNEL', 'stack'),
        'metrics_enabled' => env('REGISTRAR_METRICS_ENABLED', true),
        'health_check_interval' => env('REGISTRAR_HEALTH_CHECK_INTERVAL', 300), // seconds
    ],
];
