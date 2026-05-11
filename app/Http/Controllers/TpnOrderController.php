<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTpnOrderRequest;
use App\Models\TpnOrder;
use App\Models\TpnOrderComputation;
use App\Models\TpnOrderStatusHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TpnOrderController extends Controller
{
    public function dashboard(): Response
    {
        $today = Carbon::today();

        $recentOrders = TpnOrder::query()
            ->with('computation')
            ->orderByDesc('tpn_order_id')
            ->limit(8)
            ->get()
            ->map(fn(TpnOrder $order) => $this->formatOrderForFrontend($order));

        return Inertia::render('dashboard', [
            'stats' => [
                'total_orders' => TpnOrder::query()->count(),
                'orders_today' => TpnOrder::query()
                    ->whereDate('date_created', $today)
                    ->count(),
                'pending_review' => TpnOrder::query()
                    ->where('status', 'Pending Review')
                    ->count(),
                'for_dispensing' => TpnOrder::query()
                    ->where('status', 'For Dispensing')
                    ->count(),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }

    public function index(): Response
    {
        $orders = TpnOrder::query()
            ->with('computation')
            ->orderByDesc('tpn_order_id')
            ->get()
            ->map(fn(TpnOrder $order) => $this->formatOrderForFrontend($order));

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(TpnOrder $order): Response
    {
        $order->load('computation');

        return Inertia::render('orders/show', [
            'order' => $this->formatOrderForFrontend($order),
        ]);
    }

    public function edit(TpnOrder $order): Response
    {
        $order->load('computation');

        return Inertia::render('orders/edit', [
            'order' => $this->formatOrderForFrontend($order),
        ]);
    }

    public function store(StoreTpnOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated) {
            $now = Carbon::now();
            $userId = Auth::id();

            $orderNo = $this->generateOrderNumber();

            $order = TpnOrder::create([
                'order_no' => $orderNo,
                'status' => 'Pending Review',
                ...$this->orderAttributes($validated, $userId, $now, true),
            ]);

            TpnOrderComputation::create([
                'tpn_order_id' => $order->tpn_order_id,
                ...$this->computationAttributes($validated, $now, true),
            ]);

            TpnOrderStatusHistory::create([
                'tpn_order_id' => $order->tpn_order_id,
                'old_status' => null,
                'new_status' => 'Pending Review',
                'remarks' => 'TPN order submitted for review.',
                'changed_by' => $userId,
                'changed_at' => $now,
            ]);

            return $order;
        });

        return redirect()
            ->back()
            ->with('toast', [
                'type' => 'success',
                'message' => "TPN order {$order->order_no} has been saved.",
            ]);
    }

    public function update(StoreTpnOrderRequest $request, TpnOrder $order): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $order) {
            $now = Carbon::now();
            $userId = Auth::id();

            $order->update($this->orderAttributes($validated, $userId, $now));

            TpnOrderComputation::updateOrCreate(
                ['tpn_order_id' => $order->tpn_order_id],
                $this->computationAttributes($validated, $now, !$order->computation()->exists()),
            );
        });

        return redirect()
            ->back()
            ->with('toast', [
                'type' => 'success',
                'message' => "TPN order {$order->order_no} has been updated.",
            ]);
    }

    private function generateOrderNumber(): string
    {
        $result = DB::select('EXEC spGenerateTpnOrderNumber');

        return $result[0]->order_no;
    }

    private function orderAttributes(array $validated, ?int $userId, Carbon $now, bool $creating = false): array
    {
        $attributes = [
            'temporary_request' => $validated['temporary_request'] ?? false,

            'last_name' => $validated['last_name'] ?? null,
            'first_name' => $validated['first_name'] ?? null,
            'middle_name' => $validated['middle_name'] ?? null,
            'suffix' => $validated['suffix'] ?? null,

            'hospital_number' => $validated['hospital_number'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'sex' => $validated['sex'] ?? null,

            'ward' => $validated['ward'] ?? null,
            'room' => $validated['room'] ?? null,
            'prescribing_physician' => $validated['prescribing_physician'] ?? null,
            'is_initial_order' => $validated['is_initial_order'] ?? false,

            'birth_weight_kg' => $validated['birth_weight_kg'] ?? null,
            'current_weight_kg' => $validated['current_weight_kg'] ?? null,
            'height_cm' => $validated['height_cm'] ?? null,
            'diagnosis' => $validated['diagnosis'] ?? null,

            'total_fluid_ml' => $validated['total_fluid_ml'] ?? null,
            'duration_hours' => $validated['duration_hours'] ?? null,
            'route' => $validated['route'] ?? null,

            'modified_by' => $userId,
            'date_modified' => $now,
        ];

        if ($creating) {
            $attributes['created_by'] = $userId;
            $attributes['date_created'] = $now;
        }

        return $attributes;
    }

    private function computationAttributes(array $validated, Carbon $now, bool $creating = false): array
    {
        $attributes = [
            'protein_g_per_kg_day' => $validated['protein_g_per_kg_day'] ?? null,

            'dextrose_percent' => $validated['dextrose_percent'] ?? null,

            'lipid_g_per_kg_day' => $validated['lipid_g_per_kg_day'] ?? null,
            'lipid_concentration' => $validated['lipid_concentration'] ?? null,
            'lipid_duration_hours' => $validated['lipid_duration_hours'] ?? null,
            'lipid_piggyback' => $validated['lipid_piggyback'] ?? false,
            'lipid_separate_line' => $validated['lipid_separate_line'] ?? false,

            'sodium_meq_kg_day' => $validated['sodium_meq_kg_day'] ?? null,
            'potassium_meq_kg_day' => $validated['potassium_meq_kg_day'] ?? null,
            'calcium_mg_kg_day' => $validated['calcium_mg_kg_day'] ?? null,
            'magnesium_meq_kg_day' => $validated['magnesium_meq_kg_day'] ?? null,
            'phosphorus_mmol_kg_day' => $validated['phosphorus_mmol_kg_day'] ?? null,

            'trace_elements_ml_kg_day' => $validated['trace_elements_ml_kg_day'] ?? null,
            'multivitamins_ml_day' => $validated['multivitamins_ml_day'] ?? null,

            'osmolarity_notes' => $validated['osmolarity_notes'] ?? null,

            'date_modified' => $now,
        ];

        if ($creating) {
            $attributes['date_created'] = $now;
        }

        return $attributes;
    }

    private function formatOrderForFrontend(TpnOrder $order): array
    {
        $computation = $order->computation;

        return [
            'id' => $order->tpn_order_id,
            'tpn_order_id' => $order->tpn_order_id,
            'order_no' => $order->order_no,
            'order_date' => optional($order->date_created)->format('M d, Y, h:i A'),
            'status' => $order->status,

            'temporary_request' => (bool) $order->temporary_request,

            'last_name' => $order->last_name ?? '',
            'first_name' => $order->first_name ?? '',
            'middle_name' => $order->middle_name ?? '',
            'suffix' => $order->suffix ?? '',

            'hospital_number' => $order->hospital_number ?? '',
            'date_of_birth' => optional($order->date_of_birth)->format('Y-m-d') ?? '',
            'sex' => $order->sex ?? '',

            'ward' => $order->ward ?? '',
            'room' => $order->room ?? '',
            'prescribing_physician' => $order->prescribing_physician ?? '',
            'is_initial_order' => (bool) $order->is_initial_order,

            'birth_weight_kg' => $this->decimalToString($order->birth_weight_kg),
            'current_weight_kg' => $this->decimalToString($order->current_weight_kg),
            'height_cm' => $this->decimalToString($order->height_cm),
            'diagnosis' => $order->diagnosis ?? '',

            'total_fluid_ml' => $this->decimalToString($order->total_fluid_ml),
            'duration_hours' => $this->decimalToString($order->duration_hours),
            'route' => $order->route ?? '',

            'protein_g_per_kg_day' => $this->decimalToString($computation?->protein_g_per_kg_day),

            'dextrose_percent' => $this->decimalToString($computation?->dextrose_percent),

            'lipid_g_per_kg_day' => $this->decimalToString($computation?->lipid_g_per_kg_day),
            'lipid_concentration' => $this->decimalToString($computation?->lipid_concentration) ?: '20',
            'lipid_duration_hours' => $this->decimalToString($computation?->lipid_duration_hours) ?: '24',
            'lipid_piggyback' => (bool) ($computation?->lipid_piggyback ?? false),
            'lipid_separate_line' => (bool) ($computation?->lipid_separate_line ?? false),

            'sodium_meq_kg_day' => $this->decimalToString($computation?->sodium_meq_kg_day),
            'potassium_meq_kg_day' => $this->decimalToString($computation?->potassium_meq_kg_day),
            'calcium_mg_kg_day' => $this->decimalToString($computation?->calcium_mg_kg_day),
            'magnesium_meq_kg_day' => $this->decimalToString($computation?->magnesium_meq_kg_day),
            'phosphorus_mmol_kg_day' => $this->decimalToString($computation?->phosphorus_mmol_kg_day),

            'trace_elements_ml_kg_day' => $this->decimalToString($computation?->trace_elements_ml_kg_day),
            'multivitamins_ml_day' => $this->decimalToString($computation?->multivitamins_ml_day),
        
            'osmolarity_notes' => $computation?->osmolarity_notes ?? '',
        ];
    }

    private function decimalToString(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        return rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.');
    }
}
