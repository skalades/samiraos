<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Real-time Announcements Channels
Broadcast::channel('announcements.all', function ($user) {
    return $user !== null;
});

Broadcast::channel('announcements.distributor', function ($user) {
    return $user->isDistributor() || $user->isSuperAdmin();
});

Broadcast::channel('announcements.agen', function ($user) {
    return $user->isAgen() || $user->isSuperAdmin();
});
