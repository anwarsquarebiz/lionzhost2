<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's role as enum.
     */
    public function getRole(): Role
    {
        return Role::from($this->role ?? 'customer');
    }

    /**
     * Get the user's role as string.
     */
    public function getRoleString(): string
    {
        return $this->role ?? 'customer';
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->getRole() === Role::ADMIN;
    }

    /**
     * Check if user is staff.
     */
    public function isStaff(): bool
    {
        return $this->getRole() === Role::STAFF;
    }

    /**
     * Check if user is customer.
     */
    public function isCustomer(): bool
    {
        return $this->getRole() === Role::CUSTOMER;
    }

    /**
     * Check if user is admin or staff.
     */
    public function isAdminOrStaff(): bool
    {
        return $this->getRole()->isAdminOrStaff();
    }

    /**
     * Get the customer profile for the user.
     */
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }
}
