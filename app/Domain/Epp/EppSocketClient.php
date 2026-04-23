<?php

namespace App\Domain\Epp;

use App\Domain\Epp\Contracts\EppClient;
use Illuminate\Support\Facades\Log;

class EppSocketClient implements EppClient
{
    private $socket = null;
    private bool $connected = false;
    private ?string $lastTransactionId = null;
    private string $transactionIdPrefix = 'LHOST';
    private int $transactionCounter = 0;

    public function __construct(
        private string $host,
        private int $port,
        private int $timeout = 30,
        private array $sslOptions = []
    ) {}

    public function connect(): void
    {
        if ($this->connected) {
            return;
        }

        $context = stream_context_create([
            'ssl' => array_merge([
                'verify_peer' => true,
                'verify_peer_name' => true,
                'allow_self_signed' => false,
            ], $this->sslOptions)
        ]);

        $uri = "ssl://{$this->host}:{$this->port}";
        
        Log::info('Connecting to EPP server', ['uri' => $uri]);

        $this->socket = @stream_socket_client(
            $uri,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$this->socket) {
            throw new \RuntimeException("Failed to connect to EPP server: {$errstr} ({$errno})");
        }

        stream_set_timeout($this->socket, $this->timeout);
        
        // Read greeting
        $greeting = $this->read();
        
        $this->connected = true;
        
        Log::info('Connected to EPP server', ['greeting_length' => strlen($greeting)]);
    }

    public function disconnect(): void
    {
        if ($this->socket) {
            @fclose($this->socket);
            $this->socket = null;
            $this->connected = false;
            
            Log::info('Disconnected from EPP server');
        }
    }

    public function hello(): array
    {
        $xml = $this->buildHelloXml();
        return $this->request($xml);
    }

    public function login(string $username, string $password, ?string $newPassword = null): array
    {
        $clTRID = $this->generateTransactionId();
        $xml = $this->buildLoginXml($username, $password, $newPassword, $clTRID);
        return $this->request($xml);
    }

    public function logout(): array
    {
        $clTRID = $this->generateTransactionId();
        $xml = $this->buildLogoutXml($clTRID);
        return $this->request($xml);
    }

    public function request(string $xml): array
    {
        if (!$this->connected) {
            $this->connect();
        }

        $this->write($xml);
        $response = $this->read();
        
        return $this->parseResponse($response);
    }

    public function isConnected(): bool
    {
        return $this->connected && $this->socket !== null;
    }

    public function getLastTransactionId(): ?string
    {
        return $this->lastTransactionId;
    }

    public function setTransactionIdPrefix(string $prefix): void
    {
        $this->transactionIdPrefix = $prefix;
    }

    public function generateTransactionId(): string
    {
        $this->transactionCounter++;
        $timestamp = microtime(true);
        $this->lastTransactionId = sprintf(
            '%s-%d-%d',
            $this->transactionIdPrefix,
            (int)$timestamp,
            $this->transactionCounter
        );
        return $this->lastTransactionId;
    }

    private function write(string $xml): void
    {
        $length = strlen($xml) + 4;
        $header = pack('N', $length);
        $data = $header . $xml;

        $written = @fwrite($this->socket, $data);
        
        if ($written === false || $written !== strlen($data)) {
            throw new \RuntimeException('Failed to write to EPP server');
        }

        Log::debug('EPP Request', ['xml' => $xml]);
    }

    private function read(): string
    {
        // Read the 4-byte length header
        $header = @fread($this->socket, 4);
        
        if ($header === false || strlen($header) !== 4) {
            throw new \RuntimeException('Failed to read EPP response header');
        }

        $unpacked = unpack('N', $header);
        $length = $unpacked[1] - 4;

        // Read the actual response
        $response = '';
        $remaining = $length;

        while ($remaining > 0 && !feof($this->socket)) {
            $chunk = @fread($this->socket, $remaining);
            
            if ($chunk === false) {
                throw new \RuntimeException('Failed to read EPP response body');
            }

            $response .= $chunk;
            $remaining -= strlen($chunk);
        }

        Log::debug('EPP Response', ['xml' => $response]);

        return $response;
    }

    private function parseResponse(string $xml): array
    {
        $dom = new \DOMDocument();
        
        if (!@$dom->loadXML($xml)) {
            throw new \RuntimeException('Failed to parse EPP response XML');
        }

        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('epp', 'urn:ietf:params:xml:ns:epp-1.0');

        // Extract result code
        $resultNode = $xpath->query('//epp:result')->item(0);
        $resultCode = $resultNode ? $resultNode->getAttribute('code') : null;

        // Extract result message
        $msgNode = $xpath->query('//epp:result/epp:msg')->item(0);
        $resultMsg = $msgNode ? $msgNode->textContent : null;

        // Extract server transaction ID
        $svTRIDNode = $xpath->query('//epp:trID/epp:svTRID')->item(0);
        $svTRID = $svTRIDNode ? $svTRIDNode->textContent : null;

        // Extract client transaction ID
        $clTRIDNode = $xpath->query('//epp:trID/epp:clTRID')->item(0);
        $clTRID = $clTRIDNode ? $clTRIDNode->textContent : null;

        return [
            'success' => $resultCode && $resultCode >= 1000 && $resultCode < 2000,
            'code' => (int)$resultCode,
            'message' => $resultMsg,
            'svTRID' => $svTRID,
            'clTRID' => $clTRID,
            'xml' => $xml,
            'dom' => $dom,
        ];
    }

    private function buildHelloXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <hello/>' . "\n" .
               '</epp>';
    }

    private function buildLoginXml(string $username, string $password, ?string $newPassword, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <login>' . "\n" .
               '      <clID>' . htmlspecialchars($username) . '</clID>' . "\n" .
               '      <pw>' . htmlspecialchars($password) . '</pw>' . "\n";

        if ($newPassword) {
            $xml .= '      <newPW>' . htmlspecialchars($newPassword) . '</newPW>' . "\n";
        }

        $xml .= '      <options>' . "\n" .
                '        <version>1.0</version>' . "\n" .
                '        <lang>en</lang>' . "\n" .
                '      </options>' . "\n" .
                '      <svcs>' . "\n" .
                '        <objURI>urn:ietf:params:xml:ns:domain-1.0</objURI>' . "\n" .
                '        <objURI>urn:ietf:params:xml:ns:contact-1.0</objURI>' . "\n" .
                '        <objURI>urn:ietf:params:xml:ns:host-1.0</objURI>' . "\n" .
                '      </svcs>' . "\n" .
                '    </login>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    private function buildLogoutXml(string $clTRID): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <logout/>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';
    }

    public function __destruct()
    {
        $this->disconnect();
    }
}








