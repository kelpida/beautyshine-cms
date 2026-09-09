<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;

class AuditableObserver
{
    public function created(Model $model)
    {
        $this->log('create', $model);
    }

    public function updated(Model $model)
    {
        // Prevent empty audit rows
        if (empty($model->getDirty())) {
            return;
        }

        $this->log('update', $model);
    }

    public function deleted(Model $model)
    {
        $this->log('delete', $model);
    }

    protected function log(string $action, Model $model)
    {
        // Avoid audit recursion
        if ($model instanceof AuditLog) {
            return;
        }

        $user = auth()->user();

        AuditLog::create([
            'entity_type' => get_class($model),          // ✅ FULL class name
            'entity_id'   => $model->getKey(),
            'action'      => $action,
            'user_id'     => $user?->id,
            'user_role'   => $user
                ? $user->roles->pluck('name')->implode(',')
                : 'system',
            'changes'     => $this->getChanges($model, $action),
            'ip_address'  => request()?->ip(),
            'source'      => app()->runningInConsole() ? 'job' : 'ui',
        ]);
    }

    protected function getChanges(Model $model, string $action): ?array
    {
        if ($action === 'create') {
            return collect($model->getAttributes())
                ->except(['created_at', 'updated_at'])
                ->toArray();
        }

        if ($action === 'update') {
            $changes = [];

            foreach ($model->getDirty() as $field => $newValue) {
                // Skip noisy fields
                if (in_array($field, ['updated_at', 'created_at'])) {
                    continue;
                }

                $changes[$field] = [
                    'before' => $model->getOriginal($field),
                    'after'  => $newValue,
                ];
            }

            return $changes ?: null;
        }

        return null;
    }
}
