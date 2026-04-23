<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'company_name' => $this->faker->optional(0.7)->company(),
            'phone' => $this->faker->optional(0.8)->phoneNumber(),
            'address' => $this->faker->optional(0.9)->address(),
            'city' => $this->faker->optional(0.9)->city(),
            'state' => $this->faker->optional(0.7)->state(),
            'postal_code' => $this->faker->optional(0.9)->postcode(),
            'country' => $this->faker->optional(0.9)->country(),
            'tax_id' => $this->faker->optional(0.3)->taxId(),
            'notes' => $this->faker->optional(0.2)->paragraph(),
        ];
    }
}
