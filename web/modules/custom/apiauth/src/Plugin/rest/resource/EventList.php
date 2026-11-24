<?php

namespace Drupal\apiauth\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides a resource to get view modes by entity and bundle.
 * @RestResource(
 *   id = "eventlist_rest",
 *   label = @Translation("Eventlist API"),
 *   uri_paths = {
 *     "canonical" = "/api/v1/eventlist",
 *     "create" = "/api/v1/add-event"
 *   }
 * )
 */

class EventList extends ResourceBase {
	/**
	 * A current user instance which is logged in the session.
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $loggedUser;

	/**
	 * Constructs a Drupal\rest\Plugin\ResourceBase object.
	 */
	public function __construct(array $config, $module_id, $module_definition, array $serializer_formats, LoggerInterface $logger, AccountProxyInterface $current_user)
	{
		parent::__construct($config, $module_id, $module_definition, $serializer_formats, $logger);
		$this->loggedUser = $current_user;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $config, $module_id, $module_definition)
	{
		return new static(
			$config,
			$module_id,
			$module_definition,
			$container->getParameter('serializer.formats'),
			$container->get('logger.factory')->get('events_list_api'),
			$container->get('current_user')
		);
	}

  /*
   * Get All Events API
   */
  public function get() {
		try {
			$event_nids = \Drupal::entityQuery('node')
				->accessCheck(TRUE)
				->condition('type', 'event')
				->condition('status', 1)
				->execute();
    	
			$event_nodes = Node::loadMultiple($event_nids);

			$event_list_data = [];

			foreach ($event_nodes as $node) {
				$event_list_data[] = [
					'id' => $node->id(),
					'title' => $node->getTitle(),
					'description' => $node->get('field_description')->value ?? '',
					'event_date' => $node->get('field_event_date')->value ?? '',
					'location' => $node->get('field_location')->value ?? '',
					'max_attendees' => (int) ($node->get('field_max_attendees')->value ?? 0),
				];
			}

			if (empty($event_list_data)) {
				return new JsonResponse([
					'status' => 'Success',
					'message' => 'No events found.',
					'result' => [],
				]);
			} else {
				return new JsonResponse([
					'status' => 'Success',
					'message' => 'Event List',
					'result' => $event_list_data,
				]);
			}

		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
  }

	/**
	 * Creates a new "event" node.
	 */
	public function post(Request $request) {
		try {
			$data = json_decode($request->getContent(), TRUE) ?: [];
			$title = trim($data['title'] ?? '');
			$description = trim($data['description'] ?? '');
			$event_date = trim($data['event_date'] ?? '');
			$location = trim($data['location'] ?? '');
			$max_attendees = (int) ($data['max_attendees'] ?? 0);

			// Validate required fields
			if (empty($title) || empty($description) || empty($event_date) || empty($location) || $max_attendees <= 0) {
				return new JsonResponse([
					'status' => 'Error',
					'message' => 'Missing or invalid required fields.',
				], 400);
			}

			// Create a new "event" node
			$node = Node::create([
				'type' => 'event',
				'title' => $title,
				'field_description' => $description,
				'field_event_date' => $event_date,
				'field_location' => $location,
				'field_max_attendees' => $max_attendees,
				'status' => 1,
			]);
			$node->save();

			return new JsonResponse([
				'status' => 'Success',
				'message' => 'Event created successfully.',
				'result' => [
					'id' => $node->id(),
					'title' => $title,
					'description' => $description,
					'event_date' => $event_date,
					'location' => $location,
					'max_attendees' => $max_attendees,
				],
			], 201);
		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
  }

	/**
	 * Returns a JSON error response for an exception.
	 */
	private function exception_error_msg($message)
	{
		$this->logger->error($message);
		return new JsonResponse([
			'status' => 'Error',
			'message' => 'An unexpected error occurred.',
			'error' => $message,
		], 500);
	}

}
