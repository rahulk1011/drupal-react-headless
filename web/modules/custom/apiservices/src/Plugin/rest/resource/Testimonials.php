<?php

namespace Drupal\apiservices\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpFoundation\Request;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 * @RestResource(
 *   id = "testimonials_rest",
 *   label = @Translation("Testimonials API"),
 *   uri_paths = {
 *     "canonical" = "/api/testimonials",
 *     "create" = "/api/add-testimonial"
 *   }
 * )
 */

class Testimonials extends ResourceBase
{
	/**
	 * A current user instance which is logged in the session.
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $loggedUser;
	/**
	 * Constructs a Drupal\rest\Plugin\ResourceBase object.
	 *
	 * @param array $config
	 *   A configuration array which contains the information about the plugin instance.
	 * @param string $module_id
	 *   The module_id for the plugin instance.
	 * @param mixed $module_definition
	 *   The plugin implementation definition.
	 * @param array $serializer_formats
	 *   The available serialization formats.
	 * @param \Psr\Log\LoggerInterface $logger
	 *   A logger instance.
	 * @param \Drupal\Core\Session\AccountProxyInterface $current_user
	 *   A currently logged user instance.
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
			$container->get('logger.factory')->get('testimonials_api'),
			$container->get('current_user')
		);
	}

	/*
    * Get All Testimonials API
    */
	public function get(Request $request)
	{
		try {
			$testimonial_nids = \Drupal::entityQuery('node')
				->accessCheck(TRUE)
				->condition('type', 'client_testimonial')
				->condition('status', 1)
				->execute();

			$testimonial_nodes = Node::loadMultiple($testimonial_nids);
			$testimonial_data = [];

			foreach ($testimonial_nodes as $node) {
				$testimonial_fid = $node->get('field_content_image')->target_id;
        $testimonial_image = File::load($testimonial_fid);

				$testimonial_data[] = [
					'id' => $node->id(),
					'title' => $node->getTitle(),
					'client_name' => $node->get('field_client_name')->value ?? '',
					'description' => $node->get('field_description')->value ?? '',
					'testimonial_img' => \Drupal::service('file_url_generator')->generateAbsoluteString($testimonial_image->getFileUri())
				];
			}

			return new JsonResponse([
				'status' => 'Success',
				'message' => 'Testimonials',
				'result' => $testimonial_data,
			]);
		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
	}

	/**
	 * Creates a new client_testimonial "testimonial" node with required image file upload. Admin-only.
	 * Route: POST /api/add-testimonial
	 */
	public function post(Request $request)
	{
		if ($this->loggedUser->isAnonymous() || !in_array('administrator', $this->loggedUser->getRoles(), TRUE)) {
			return new JsonResponse([
				'status' => 'Error',
				'message' => 'Administrator access required to create testimonials.',
			], 403);
		}

		try {
			$data = json_decode($request->getContent(), TRUE) ?: [];
			$title = trim($data['title'] ?? '');
			$client_name = trim($data['client_name'] ?? '');
			$description = trim($data['description'] ?? '');
			$base64_image = $data['image'] ?? '';
			$image_name = trim($data['image_name'] ?? 'testimonial.jpg');

			// Validate mandatory fields
			if (empty($title) || empty($client_name) || empty($description) || empty($base64_image) ) {
				return new JsonResponse([
					'status' => 'Error',
					'message' => 'Missing required fields: Title, Client Name, Description and Image are mandatory.',
				], 400);
			}

			// Decode and process Base64 image
			$file_id = NULL;
			if (preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
				$image_data = substr($base64_image, strpos($base64_image, ',') + 1);
				$decoded_data = base64_decode($image_data);

				if ($decoded_data !== FALSE) {
					$directory = 'public://testimonial-images';
					\Drupal::service('file_system')->prepareDirectory(
						$directory,
						FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS
					);
					$file_uri = \Drupal::service('file_system')->saveData(
						$decoded_data,
						$directory . '/' . $image_name,
						FileSystemInterface::EXISTS_RENAME
					);
					if ($file_uri) {
						$file = File::create([
							'uri' => $file_uri,
							'uid' => $this->loggedUser->id(),
							'status' => 1,
						]);
						$file->save();
						$file_id = $file->id();
					}
				}
			}

			if (!$file_id) {
				return new JsonResponse([
					'status' => 'Error',
					'message' => 'Failed to process and save uploaded image.',
				], 400);
			}

			// Build node data payload
			$node_data = [
				'type' => 'client_testimonial',
				'title' => $title,
				'field_client_name' => $client_name,
				'field_description' => $description,
				'status' => 1,
				'field_content_image' => [
					'target_id' => $file_id,
					'alt' => $title,
				],
			];

			$node = Node::create($node_data);
			$node->save();

			// Resolve image URL for response
			$file_entity = File::load($file_id);
			$image_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file_entity->getFileUri());

			return new JsonResponse([
				'status' => 'Success',
				'message' => 'Testimonial created successfully.',
				'result' => [
					'id' => $node->id(),
					'title' => $node->getTitle(),
					'client_name' => $client_name,
					'description' => $description,
					'testimonial_img' => $image_url,
				],
			], 201);
		} catch (\Exception $exception) {
			return $this->exception_error_msg($exception->getMessage());
		}
	}

	/**
	 * Returns a JSON error response for an exception.
	 *
	 * @param string $message
	 *   The exception message.
	 *
	 * @return \Symfony\Component\HttpFoundation\JsonResponse
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
