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

    public function tpnLabel(): Response
    {
        return Inertia::render('labels/tpn', [
            'orders' => $this->labelOrders(),
        ]);
    }

    public function lipidsLabel(): Response
    {
        return Inertia::render('labels/lipids', [
            'orders' => $this->labelOrders(),
        ]);
    }

    public function store(StoreTpnOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($this->shouldBlockPeripheralOsmolarity($validated)) {
            return redirect()
                ->back()
                ->withInput()
                ->with('toast', [
                    'type' => 'error',
                    'message' => 'Peripheral line osmolarity is above the safe limit. Please adjust the formulation before submitting.',
                ]);
        }

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

        if ($this->shouldBlockPeripheralOsmolarity($validated)) {
            return redirect()
                ->back()
                ->withInput()
                ->with('toast', [
                    'type' => 'error',
                    'message' => 'Peripheral line osmolarity is above the safe limit. Please adjust the formulation before submitting.',
                ]);
        }

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

    public function destroy(TpnOrder $order): RedirectResponse
    {
        $orderNo = $order->order_no;

        DB::transaction(function () use ($order) {
            $order->statusHistory()->delete();
            $order->computation()->delete();
            $order->delete();
        });

        return redirect()
            ->route('orders.index')
            ->with('toast', [
                'type' => 'success',
                'message' => "TPN order {$orderNo} has been deleted.",
            ]);
    }

    private function shouldBlockPeripheralOsmolarity(array $validated): bool
    {
        $usesCalculator = (bool) ($validated['use_osmolarity_calculator'] ?? false);

        if (!$usesCalculator) {
            return false;
        }

        $route = $validated['route'] ?? null;

        if ($route !== 'Peripheral Line') {
            return false;
        }

        $osmolarity = $validated['osmolarity_computed_mosm_l'] ?? null;

        if ($osmolarity === null || $osmolarity === '') {
            return false;
        }

        return (float) $osmolarity >= 900;
    }

    private function generateOrderNumber(): string
    {
        $result = DB::select('EXEC spGenerateTpnOrderNumber');

        return $result[0]->order_no;
    }

    private function labelOrders()
    {
        return TpnOrder::query()
            ->with('computation')
            ->orderByDesc('tpn_order_id')
            ->get()
            ->map(fn(TpnOrder $order) => $this->formatOrderForFrontend($order));
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
            'heparin_ml' => $validated['heparin_ml'] ?? null,
            'heparin_iu_per_ml' => $validated['heparin_iu_per_ml'] ?? null,
            'sterile_water_level_ml_day' => $validated['sterile_water_level_ml_day'] ?? null,

            'use_osmolarity_calculator' => $validated['use_osmolarity_calculator'] ?? false,

            'osmolarity_notes' => ($validated['use_osmolarity_calculator'] ?? false)
                ? ($validated['osmolarity_notes'] ?? null)
                : null,

            'osmolarity_inputs_json' => ($validated['use_osmolarity_calculator'] ?? false)
                ? ($validated['osmolarity_inputs_json'] ?? null)
                : null,

            'osmolarity_computed_mosm_l' => ($validated['use_osmolarity_calculator'] ?? false)
                ? ($validated['osmolarity_computed_mosm_l'] ?? null)
                : null,

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
        $osmolarityFields = $this->osmolarityJsonToFormFields(
            $computation?->osmolarity_inputs_json,
        );

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
            'heparin_ml' => $this->decimalToString($computation?->heparin_ml),
            'heparin_iu_per_ml' => $this->decimalToString($computation?->heparin_iu_per_ml),
            'sterile_water_level_ml_day' => $this->decimalToString($computation?->sterile_water_level_ml_day),

            'use_osmolarity_calculator' => (bool) ($computation?->use_osmolarity_calculator ?? false),

            ...$osmolarityFields,

            'osmolarity_notes' => $computation?->osmolarity_notes ?? '',
            'osmolarity_inputs_json' => $computation?->osmolarity_inputs_json ?? '',
            'osmolarity_computed_mosm_l' => $this->decimalToString(
                $computation?->osmolarity_computed_mosm_l,
            ),
        ];
    }

    private function osmolarityJsonToFormFields(?string $json): array
    {
        $defaults = [
            'osmolarity_ppn_solution' => '',
            'osmolarity_ppn_volume_ml' => '',
            'osmolarity_ppn_lock_total_volume' => 'no',

            'osmolarity_amino_acid_10_grams' => '',
            'osmolarity_amino_acid_15_grams' => '',
            'osmolarity_dextrose_concentration' => '',
            'osmolarity_dextrose_grams' => '',
            'osmolarity_hepatamine_8_grams' => '',
            'osmolarity_lipid_10_ml' => '',
            'osmolarity_lipid_20_ml' => '',
            'osmolarity_novamine_15_grams' => '',
            'osmolarity_sterile_water_ml' => '',

            'osmolarity_calcium_gluconate_10_ml' => '',
            'osmolarity_calcium_chloride_10_ml' => '',
            'osmolarity_magnesium_sulfate_ml' => '',
            'osmolarity_multi_trace_elements_ml' => '',
            'osmolarity_multivitamin_12_ml' => '',
            'osmolarity_potassium_acetate_ml' => '',
            'osmolarity_potassium_chloride_ml' => '',
            'osmolarity_potassium_phosphate_ml' => '',
            'osmolarity_sodium_acetate_ml' => '',
            'osmolarity_sodium_bicarbonate_4_2_ml' => '',
            'osmolarity_sodium_bicarbonate_7_5_ml' => '',
            'osmolarity_sodium_bicarbonate_8_4_ml' => '',
            'osmolarity_sodium_chloride_14_6_ml' => '',
            'osmolarity_sodium_chloride_23_4_ml' => '',
            'osmolarity_sodium_phosphate_ml' => '',
        ];

        if (!$json) {
            return $defaults;
        }

        $decoded = json_decode($json, true);

        if (!is_array($decoded)) {
            return $defaults;
        }

        return [
            ...$defaults,

            'osmolarity_ppn_solution' => (string) data_get(
                $decoded,
                'ppn.solution',
                $defaults['osmolarity_ppn_solution'],
            ),
            'osmolarity_ppn_volume_ml' => (string) data_get(
                $decoded,
                'ppn.volume_ml',
                $defaults['osmolarity_ppn_volume_ml'],
            ),
            'osmolarity_ppn_lock_total_volume' => (string) data_get(
                $decoded,
                'ppn.lock_total_volume',
                $defaults['osmolarity_ppn_lock_total_volume'],
            ),

            'osmolarity_amino_acid_10_grams' => (string) data_get(
                $decoded,
                'tpn.amino_acid_10_grams',
                $defaults['osmolarity_amino_acid_10_grams'],
            ),
            'osmolarity_amino_acid_15_grams' => (string) data_get(
                $decoded,
                'tpn.amino_acid_15_grams',
                $defaults['osmolarity_amino_acid_15_grams'],
            ),
            'osmolarity_dextrose_concentration' => (string) data_get(
                $decoded,
                'tpn.dextrose_concentration',
                $defaults['osmolarity_dextrose_concentration'],
            ),
            'osmolarity_dextrose_grams' => (string) data_get(
                $decoded,
                'tpn.dextrose_grams',
                $defaults['osmolarity_dextrose_grams'],
            ),
            'osmolarity_hepatamine_8_grams' => (string) data_get(
                $decoded,
                'tpn.hepatamine_8_grams',
                $defaults['osmolarity_hepatamine_8_grams'],
            ),
            'osmolarity_lipid_10_ml' => (string) data_get(
                $decoded,
                'tpn.lipid_10_ml',
                $defaults['osmolarity_lipid_10_ml'],
            ),
            'osmolarity_lipid_20_ml' => (string) data_get(
                $decoded,
                'tpn.lipid_20_ml',
                $defaults['osmolarity_lipid_20_ml'],
            ),
            'osmolarity_novamine_15_grams' => (string) data_get(
                $decoded,
                'tpn.novamine_15_grams',
                $defaults['osmolarity_novamine_15_grams'],
            ),
            'osmolarity_sterile_water_ml' => (string) data_get(
                $decoded,
                'tpn.sterile_water_ml',
                $defaults['osmolarity_sterile_water_ml'],
            ),

            'osmolarity_calcium_gluconate_10_ml' => (string) data_get(
                $decoded,
                'additives.calcium_gluconate_10_ml',
                $defaults['osmolarity_calcium_gluconate_10_ml'],
            ),
            'osmolarity_calcium_chloride_10_ml' => (string) data_get(
                $decoded,
                'additives.calcium_chloride_10_ml',
                $defaults['osmolarity_calcium_chloride_10_ml'],
            ),
            'osmolarity_magnesium_sulfate_ml' => (string) data_get(
                $decoded,
                'additives.magnesium_sulfate_ml',
                $defaults['osmolarity_magnesium_sulfate_ml'],
            ),
            'osmolarity_multi_trace_elements_ml' => (string) data_get(
                $decoded,
                'additives.multi_trace_elements_ml',
                $defaults['osmolarity_multi_trace_elements_ml'],
            ),
            'osmolarity_multivitamin_12_ml' => (string) data_get(
                $decoded,
                'additives.multivitamin_12_ml',
                $defaults['osmolarity_multivitamin_12_ml'],
            ),
            'osmolarity_potassium_acetate_ml' => (string) data_get(
                $decoded,
                'additives.potassium_acetate_ml',
                $defaults['osmolarity_potassium_acetate_ml'],
            ),
            'osmolarity_potassium_chloride_ml' => (string) data_get(
                $decoded,
                'additives.potassium_chloride_ml',
                $defaults['osmolarity_potassium_chloride_ml'],
            ),
            'osmolarity_potassium_phosphate_ml' => (string) data_get(
                $decoded,
                'additives.potassium_phosphate_ml',
                $defaults['osmolarity_potassium_phosphate_ml'],
            ),
            'osmolarity_sodium_acetate_ml' => (string) data_get(
                $decoded,
                'additives.sodium_acetate_ml',
                $defaults['osmolarity_sodium_acetate_ml'],
            ),
            'osmolarity_sodium_bicarbonate_4_2_ml' => (string) data_get(
                $decoded,
                'additives.sodium_bicarbonate_4_2_ml',
                $defaults['osmolarity_sodium_bicarbonate_4_2_ml'],
            ),
            'osmolarity_sodium_bicarbonate_7_5_ml' => (string) data_get(
                $decoded,
                'additives.sodium_bicarbonate_7_5_ml',
                $defaults['osmolarity_sodium_bicarbonate_7_5_ml'],
            ),
            'osmolarity_sodium_bicarbonate_8_4_ml' => (string) data_get(
                $decoded,
                'additives.sodium_bicarbonate_8_4_ml',
                $defaults['osmolarity_sodium_bicarbonate_8_4_ml'],
            ),
            'osmolarity_sodium_chloride_14_6_ml' => (string) data_get(
                $decoded,
                'additives.sodium_chloride_14_6_ml',
                $defaults['osmolarity_sodium_chloride_14_6_ml'],
            ),
            'osmolarity_sodium_chloride_23_4_ml' => (string) data_get(
                $decoded,
                'additives.sodium_chloride_23_4_ml',
                $defaults['osmolarity_sodium_chloride_23_4_ml'],
            ),
            'osmolarity_sodium_phosphate_ml' => (string) data_get(
                $decoded,
                'additives.sodium_phosphate_ml',
                $defaults['osmolarity_sodium_phosphate_ml'],
            ),
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
