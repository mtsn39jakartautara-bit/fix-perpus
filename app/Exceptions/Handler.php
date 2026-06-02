<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

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
     * Render exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // $status = 500;

        // if ($e instanceof HttpExceptionInterface) {
        //     $status = $e->getStatusCode();
        // }


        // if (in_array($status, [403, 404, 500, 503])) {

        //     return Inertia::render("Errors/{$status}")
        //         ->toResponse($request)
        //         ->setStatusCode($status);
        // }

        return parent::render($request, $e);
    }
}
