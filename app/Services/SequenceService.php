<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class SequenceService
{
    /**
     * Generate a sequential number safely using row-level locking.
     * Format will be: PREFIX/YYYY/MM/XXXX
     *
     * @param string $prefix
     * @param int $padding
     * @return string
     */
    public static function generate(string $prefix, int $padding = 4): string
    {
        $yearMonth = now()->format('Y/m');
        $sequenceName = "{$prefix}_{$yearMonth}";

        // We use a transaction to lock the specific row for update.
        // This ensures thread-safety under high concurrency.
        $nextValue = DB::transaction(function () use ($sequenceName) {
            $sequence = DB::table('document_sequences')
                ->where('name', $sequenceName)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                // If doesn't exist, insert starting at 1
                DB::table('document_sequences')->insert([
                    'name' => $sequenceName,
                    'value' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                return 1;
            }

            // If exists, increment by 1
            $newValue = $sequence->value + 1;
            DB::table('document_sequences')
                ->where('name', $sequenceName)
                ->update([
                    'value' => $newValue,
                    'updated_at' => now(),
                ]);

            return $newValue;
        });

        $paddedValue = str_pad((string) $nextValue, $padding, '0', STR_PAD_LEFT);
        
        return "{$prefix}/{$yearMonth}/{$paddedValue}";
    }
}
