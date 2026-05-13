<?php

namespace App\Models;

use Illuminate\Auth\GenericUser;

class AuthUser extends GenericUser
{
    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName(): string
    {
        return 'bioid';
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword(): string
    {
        return $this->attributes['password'] ?? '';
    }

    /**
     * Get the column name for the password.
     */
    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    /**
     * Get the token used for the "remember me" session.
     */
    public function getRememberToken(): ?string
    {
        return $this->attributes['remember_token'] ?? null;
    }

    /**
     * Set the token used for the "remember me" session.
     */
    public function setRememberToken($value): void
    {
        $this->attributes['remember_token'] = $value;
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName(): string
    {
        return 'remember_token';
    }
}
