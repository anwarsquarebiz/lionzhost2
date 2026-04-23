<?php

namespace App;

enum Role: string
{
    case ADMIN = 'admin';
    case STAFF = 'staff';
    case CUSTOMER = 'customer';

    /**
     * Get all role values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Check if the role has admin privileges.
     */
    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    /**
     * Check if the role has staff privileges.
     */
    public function isStaff(): bool
    {
        return $this === self::STAFF;
    }

    /**
     * Check if the role has customer privileges.
     */
    public function isCustomer(): bool
    {
        return $this === self::CUSTOMER;
    }

    /**
     * Check if the role has admin or staff privileges.
     */
    public function isAdminOrStaff(): bool
    {
        return $this->isAdmin() || $this->isStaff();
    }

    /**
     * Get the display name for the role.
     */
    public function getDisplayName(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::STAFF => 'Staff',
            self::CUSTOMER => 'Customer',
        };
    }
}
