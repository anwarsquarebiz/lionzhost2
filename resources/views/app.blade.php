<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/images/logo-darkbg.png" sizes="any">
        <link rel="icon" href="/images/logo-darkbg.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/logo-darkbg.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- Payment Gateway Scripts --}}
        <script src="https://afs.gateway.mastercard.com/static/checkout/checkout.min.js" 
                data-error="afsErrorCallback" 
                data-cancel="afsCancelCallback"
                data-complete="afsCompleteCallback"></script>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        {{-- AFS Callbacks --}}
        <script>
            function afsErrorCallback(error) {
                console.error('AFS Payment Error:', error);
                alert('Payment error: ' + (error.explanation || 'An error occurred'));
            }
            
            function afsCancelCallback() {
                console.log('AFS Payment Cancelled');
                // User will stay on checkout page
            }
            
            function afsCompleteCallback(resultIndicator, sessionVersion) {
                console.log('AFS Payment Complete', { resultIndicator, sessionVersion });
                // Redirect to callback URL to verify payment
                const currentUrl = new URL(window.location.href);
                const orderId = currentUrl.searchParams.get('order_id');
                window.location.href = '/payment/afs/callback?resultIndicator=' + resultIndicator + '&orderId=' + orderId;
            }
        </script>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
