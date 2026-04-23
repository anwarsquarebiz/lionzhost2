<?php

namespace App\Domain\Epp\Contracts;

interface EppClient
{
    /**
     * Connect to the EPP server.
     */
    public function connect(): void;

    /**
     * Disconnect from the EPP server.
     */
    public function disconnect(): void;

    /**
     * Send an EPP hello command.
     */
    public function hello(): array;

    /**
     * Login to the EPP server.
     */
    public function login(string $username, string $password, ?string $newPassword = null): array;

    /**
     * Logout from the EPP server.
     */
    public function logout(): array;

    /**
     * Send a raw EPP request.
     */
    public function request(string $xml): array;

    /**
     * Check if connected to the EPP server.
     */
    public function isConnected(): bool;

    /**
     * Get the last transaction ID.
     */
    public function getLastTransactionId(): ?string;

    /**
     * Set client transaction ID prefix.
     */
    public function setTransactionIdPrefix(string $prefix): void;

    /**
     * Generate a unique client transaction ID.
     */
    public function generateTransactionId(): string;
}








