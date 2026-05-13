<?php

namespace App\Auth;

use App\Models\AuthUser;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use \SoapClient;
use \SoapFault;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class SoapUserProvider implements UserProvider
{
    public function retrieveById($identifier)
    {
        $data = Session::get('soap_user_data');
        if ($data && ($data['bioid'] ?? null) == $identifier) {
            return new AuthUser($data);
        }
        return null;
    }

    public function retrieveByToken($identifier, $token)
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        // Not supported
    }

    public function retrieveByCredentials(array $credentials)
    {
        $bioid    = $credentials['bioid'] ?? null;
        $password = $credentials['password'] ?? null;

        if (!$bioid || !$password) {
            return null;
        }

        try {
            $soapAddress = config('services.soap.address');
            $appCode     = config('services.soap.app_code');

            // Step 1: Authenticate via SOAP (or debug bypass)
            $userdata = null;

            if (config('services.soap.debug_mode')) {
                Log::info('SOAP Debug Mode active for bioid=' . $bioid);
                $userdata = [
                    'Code'    => 100,
                    'Account' => (object)[
                        'FullName'     => '',
                        'Section'      => '',
                        'Division'     => '',
                        'Position'     => '',
                        'SectionName'  => '',
                        'PositionName' => '',
                    ],
                ];
            } else {
                if (!$soapAddress) {
                    Log::error('SOAP: Address is not configured.');
                    return null;
                }
                $soap     = new SoapClient($soapAddress, ['connection_timeout' => 10, 'exceptions' => true]);
                $param = [
                    'appCode'     => $appCode,
                    'bioUserName' => htmlspecialchars($bioid),
                    'password'    => htmlspecialchars($password),
                ];
                $result   = $soap->LogIn($param)->LogInResult;
                $userdata = (array) $result;
            }

            if (!isset($userdata['Code']) || !in_array($userdata['Code'], [100, 103])) {
                Log::info('SOAP: Login rejected for bioid=' . $bioid . ' code=' . ($userdata['Code'] ?? 'none'));
                return null;
            }

            // SOAP Account object contains FullName, Section, Division, Position, SectionName, PositionName
            $account = isset($userdata['Account']) ? (array) $userdata['Account'] : [];

            // Step 2: Enrich with HRIS employee data (name, photo, position)
            $employeeName  = $account['FullName'] ?? 'Unknown User';
            $sectionId     = $account['Section'] ?? '';
            $sectionName   = $account['SectionName'] ?? '';
            $divisionId    = $account['Division'] ?? '';
            $positionId    = $account['Position'] ?? '';
            $positionName  = $account['PositionName'] ?? '';
            $avatarDataUri = null;

            try {
                if (config('database.connections.hris.host')) {
                    $employee = DB::connection('hris')
                        ->table('tblEmployee')
                        ->where('bioID', $bioid)
                        ->first();

                    if ($employee) {
                        // Format: First MI. Last NameExt
                        $firstName     = trim($employee->FirstName ?? '');
                        $middle        = trim($employee->Middle ?? '');
                        $lastName      = trim($employee->LastName ?? '');
                        $nameExt       = trim($employee->NameExt ?? '');
                        $middleInitial = $middle ? strtoupper(substr($middle, 0, 1)) . '.' : '';

                        $built = trim(implode(' ', array_filter([$firstName, $middleInitial, $lastName, $nameExt])));
                        if ($built) {
                            $employeeName = $built;
                        }

                        $sectionId = $employee->sectionID ?? $sectionId;
                        $positionId = $employee->posID ?? $positionId;

                        // Lookup Section Name and Division
                        if (!empty($sectionId)) {
                            $section = DB::connection('hris')
                                ->table('tblSection')
                                ->where('sectionID', $sectionId)
                                ->first();
                            if ($section) {
                                $sectionName = $section->sectionName;
                                $divisionId  = $section->division;
                            }
                        }

                        // Lookup Position Name
                        if (!empty($positionId)) {
                            $pos = DB::connection('hris')
                                ->table('tblPosition')
                                ->where('posID', $positionId)
                                ->first();
                            if ($pos) {
                                $positionName = $pos->posName;
                            }
                        }

                        // Photo as base64 data URI
                        if (!empty($employee->photo)) {
                            $avatarDataUri = 'data:image/png;base64,' . base64_encode($employee->photo);
                        }
                    }
                }
            } catch (Exception $dbEx) {
                Log::warning('HRIS enrichment failed: ' . $dbEx->getMessage());
            }

            $attributes = [
                'id'            => $bioid,
                'bioid'         => $bioid,
                'password'      => $password,
                'name'          => $employeeName,
                'FullName'      => $employeeName,
                'Section'       => $sectionId,
                'Division'      => $divisionId,
                'Position'      => $positionId,
                'SectionName'   => $sectionName,
                'PositionName'  => $positionName,
                'UserPrivilege' => 0, // placeholder
                'avatar'        => $avatarDataUri,
            ];

            // Step 3: Upsert into local UserAuthority and get privilege
            $privilege = $this->upsertUserAuthority($bioid, $attributes);
            $attributes['UserPrivilege'] = $privilege;

            Session::put('soap_user_data', $attributes);

            return new AuthUser($attributes);

        } catch (Exception $e) {
            Log::error('Login Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Upsert the UserAuthority record in the local database.
     */
    private function upsertUserAuthority(string $bioid, array $data): int
    {
        $existing = DB::table('UserAuthority')->where('BiometricID', $bioid)->first();

        $now = now();

        $payload = [
            'FullName'     => $data['FullName'] ?? null,
            'Section'      => $data['Section'] ?? null,
            'Division'     => $data['Division'] ?? null,
            'Position'     => $data['Position'] ?? null,
            'SectionName'  => $data['SectionName'] ?? null,
            'PositionName' => $data['PositionName'] ?? null,
            'LastLogin'    => $now,
            'updated_at'   => $now,
        ];

        if ($existing) {
            DB::table('UserAuthority')->where('BiometricID', $bioid)->update($payload);
            return (int) $existing->UserPrivilege;
        }

        // First-time login
        $payload['BiometricID']   = $bioid;
        $payload['UserPrivilege'] = 0;
        $payload['created_at']    = $now;

        DB::table('UserAuthority')->insert($payload);

        return 0;
    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        return true;
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false)
    {
        return false;
    }
}
