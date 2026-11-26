<?php

namespace Drupal\apiservices\EventSubscriber;

use Drupal\Core\Routing\RouteMatch;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Site\MaintenanceModeInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Answers /api/* requests with JSON while the site is in maintenance mode.
 *
 * Core's MaintenanceModeSubscriber returns the HTML maintenance page (or a
 * text/plain body for non-HTML formats), which the React SPA cannot reliably
 * parse. This subscriber runs just before core's and returns a machine-readable
 * 503 instead:
 *
 *   HTTP/1.1 503 Service Unavailable
 *   Retry-After: 60
 *   {"status":"maintenance","message":"…"}
 *
 * Users exempt from maintenance mode (e.g. "Use the site in maintenance mode")
 * fall through to the normal API responses, exactly as core does.
 */
class MaintenanceApiSubscriber implements EventSubscriberInterface {

  /**
   * Seconds the SPA should wait before retrying, sent as Retry-After.
   */
  public const RETRY_AFTER_SECONDS = 60;

  public function __construct(
    protected readonly MaintenanceModeInterface $maintenanceMode,
    protected readonly AccountInterface $currentUser,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    // The router listener runs at 32 and core's maintenance subscriber at 30.
    // 31 means the route is already matched, and we answer before core does.
    return [KernelEvents::REQUEST => ['onKernelRequest', 31]];
  }

  /**
   * Returns a JSON 503 for /api/* requests during maintenance.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The request event.
   */
  public function onKernelRequest(RequestEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }

    $request = $event->getRequest();
    if (!str_starts_with($request->getPathInfo(), '/api/')) {
      return;
    }

    $route_match = RouteMatch::createFromRequest($request);
    if (!$this->maintenanceMode->applies($route_match)) {
      return;
    }
    if ($this->maintenanceMode->exempt($this->currentUser)) {
      return;
    }

    $response = new JsonResponse([
      'status' => 'maintenance',
      'message' => (string) $this->maintenanceMode->getSiteMaintenanceMessage(),
    ], 503);
    $response->headers->set('Retry-After', (string) self::RETRY_AFTER_SECONDS);
    // Never let a proxy or browser cache a "down" answer.
    $response->headers->set('Cache-Control', 'no-store, max-age=0');

    // Calling setResponse() also stops propagation, so core's subscriber never runs.
    $event->setResponse($response);
  }

}
