<?php

use App\Models\Customer;
use App\Models\Order;
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
    
    $this->order = Order::factory()->create(['customer_id' => $this->customer->customer->id]);
    $this->otherOrder = Order::factory()->create(['customer_id' => $this->otherCustomer->customer->id]);
});

test('admin can view any order', function () {
    expect($this->admin->can('view', $this->order))->toBeTrue();
    expect($this->admin->can('view', $this->otherOrder))->toBeTrue();
});

test('staff can view any order', function () {
    expect($this->staff->can('view', $this->order))->toBeTrue();
    expect($this->staff->can('view', $this->otherOrder))->toBeTrue();
});

test('customer can view their own order', function () {
    expect($this->customer->can('view', $this->order))->toBeTrue();
});

test('customer cannot view other customer order', function () {
    expect($this->customer->can('view', $this->otherOrder))->toBeFalse();
});

test('admin can view all orders', function () {
    expect($this->admin->can('viewAny', Order::class))->toBeTrue();
});

test('staff can view all orders', function () {
    expect($this->staff->can('viewAny', Order::class))->toBeTrue();
});

test('customer cannot view all orders', function () {
    expect($this->customer->can('viewAny', Order::class))->toBeFalse();
});

test('any authenticated user can create orders', function () {
    expect($this->admin->can('create', Order::class))->toBeTrue();
    expect($this->staff->can('create', Order::class))->toBeTrue();
    expect($this->customer->can('create', Order::class))->toBeTrue();
});

test('admin can update any order', function () {
    expect($this->admin->can('update', $this->order))->toBeTrue();
    expect($this->admin->can('update', $this->otherOrder))->toBeTrue();
});

test('staff can update any order', function () {
    expect($this->staff->can('update', $this->order))->toBeTrue();
    expect($this->staff->can('update', $this->otherOrder))->toBeTrue();
});

test('customer can update their own pending order', function () {
    expect($this->customer->can('update', $this->order))->toBeTrue();
});

test('customer cannot update other customer order', function () {
    expect($this->customer->can('update', $this->otherOrder))->toBeFalse();
});

test('customer cannot update completed order', function () {
    $completedOrder = Order::factory()->create([
        'customer_id' => $this->customer->customer->id,
        'status' => 'completed'
    ]);
    
    expect($this->customer->can('update', $completedOrder))->toBeFalse();
});

test('admin can delete any order', function () {
    expect($this->admin->can('delete', $this->order))->toBeTrue();
    expect($this->admin->can('delete', $this->otherOrder))->toBeTrue();
});

test('staff cannot delete orders', function () {
    expect($this->staff->can('delete', $this->order))->toBeFalse();
});

test('customer can delete their own pending order', function () {
    expect($this->customer->can('delete', $this->order))->toBeTrue();
});

test('customer cannot delete other customer order', function () {
    expect($this->customer->can('delete', $this->otherOrder))->toBeFalse();
});

test('only admin can restore orders', function () {
    expect($this->admin->can('restore', $this->order))->toBeTrue();
    expect($this->staff->can('restore', $this->order))->toBeFalse();
    expect($this->customer->can('restore', $this->order))->toBeFalse();
});

test('only admin can permanently delete orders', function () {
    expect($this->admin->can('forceDelete', $this->order))->toBeTrue();
    expect($this->staff->can('forceDelete', $this->order))->toBeFalse();
    expect($this->customer->can('forceDelete', $this->order))->toBeFalse();
});

test('admin and staff can process orders', function () {
    expect($this->admin->can('process', $this->order))->toBeTrue();
    expect($this->staff->can('process', $this->order))->toBeTrue();
    expect($this->customer->can('process', $this->order))->toBeFalse();
});

test('admin and staff can cancel any order', function () {
    expect($this->admin->can('cancel', $this->order))->toBeTrue();
    expect($this->admin->can('cancel', $this->otherOrder))->toBeTrue();
    expect($this->staff->can('cancel', $this->order))->toBeTrue();
    expect($this->staff->can('cancel', $this->otherOrder))->toBeTrue();
});

test('customer can cancel their own pending order', function () {
    expect($this->customer->can('cancel', $this->order))->toBeTrue();
});

test('customer cannot cancel other customer order', function () {
    expect($this->customer->can('cancel', $this->otherOrder))->toBeFalse();
});
