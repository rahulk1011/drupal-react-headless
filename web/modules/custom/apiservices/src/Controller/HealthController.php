<?php

namespace Drupal\apiservices\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Lightweight liveness probe used by the React SPA to detect backend recovery.
 *
 * During maintenance mode the MaintenanceApiSubscriber answers this route with
 * a 503 instead, so the probe reports "down" just like every other endpoint.
 */
class HealthController
{
	/**
	 * Returns a 200 with a small JSON body when Drupal is serving requests.
	 */
	public function check(): JsonResponse
	{
		$response = new JsonResponse(['status' => 'ok']);
		$response->headers->set('Cache-Control', 'no-store, max-age=0');
		return $response;
	}
}
