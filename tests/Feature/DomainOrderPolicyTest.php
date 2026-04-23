<?php

use App\Models\Customer;
use App\Models\DomainOrder;
use App\Models\Order;
use App\Models\Tld;
use App\Models\User;
use App\Role;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => Role::ADMIN->value]);
    $this->staff = User::factory()->create(['role' => Role::STAFF->value]);
    $this->customer = User::factory()->create(['role' => Role::CUSTOMER->value]);
    $this->otherCustomer = User::factory()->create(['role' => Role::CUSTOMER->value]);
    
    // Create customer profiles
    Customer::factory()->create(['user_id' => $this->customer->id]);
    Customer::factory()->create(['user_id' => $this->otherCustomer->id]);
    
    // Create TLD
    $this->tld = Tld::factory()->create();
    
    // Create orders and domain orders
    $this->order = Order::factory()->create(['customer_id' => $this->customer->customer->id]);
    $this->otherOrder = Order::factory()->create(['customer_id' => $this->otherCustomer->customer->id]);
    
    $this->domainOrder = DomainOrder::factory()->create([
        'orderable_type' => Order::class,
        'orderable_id' => $this->order->id,
        'tld_id' => $this->tld->id,
    ]);
    
    $this->otherDomainOrder = DomainOrder::factory()->create([
        'orderable_type' => Order::class,
        'orderable_id' => $this->otherOrder->id,
        'tld_id' => $this->tld->id,
    ]);
});

test('admin can view any domain order', function () {
    expect($this->admin->can('view', $this->domainOrder))->toBeTrue();
    expect($this->admin->can('view', $this->otherDomainOrder))->toBeTrue();
});

test('staff can view any domain order', function () {
    expect($this->staff->can('view', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('view', $this->otherDomainOrder))->toBeTrue();
});

test('customer can view their own domain order', function () {
    expect($this->customer->can('view', $this->domainOrder))->toBeTrue();
});

test('customer cannot view other customer domain order', function () {
    expect($this->customer->can('view', $this->otherDomainOrder))->toBeFalse();
});

test('admin can view all domain orders', function () {
    expect($this->admin->can('viewAny', DomainOrder::class))->toBeTrue();
});

test('staff can view all domain orders', function () {
    expect($this->staff->can('viewAny', DomainOrder::class))->toBeTrue();
});

test('customer cannot view all domain orders', function () {
    expect($this->customer->can('viewAny', DomainOrder::class))->toBeFalse();
});

test('any authenticated user can create domain orders', function () {
    expect($this->admin->can('create', DomainOrder::class))->toBeTrue();
    expect($this->staff->can('create', DomainOrder::class))->toBeTrue();
    expect($this->customer->can('create', DomainOrder::class))->toBeTrue();
});

test('admin can update any domain order', function () {
    expect($this->admin->can('update', $this->domainOrder))->toBeTrue();
    expect($this->admin->can('update', $this->otherDomainOrder))->toBeTrue();
});

test('staff can update any domain order', function () {
    expect($this->staff->can('update', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('update', $this->otherDomainOrder))->toBeTrue();
});

test('customer can update their own pending domain order', function () {
    expect($this->customer->can('update', $this->domainOrder))->toBeTrue();
});

test('customer cannot update other customer domain order', function () {
    expect($this->customer->can('update', $this->otherDomainOrder))->toBeFalse();
});

test('customer cannot update completed domain order', function () {
    $completedDomainOrder = DomainOrder::factory()->create([
        'orderable_type' => Order::class,
        'orderable_id' => $this->order->id,
        'tld_id' => $this->tld->id,
        'status' => 'registered'
    ]);
    
    expect($this->customer->can('update', $completedDomainOrder))->toBeFalse();
});

test('admin can delete any domain order', function () {
    expect($this->admin->can('delete', $this->domainOrder))->toBeTrue();
    expect($this->admin->can('delete', $this->otherDomainOrder))->toBeTrue();
});

test('staff cannot delete domain orders', function () {
    expect($this->staff->can('delete', $this->domainOrder))->toBeFalse();
});

test('customer can delete their own pending domain order', function () {
    expect($this->customer->can('delete', $this->domainOrder))->toBeTrue();
});

test('customer cannot delete other customer domain order', function () {
    expect($this->customer->can('delete', $this->otherDomainOrder))->toBeFalse();
});

test('only admin can restore domain orders', function () {
    expect($this->admin->can('restore', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('restore', $this->domainOrder))->toBeFalse();
    expect($this->customer->can('restore', $this->domainOrder))->toBeFalse();
});

test('only admin can permanently delete domain orders', function () {
    expect($this->admin->can('forceDelete', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('forceDelete', $this->domainOrder))->toBeFalse();
    expect($this->customer->can('forceDelete', $this->domainOrder))->toBeFalse();
});

test('admin and staff can register domains', function () {
    expect($this->admin->can('register', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('register', $this->domainOrder))->toBeTrue();
    expect($this->customer->can('register', $this->domainOrder))->toBeFalse();
});

test('admin and staff can transfer domains', function () {
    expect($this->admin->can('transfer', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('transfer', $this->domainOrder))->toBeTrue();
    expect($this->customer->can('transfer', $this->domainOrder))->toBeFalse();
});

test('admin and staff can renew any domain', function () {
    expect($this->admin->can('renew', $this->domainOrder))->toBeTrue();
    expect($this->admin->can('renew', $this->otherDomainOrder))->toBeTrue();
    expect($this->staff->can('renew', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('renew', $this->otherDomainOrder))->toBeTrue();
});

test('customer can renew their own domain', function () {
    expect($this->customer->can('renew', $this->domainOrder))->toBeTrue();
});

test('customer cannot renew other customer domain', function () {
    expect($this->customer->can('renew', $this->otherDomainOrder))->toBeFalse();
});

test('admin and staff can manage DNS for any domain', function () {
    expect($this->admin->can('manageDns', $this->domainOrder))->toBeTrue();
    expect($this->admin->can('manageDns', $this->otherDomainOrder))->toBeTrue();
    expect($this->staff->can('manageDns', $this->domainOrder))->toBeTrue();
    expect($this->staff->can('manageDns', $this->otherDomainOrder))->toBeTrue();
});

test('customer can manage DNS for their own domain', function () {
    expect($this->customer->can('manageDns', $this->domainOrder))->toBeTrue();
});

test('customer cannot manage DNS for other customer domain', function () {
    expect($this->customer->can('manageDns', $this->otherDomainOrder))->toBeFalse();
});
