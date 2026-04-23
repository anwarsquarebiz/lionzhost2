<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function view(User $user, SupportTicket $supportTicket): bool
    {
        return (int) $supportTicket->user_id === (int) $user->id || $user->isAdminOrStaff();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function reply(User $user, SupportTicket $supportTicket): bool
    {
        if ($supportTicket->isClosed()) {
            return false;
        }

        if ($user->isAdminOrStaff()) {
            return true;
        }

        return (int) $supportTicket->user_id === (int) $user->id;
    }

    public function close(User $user, SupportTicket $supportTicket): bool
    {
        return $user->isAdminOrStaff();
    }

    public function reopen(User $user, SupportTicket $supportTicket): bool
    {
        return $user->isAdminOrStaff();
    }
}
