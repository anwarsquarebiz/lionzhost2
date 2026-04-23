<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdminOrStaff(), 403);

        $query = SupportTicket::with('user')->latest('updated_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', '%'.$search.'%')
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    });
            });
        }

        $tickets = $query->paginate(20)->through(function (SupportTicket $t) {
            return [
                'id' => $t->id,
                'subject' => $t->subject,
                'status' => $t->status,
                'updated_at' => $t->updated_at->toIso8601String(),
                'created_at' => $t->created_at->toIso8601String(),
                'user' => [
                    'id' => $t->user->id,
                    'name' => $t->user->name,
                    'email' => $t->user->email,
                ],
            ];
        });

        return Inertia::render('Admin/SupportTickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'search']),
            'statuses' => [
                SupportTicket::STATUS_AWAITING_STAFF => 'Awaiting staff',
                SupportTicket::STATUS_AWAITING_CUSTOMER => 'Awaiting customer',
                SupportTicket::STATUS_CLOSED => 'Closed',
            ],
        ]);
    }

    public function show(Request $request, SupportTicket $supportTicket): Response
    {
        Gate::authorize('view', $supportTicket);

        $supportTicket->load(['messages.user', 'user']);

        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => [
                'id' => $supportTicket->id,
                'subject' => $supportTicket->subject,
                'status' => $supportTicket->status,
                'created_at' => $supportTicket->created_at->toIso8601String(),
                'updated_at' => $supportTicket->updated_at->toIso8601String(),
                'user' => [
                    'id' => $supportTicket->user->id,
                    'name' => $supportTicket->user->name,
                    'email' => $supportTicket->user->email,
                ],
                'messages' => $supportTicket->messages->map(fn (SupportTicketMessage $m) => [
                    'id' => $m->id,
                    'body' => $m->body,
                    'is_staff' => $m->is_staff,
                    'created_at' => $m->created_at->toIso8601String(),
                    'user' => [
                        'id' => $m->user->id,
                        'name' => $m->user->name,
                    ],
                ])->values()->all(),
            ],
        ]);
    }

    public function storeMessage(Request $request, SupportTicket $supportTicket)
    {
        Gate::authorize('reply', $supportTicket);

        $data = $request->validate([
            'body' => ['required', 'string', 'min:2', 'max:20000'],
        ]);

        DB::transaction(function () use ($request, $supportTicket, $data) {
            SupportTicketMessage::create([
                'support_ticket_id' => $supportTicket->id,
                'user_id' => $request->user()->id,
                'body' => $data['body'],
                'is_staff' => true,
            ]);

            $supportTicket->update([
                'status' => SupportTicket::STATUS_AWAITING_CUSTOMER,
            ]);
        });

        return redirect()->route('admin.support-tickets.show', $supportTicket);
    }

    public function close(Request $request, SupportTicket $supportTicket)
    {
        Gate::authorize('close', $supportTicket);

        $supportTicket->update(['status' => SupportTicket::STATUS_CLOSED]);

        return redirect()->route('admin.support-tickets.show', $supportTicket);
    }

    public function reopen(Request $request, SupportTicket $supportTicket)
    {
        Gate::authorize('reopen', $supportTicket);

        $supportTicket->update(['status' => SupportTicket::STATUS_AWAITING_STAFF]);

        return redirect()->route('admin.support-tickets.show', $supportTicket);
    }
}
