<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tld>
 */
class TldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $extensions = ['com', 'net', 'org', 'info', 'biz', 'co', 'in', 'uk', 'de', 'fr'];
        $extension = $this->faker->randomElement($extensions);
        
        return [
            'extension' => $extension,
            'name' => $this->faker->words(2, true),
            'registry_operator' => $this->faker->randomElement(['centralnic', 'resellerclub']),
            'is_active' => $this->faker->boolean(90),
            'min_years' => 1,
            'max_years' => $this->faker->numberBetween(5, 10),
            'auto_renewal' => $this->faker->boolean(80),
            'privacy_protection' => $this->faker->boolean(70),
            'dns_management' => $this->faker->boolean(85),
            'email_forwarding' => $this->faker->boolean(75),
            'id_protection' => $this->faker->boolean(60),
        ];
    }
}
