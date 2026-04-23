<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
	/**
	 * Show contact list and create form.
	 */
	public function index(Request $request): Response
	{
		$customer = $request->user()?->customer;

		$contacts = $customer
			? Contact::where('customer_id', $customer->id)
				->orderBy('type')
				->orderByDesc('is_default')
				->get()
			: collect();

		return Inertia::render('settings/contacts', [
			'contacts' => $contacts,
		]);
	}

	/**
	 * Create a new contact.
	 */
	public function store(Request $request)
	{
		$customer = $request->user()->customer;

		$data = $this->validateData($request);
		$data['customer_id'] = $customer->id;

		$contact = Contact::create($data);

		return redirect()->back()->with('status', 'Contact created');
	}

	/**
	 * Update an existing contact.
	 */
	public function update(Request $request, Contact $contact)
	{
		$this->authorizeContact($request, $contact);

		$data = $this->validateData($request, updating: true);
		$contact->update($data);

		return redirect()->back()->with('status', 'Contact updated');
	}

	/**
	 * Delete a contact.
	 */
	public function destroy(Request $request, Contact $contact)
	{
		$this->authorizeContact($request, $contact);

		$contact->delete();

		return redirect()->back()->with('status', 'Contact deleted');
	}

	/**
	 * Set default contact by type.
	 */
	public function setDefault(Request $request, Contact $contact)
	{
		$this->authorizeContact($request, $contact);

		// Unset any existing default for this type
		Contact::where('customer_id', $contact->customer_id)
			->where('type', $contact->type)
			->update(['is_default' => false]);

		$contact->update(['is_default' => true]);

		return redirect()->back()->with('status', 'Default contact updated');
	}

	private function validateData(Request $request, bool $updating = false): array
	{
		return $request->validate([
			'type' => ['required', 'in:registrant,admin,tech,billing'],
			'first_name' => ['required', 'string', 'max:100'],
			'last_name' => ['required', 'string', 'max:100'],
			'email' => ['required', 'email', 'max:255'],
			'phone' => ['nullable', 'string', 'max:50'],
			'organization' => ['nullable', 'string', 'max:255'],
			'address_line_1' => ['required', 'string', 'max:255'],
			'address_line_2' => ['nullable', 'string', 'max:255'],
			'city' => ['required', 'string', 'max:100'],
			'state' => ['required', 'string', 'max:100'],
			'postal_code' => ['required', 'string', 'max:20'],
			'country' => ['required', 'string', 'size:2'],
			'is_default' => ['sometimes', 'boolean'],
		]);
	}

	private function authorizeContact(Request $request, Contact $contact): void
	{
		abort_unless(
			$request->user()->customer && $contact->customer_id === $request->user()->customer->id,
			403
		);
	}
}



