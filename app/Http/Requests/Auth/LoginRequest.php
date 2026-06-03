<?php

namespace App\Http\Requests\Auth;

use App\Models\External;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'identifier' => 'Email / NISN / NIP / NIK',
            'password' => 'Password',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = $this->getCredentials();

        if (!Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'identifier' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Get credentials based on identifier (email/NISN/NIP/NIK)
     */
    private function getCredentials(): array
    {
        $identifier = $this->input('identifier');
        $password = $this->input('password');

        // Check if identifier is email format
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return [
                'email' => $identifier,
                'password' => $password,
            ];
        }

        // Try to find user by NISN (student)
        $student = Student::where('nis', $identifier)->with('user')->first();
        if ($student && $student->user) {
            return [
                'email' => $student->user->email,
                'password' => $password,
            ];
        }

        // Try to find user by NIP (teacher)
        $teacher = Teacher::where('nip', $identifier)->with('user')->first();
        if ($teacher && $teacher->user) {
            return [
                'email' => $teacher->user->email,
                'password' => $password,
            ];
        }

        // Try to find user by NIK (external)
        $external = External::where('nik', $identifier)->with('user')->first();
        if ($external && $external->user) {
            return [
                'email' => $external->user->email,
                'password' => $password,
            ];
        }

        // If not found as NISN/NIP/NIK, try as email
        return [
            'email' => $identifier,
            'password' => $password,
        ];
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'identifier' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('identifier')) . '|' . $this->ip());
    }
}
