<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Throwable;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function render($request, Throwable $exception)
    {
        // $status = $exception instanceof HttpExceptionInterface
        //     ? $exception->getStatusCode()
        //     : 500;

        // if ($request->expectsJson()) {
        //     return parent::render($request, $exception);
        // }

        // if (in_array($status, [403, 404, 419, 500])) {
        //     return Inertia::render("Errors/{$status}", [
        //         'status' => $status,
        //         'message' => $exception->getMessage() ?: match ($status) {
        //             403 => 'Forbidden',
        //             404 => 'Not Found',
        //             419 => 'Page Expired',
        //             500 => 'Server Error',
        //             default => 'Error',
        //         },
        //     ])->toResponse($request)->setStatusCode($status);
        // }

        return parent::render($request, $exception);
    }

    /**
     * Check if the request expects an Inertia response.
     */
    protected function isInertiaRequest($request): bool
    {
        return $request->header('X-Inertia') === 'true';
    }
}
