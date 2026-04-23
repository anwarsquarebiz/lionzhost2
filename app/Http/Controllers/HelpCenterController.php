<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HelpCenterController extends Controller
{
    public function index(Request $request): Response
    {
        $tickets = SupportTicket::query()
            ->where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->paginate(15)
            ->through(fn (SupportTicket $t) => $this->ticketListPayload($t));

        return Inertia::render('Help/Index', [
            'tickets' => $tickets,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', SupportTicket::class);

        return Inertia::render('Help/Create');
    }

    public function store(Request $request)
    {
        Gate::authorize('create', SupportTicket::class);

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:10', 'max:20000'],
        ]);

        $ticket = DB::transaction(function () use ($request, $data) {
            $ticket = SupportTicket::create([
                'user_id' => $request->user()->id,
                'subject' => $data['subject'],
                'status' => SupportTicket::STATUS_AWAITING_STAFF,
            ]);

            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'body' => $data['body'],
                'is_staff' => false,
            ]);

            return $ticket;
        });

        return redirect()->route('help.tickets.show', $ticket);
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        Gate::authorize('view', $ticket);

        $ticket->load(['messages.user']);

        return Inertia::render('Help/Show', [
            'ticket' => $this->ticketDetailPayload($ticket),
        ]);
    }

    public function storeMessage(Request $request, SupportTicket $ticket)
    {
        Gate::authorize('reply', $ticket);

        $data = $request->validate([
            'body' => ['required', 'string', 'min:2', 'max:20000'],
        ]);

        $isStaff = $request->user()->isAdminOrStaff();

        DB::transaction(function () use ($request, $ticket, $data, $isStaff) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'body' => $data['body'],
                'is_staff' => $isStaff,
            ]);

            $ticket->update([
                'status' => $isStaff
                    ? SupportTicket::STATUS_AWAITING_CUSTOMER
                    : SupportTicket::STATUS_AWAITING_STAFF,
            ]);
        });

        return redirect()->route('help.tickets.show', $ticket);
    }

    private function ticketListPayload(SupportTicket $t): array
    {
        return [
            'id' => $t->id,
            'subject' => $t->subject,
            'status' => $t->status,
            'updated_at' => $t->updated_at->toIso8601String(),
            'created_at' => $t->created_at->toIso8601String(),
        ];
    }

    private function ticketDetailPayload(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at->toIso8601String(),
            'updated_at' => $ticket->updated_at->toIso8601String(),
            'messages' => $ticket->messages->map(fn (SupportTicketMessage $m) => [
                'id' => $m->id,
                'body' => $m->body,
                'is_staff' => $m->is_staff,
                'created_at' => $m->created_at->toIso8601String(),
                'user' => [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                ],
            ])->values()->all(),
        ];
    }
}
